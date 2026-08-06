import { createDb } from "@faber-web/db";
import { contactSubmission } from "@faber-web/db/schema/contact";
import { env } from "@faber-web/env/server";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { publicProcedure } from "../index";
import { verifyTurnstileToken } from "../lib/turnstile";

const projectTypes = [
  "Website",
  "Web app",
  "E-commerce",
  "Redesign",
  "Other",
] as const;

const budgets = [
  "Under £5k",
  "£5k–£15k",
  "£15k–£50k",
  "£50k+",
  "Not sure",
] as const;

const contactInput = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.email().max(320),
  company: z.string().trim().max(200).optional(),
  projectType: z.enum(projectTypes),
  budget: z.enum(budgets),
  message: z.string().trim().min(1).max(5000),
  turnstileToken: z.string().min(1).max(2048),
});

export const contactRouter = {
  submit: publicProcedure
    .input(contactInput)
    .handler(async ({ input, context }) => {
      await verifyTurnstileToken(input.turnstileToken, context.clientIp);

      const id = crypto.randomUUID();
      const company = input.company?.trim() ? input.company.trim() : null;

      const database = createDb();
      await database.insert(contactSubmission).values({
        id,
        name: input.name,
        email: input.email,
        company,
        projectType: input.projectType,
        budget: input.budget,
        message: input.message,
      });

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.CONTACT_FROM_EMAIL,
          to: [env.CONTACT_TO_EMAIL],
          reply_to: input.email,
          subject: `New web development enquiry — ${input.projectType}`,
          text: [
            `Name: ${input.name}`,
            `Email: ${input.email}`,
            `Company: ${company ?? "—"}`,
            `Project type: ${input.projectType}`,
            `Budget: ${input.budget}`,
            "",
            input.message,
          ].join("\n"),
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (!emailResponse.ok) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to send notification email",
        });
      }

      return { ok: true as const };
    }),
};
