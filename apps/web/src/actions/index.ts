import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import {
  buildContactLeadEmail,
  CONTACT_FROM_NAME,
  CONTACT_INBOX,
} from "../lib/contact-lead-email";

const SEND_FAILED_MESSAGE = "Unable to send your message. Please try again.";

function getEmailBinding(locals: App.Locals): SendEmail | undefined {
  return locals.runtime?.env.EMAIL;
}

function formText<Schema extends z.ZodType>(schema: Schema) {
  return z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    schema
  );
}

function getEmailErrorCode(error: unknown): string | undefined {
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

      if (input.company_website.trim() !== "") {
        log.set({
          action: "contact.submit",
          outcome: "honeypot",
        });
        return { submitted: true as const };
      }

      const email = getEmailBinding(context.locals);

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

        return { submitted: true as const };
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
      budget: formText(
        z.enum(["", "under-5k", "5k-15k", "15k-40k", "40k-plus", "not-sure"])
      ),
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
        z.enum(["website", "web-app", "ai-automation", "not-sure"], {
          error: "Please choose a project type.",
        })
      ),
      timeline: formText(
        z.enum(["", "asap", "1-3-months", "3-6-months", "exploring"])
      ),
    }),
  }),
};
