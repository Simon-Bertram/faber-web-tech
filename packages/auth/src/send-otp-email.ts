const AUTH_FROM_EMAIL = "contact@faberwebtech.com";
const AUTH_FROM_NAME = "Faber Web Tech";

export type OtpEmailType =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email";

function otpSubject(type: OtpEmailType): string {
  if (type === "sign-in") {
    return "Your sign-in code";
  }
  if (type === "email-verification") {
    return "Verify your email";
  }
  if (type === "forget-password") {
    return "Reset your password";
  }
  if (type === "change-email") {
    return "Confirm your email change";
  }
  return "Your verification code";
}

function otpPurpose(type: OtpEmailType): string {
  if (type === "sign-in") {
    return "sign in";
  }
  if (type === "forget-password") {
    return "reset your password";
  }
  if (type === "change-email") {
    return "confirm your email change";
  }
  return "verify your email";
}

function otpBody(
  otp: string,
  type: OtpEmailType
): { html: string; text: string } {
  const purpose = otpPurpose(type);
  const text = `Your Faber Web Tech code to ${purpose} is ${otp}. It expires in 5 minutes. If you did not request this, you can ignore this email.`;
  const html = `<p>Your Faber Web Tech code to ${purpose} is <strong>${otp}</strong>.</p><p>It expires in 5 minutes. If you did not request this, you can ignore this email.</p>`;
  return { html, text };
}

export async function sendOtpEmail(
  emailBinding: SendEmail,
  params: { email: string; otp: string; type: OtpEmailType }
): Promise<void> {
  const { html, text } = otpBody(params.otp, params.type);
  await emailBinding.send({
    from: { email: AUTH_FROM_EMAIL, name: AUTH_FROM_NAME },
    html,
    subject: otpSubject(params.type),
    text,
    to: params.email,
  });
}
