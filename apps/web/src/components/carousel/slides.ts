export interface HeroSlide {
  accentBg: string;
  accentColor: string;
  badgeColor: string;
  description: string;
  id: string;
  previewType: "architecture" | "automation" | "performance" | "visibility";
  primaryCtaLink: string;
  primaryCtaText: string;
  secondaryCtaLink: string;
  secondaryCtaText: string;
  tier: string;
  title: string;
}

export const slides: HeroSlide[] = [
  {
    accentBg: "var(--primary-container)",
    accentColor: "var(--primary)",
    badgeColor:
      "text-[var(--primary)] border-[var(--primary)]/30 bg-[var(--primary-container)]",
    description:
      "Speed is revenue. We engineer ultra-fast marketing websites with modern static and edge rendering architectures, achieving flawless 100/100 Core Web Vitals and maximum conversion rates.",
    id: "modern-websites",
    previewType: "performance",
    primaryCtaLink: "/#contact",
    primaryCtaText: "Start Your Website",
    secondaryCtaLink: "/#modern-websites",
    secondaryCtaText: "Explore Architecture",
    tier: "01 // MODERN WEBSITES",
    title: "High-Performance Websites that Make your Business Stand Out",
  },
  {
    accentBg: "var(--secondary-container)",
    accentColor: "var(--secondary)",
    badgeColor:
      "text-[var(--secondary)] border-[var(--secondary)]/30 bg-[var(--secondary-container)]",
    description:
      "Transform your vision into high-scale software. Built on modern edge infrastructure (Cloudflare Workers, Hono, oRPC, Drizzle D1), delivering sub-50ms global latency, end-to-end type safety, and real-time responsiveness.",
    id: "web-apps",
    previewType: "architecture",
    primaryCtaLink: "/#contact",
    primaryCtaText: "Build Your App",
    secondaryCtaLink: "/#web-apps",
    secondaryCtaText: "Review Stack",
    tier: "02 // WEB APPS",
    title: "Full-Stack Web Apps that Scale with your Business",
  },
  {
    accentBg: "var(--tertiary-container)",
    accentColor: "var(--tertiary)",
    badgeColor:
      "text-[var(--tertiary)] border-[var(--tertiary)]/30 bg-[var(--tertiary-container)]",
    description:
      "Automate manual bottlenecks and multiply human output. We develop autonomous agentic pipelines, tailored LLM integrations, and self-healing business automations with strict validation and enterprise data security.",
    id: "ai-automation",
    previewType: "automation",
    primaryCtaLink: "/#contact",
    primaryCtaText: "Automate Your Business",
    secondaryCtaLink: "/#ai-automation",
    secondaryCtaText: "Explore AI Solutions",
    tier: "03 // INTELLIGENCE & AUTOMATION",
    title: "Intelligent Workflows & Custom LLM Systems",
  },
  {
    accentBg: "var(--quaternary-container)",
    accentColor: "var(--quaternary)",
    badgeColor:
      "text-[var(--quaternary)] border-[var(--quaternary)]/30 bg-[var(--quaternary-container)]",
    description:
      "Customers now ask ChatGPT, not just Google. We get your business ranked in search and recommended by AI tools like ChatGPT, Perplexity, Gemini, and Google AI Overviews — so the right people find you either way.",
    id: "seo-geo",
    previewType: "visibility",
    primaryCtaLink: "/#contact",
    primaryCtaText: "Start SEO & GEO",
    secondaryCtaLink: "/#seo-geo",
    secondaryCtaText: "Explore Visibility",
    tier: "04 // SEO & GEO",
    title: "Get Found by Google — and Recommended by AI",
  },
];
