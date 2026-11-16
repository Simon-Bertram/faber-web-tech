import { ActionError, defineAction } from "astro:actions";
import { env } from "cloudflare:workers";
import { z } from "astro/zod";
import {
  buildContactLeadEmail,
  CONTACT_FROM_NAME,
  CONTACT_INBOX,
} from "../lib/contact-lead-email";
import {
  BUDGET_VALUES,
  PROJECT_TYPE_VALUES,
  TIMELINE_VALUES,
} from "../lib/contact-options";
import { verifyTurnstileToken } from "../lib/verify-turnstile";

const SEND_FAILED_MESSAGE = "Unable to send your message. Please try again.";
const TURNSTILE_DENIED_MESSAGE = "Bot verification failed. Please try again.";
const CONTACT_TURNSTILE_ACTION = "contact";

function getEmailBinding() {
  return env.EMAIL;
}

function formText(schema) {
  return z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    schema
  );
}

function getEmailErrorCode(error) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return;
  }

  const { code } = error;
  return typeof code === "string" ? code : undefined;
}

export const server = {
  contact: defineAction({
    accept: "form",
    handler: async (input, context) => {
      const { log } = context.locals;

      // Bots fill hidden honeypot fields; pretend success so they get no signal.
      if (input.company_website.trim() !== "") {
        log.set({
          action: "contact.submit",
          outcome: "honeypot",
        });
        return { submitted: true };
      }

      const turnstile = await verifyTurnstileToken({
        allowedHostnames: env.TURNSTILE_HOSTNAMES ?? "",
        expectedAction: CONTACT_TURNSTILE_ACTION,
        remoteip: context.request.headers.get("cf-connecting-ip"),
        secret: env.TURNSTILE_SECRET ?? "",
        token: input["cf-turnstile-response"],
      });

      if (!turnstile.ok) {
        log.set({
          action: "contact.submit",
          outcome: "turnstile_denied",
          reason: turnstile.reason,
        });
        throw new ActionError({
          code: "FORBIDDEN",
          message: TURNSTILE_DENIED_MESSAGE,
        });
      }

      const email = getEmailBinding();

      if (!email) {
        log.set({
          action: "contact.submit",
          outcome: "error",
          reason: "missing-binding",
        });
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: SEND_FAILED_MESSAGE,
        });
      }

      const lead = {
        budget: input.budget,
        company: input.company,
        email: input.email,
        goals: input.goals,
        name: input.name,
        projectType: input.projectType,
        timeline: input.timeline,
      };
      const { html, subject, text } = buildContactLeadEmail(lead);

      try {
        const { messageId } = await email.send({
          from: { email: CONTACT_INBOX, name: CONTACT_FROM_NAME },
          html,
          replyTo: { email: lead.email, name: lead.name },
          subject,
          text,
          to: CONTACT_INBOX,
        });

        log.set({
          action: "contact.submit",
          messageId,
          outcome: "success",
          projectType: lead.projectType,
        });

        return { submitted: true };
      } catch (error) {
        log.set({
          action: "contact.submit",
          emailErrorCode: getEmailErrorCode(error),
          outcome: "error",
          projectType: lead.projectType,
        });
        const cause = error instanceof Error ? error : new Error(String(error));
        log.error(cause);
        const actionError = new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: SEND_FAILED_MESSAGE,
        });
        actionError.cause = cause;
        throw actionError;
      }
    },
    input: z.object({
      budget: formText(z.enum(BUDGET_VALUES)),
      "cf-turnstile-response": formText(z.string().min(1).max(2048)),
      company: formText(z.string().trim().max(120)),
      company_website: formText(z.string().max(200)),
      email: formText(
        z.email({ error: "Please enter a valid email address." })
      ),
      goals: formText(
        z
          .string()
          .trim()
          .min(10, "Please share a bit more about what you want to achieve.")
          .max(5000)
      ),
      name: formText(
        z.string().trim().min(1, "Please enter your name.").max(120)
      ),
      projectType: formText(
        z.enum(PROJECT_TYPE_VALUES, {
          error: "Please choose a project type.",
        })
      ),
      timeline: formText(z.enum(TIMELINE_VALUES)),
    }),
  }),
};
