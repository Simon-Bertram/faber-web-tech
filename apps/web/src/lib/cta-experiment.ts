export const CTA_EXPERIMENT_ID = "cta_offer_friction_v1" as const;

export const CTA_COOKIE_NAME = "fwt_exp_cta_v1" as const;
export const CTA_EXCLUDE_COOKIE = "fwt_exp_exclude" as const;

export const CTA_VARIANTS = ["control", "variant"] as const;
export type CtaVariant = (typeof CTA_VARIANTS)[number];

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface CtaOfferPackage {
  bannerSupport: string;
  buttonLabel: string;
  eyebrow: string;
  heading: string;
  href: string;
  lede: string;
  offerName: string;
  submitLabel: string;
}

export const CTA_PACKAGES: Record<CtaVariant, CtaOfferPackage> = {
  control: {
    bannerSupport:
      "No obligation — a focused look at what's costing you enquiries.",
    buttonLabel: "Book a 15-minute website review",
    eyebrow: "Website review",
    heading: "Book a focused 15-minute review of your site.",
    href: "/contact?src=cta_control",
    lede: "Share your URL and what you want the site to achieve. We'll hop on a short, no-obligation call and walk through what's slowing you down or losing enquiries — with a clear next step afterward.",
    offerName: "15-minute website review",
    submitLabel: "Book my website review",
  },
  variant: {
    bannerSupport: "Concrete teardown of speed, UX, and architecture gaps.",
    buttonLabel: "Request a free site audit",
    eyebrow: "Free site audit",
    heading: "Request a free performance and architecture audit.",
    href: "/contact?src=cta_variant",
    lede: "Send your site and goals. You'll get a concrete teardown of speed, UX, and architecture gaps — so you know what's worth fixing before you commit to a build.",
    offerName: "Free site audit",
    submitLabel: "Request my free audit",
  },
} as const;

export function parseCtaVariant(
  value: string | undefined
): CtaVariant | undefined {
  if (value === "control" || value === "variant") {
    return value;
  }
}

export function isCtaExcluded(excludeValue: string | undefined): boolean {
  return excludeValue === "1";
}

export function pickCtaVariant(): CtaVariant {
  return Math.random() < 0.5 ? "control" : "variant";
}

export function getCtaOfferPackage(variant: CtaVariant): CtaOfferPackage {
  return CTA_PACKAGES[variant];
}

export function getCtaCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure,
  };
}
