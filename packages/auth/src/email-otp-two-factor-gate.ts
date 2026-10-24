import { isAdminEmail } from "@faber-web/env/admin";
import { createAuthMiddleware } from "better-auth/api";
import { deleteSessionCookie } from "better-auth/cookies";
import { generateRandomString } from "better-auth/crypto";

const TWO_FACTOR_COOKIE_NAME = "two_factor";
const TWO_FACTOR_TABLE = "twoFactor";
const TWO_FACTOR_COOKIE_MAX_AGE_SECONDS = 600;

/**
 * Better Auth only challenges 2FA on credential sign-in paths. This after-hook
 * mirrors that challenge for `/sign-in/email-otp` when the user is an allowlisted
 * admin with TOTP enabled.
 */
export function createEmailOtpTwoFactorAfterHook(adminEmails: string) {
  return createAuthMiddleware(async (ctx) => {
    if (ctx.path !== "/sign-in/email-otp") {
      return;
    }

    const data = ctx.context.newSession;
    if (!data?.user.twoFactorEnabled) {
      return;
    }
    if (!isAdminEmail(data.user.email, adminEmails)) {
      return;
    }

    deleteSessionCookie(ctx, true);
    await ctx.context.internalAdapter.deleteSession(data.session.token);
    ctx.context.setNewSession(null);

    const twoFactorCookie = ctx.context.createAuthCookie(
      TWO_FACTOR_COOKIE_NAME,
      { maxAge: TWO_FACTOR_COOKIE_MAX_AGE_SECONDS }
    );
    const identifier = `2fa-${generateRandomString(20)}`;
    const expiresAt = new Date(
      Date.now() + TWO_FACTOR_COOKIE_MAX_AGE_SECONDS * 1000
    );

    await ctx.context.internalAdapter.createVerificationValue({
      expiresAt,
      identifier,
      value: data.user.id,
    });
    await ctx.context.internalAdapter.createVerificationValue({
      expiresAt,
      identifier: `2fa-attempts-${identifier}`,
      value: "0",
    });
    await ctx.setSignedCookie(
      twoFactorCookie.name,
      identifier,
      ctx.context.secret,
      twoFactorCookie.attributes
    );

    const userTotpSecret = await ctx.context.adapter.findOne({
      model: TWO_FACTOR_TABLE,
      where: [{ field: "userId", value: data.user.id }],
    });
    const twoFactorMethods: string[] = [];
    if (
      userTotpSecret &&
      (userTotpSecret as { verified?: boolean }).verified !== false
    ) {
      twoFactorMethods.push("totp");
    }

    return ctx.json({
      twoFactorMethods,
      twoFactorRedirect: true,
    });
  });
}
