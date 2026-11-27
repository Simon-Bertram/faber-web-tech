import { ActionError, defineAction } from "astro:actions";
import { env } from "cloudflare:workers";
import { z } from "astro/zod";
import {
  buildContactLeadEmail,
  CONTACT_FROM_NAME,
  CONTACT_INBOX,
} from "../lib/contact-lead-email";
import {
  CTA_COOKIE_NAME,
  CTA_EXPERIMENT_ID,
  getCtaOfferPackage,
  parseCtaVariant,
} from "../lib/cta-experiment";
import { verifyTurnstileToken } from "../lib/verify-turnstile";

const SEND_FAILED_MESSAGE = "Unable to send your message. Please try again.";
const TURNSTILE_DENIED_MESSAGE = "Bot verification failed. Please try again.";
const CONTACT_TURNSTILE_ACTION = "contact";
const WEBSITE_URL_ERROR = "Please enter a valid website URL.";
const HAS_URL_PROTOCOL = /^https?:\/\//i;

function getEmailBinding(): SendEmail | undefined {
  return env.EMAIL;
}

function formText<Schema extends z.ZodType>(schema: Schema) {
  return z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    schema
  );
}

function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") {
    return "";
  }
  if (HAS_URL_PROTOCOL.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
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
      // Cookie is source of truth for experiment attribution — ignore client fields / ?src=.
      const ctaVariant = parseCtaVariant(
        context.cookies.get(CTA_COOKIE_NAME)?.value
      );
      const experimentFields = ctaVariant
        ? {
            experiment: CTA_EXPERIMENT_ID,
            variant: ctaVariant,
          }
        : {};

      // Bots fill hidden honeypot fields; pretend success so they get no signal.
      if (input.company_website.trim() !== "") {
        log.set({
          action: "contact.submit",
          outcome: "honeypot",
          ...experimentFields,
        });
        return { submitted: true as const };
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
          ...experimentFields,
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
          ...experimentFields,
        });
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: SEND_FAILED_MESSAGE,
        });
      }

      const offer = ctaVariant ? getCtaOfferPackage(ctaVariant) : undefined;
      const lead = {
        email: input.email,
        experimentOffer: offer?.offerName,
        experimentVariant: ctaVariant,
        message: input.message,
        name: input.name,
        website: input.website,
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
          ...experimentFields,
        });

        return { submitted: true as const };
      } catch (error) {
        log.set({
          action: "contact.submit",
          emailErrorCode: getEmailErrorCode(error),
          outcome: "error",
          ...experimentFields,
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
      "cf-turnstile-response": formText(z.string().min(1).max(2048)),
      company_website: formText(z.string().max(200)),
      email: formText(
        z.email({ error: "Please enter a valid email address." })
      ),
      message: formText(
        z
          .string()
          .trim()
          .min(10, "Please share a bit more about what you need help with.")
          .max(5000)
      ),
      name: formText(
        z.string().trim().min(1, "Please enter your name.").max(120)
      ),
      website: formText(
        z
          .string()
          .trim()
          .max(2048)
          .transform(normalizeWebsite)
          .pipe(
            z.union([z.literal(""), z.httpUrl({ error: WEBSITE_URL_ERROR })])
          )
      ),
    }),
  }),
};
