export interface TechFeature {
  description: string;
  title: string;
}

export interface TechWhy {
  features: TechFeature[];
  headline: string;
  lead: string;
}

export interface Technology {
  docsUrl: string;
  name: string;
  role: string;
  slug: string;
  why: TechWhy;
}

export const technologies: Technology[] = [
  {
    docsUrl: "https://astro.build/",
    name: "Astro",
    role: "Edge-First Islands & SSG",
    slug: "astro",
    why: {
      features: [
        {
          description:
            "Pages are assembled on the server and arrive as lightweight HTML. Visitors see content immediately, without waiting for a heavy app to boot in the browser. Zero JavaScript by default.",
          title: "Server-First",
        },
        {
          description:
            "Built to work with your content wherever it lives — local files, an API, or your favourite CMS — so marketing pages and blogs stay easy to update without fighting the framework.",
          title: "Content-Driven",
        },
        {
          description:
            "Bring the UI libraries, CSS tools, and integrations your team already knows. You get a modern foundation without locking into a single vendor's way of building.",
          title: "Customizable",
        },
        {
          description:
            "Interactive pieces load only where they are needed. That unique approach protects Core Web Vitals, search rankings, and conversion rates that bloated single-page apps often sacrifice.",
          title: "Astro Islands",
        },
        {
          description:
            "Built-in image tools serve modern formats and prevent layout jump as media loads — a quiet detail that keeps pages looking polished and scoring well in search.",
          title: "Optimised Images",
        },
        {
          description:
            "Reusable building blocks mean consistent design, faster delivery of new pages, and safer changes as the site grows — without rewriting everything from scratch.",
          title: "Build Using Components",
        },
      ],
      headline: "Why Astro",
      lead: "Astro ships marketing pages as fast HTML first, then adds interactivity only where it earns its keep — so your site feels instant, ranks better, and converts more visitors.",
    },
  },
  {
    docsUrl: "https://www.cloudflare.com/products/workers/",
    name: "Cloudflare Workers",
    role: "Global Edge Runtime",
    slug: "cloudflare-workers",
    why: {
      features: [
        {
          description:
            "Code runs in data centres near your visitors worldwide. Someone in London and someone in Sydney both get a snappy response instead of waiting on a single distant server.",
          title: "Near Your Audience",
        },
        {
          description:
            "No traditional servers to patch, scale, or babysit. Capacity expands with traffic so a campaign spike does not take the site down at the worst moment.",
          title: "Serverless Scale",
        },
        {
          description:
            "The same global network that protects and accelerates millions of sites also hosts your app logic — fewer moving parts between the visitor and a reliable experience.",
          title: "One Trusted Network",
        },
        {
          description:
            "Forms, portals, and APIs respond quickly because work happens at the edge, not after a long round trip to a central machine room.",
          title: "Low Latency by Design",
        },
        {
          description:
            "You pay for what you use and avoid the cost of idle infrastructure — practical for growing businesses that need enterprise reach without enterprise ops overhead.",
          title: "Efficient to Run",
        },
      ],
      headline: "Why Cloudflare Workers",
      lead: "Your site and APIs run on Cloudflare's global edge — close to visitors, resilient under load, and free of the usual server maintenance tax.",
    },
  },
  {
    docsUrl: "https://hono.dev/",
    name: "Hono",
    role: "Ultrafast Edge API",
    slug: "hono",
    why: {
      features: [
        {
          description:
            "A small, focused toolkit for APIs means less overhead between a click and a response — contact forms, dashboards, and app features feel immediate.",
          title: "Built for Speed",
        },
        {
          description:
            "Designed to run cleanly on edge platforms like Cloudflare Workers, so your backend lives where your visitors already are.",
          title: "Edge-Native",
        },
        {
          description:
            "Clear routing and middleware keep APIs organised as features grow — easier to extend without turning the backend into a tangle.",
          title: "Simple Structure",
        },
        {
          description:
            "Works across modern runtimes, so the same approach stays viable as hosting options evolve instead of forcing a rewrite later.",
          title: "Portable Foundation",
        },
        {
          description:
            "Less framework ceremony means faster delivery of the endpoints your product actually needs — not weeks spent configuring tooling.",
          title: "Ship Features Faster",
        },
      ],
      headline: "Why Hono",
      lead: "Hono is the lean API layer that sits on the edge: quick responses for forms, portals, and app features without a bloated backend stack.",
    },
  },
  {
    docsUrl: "https://orpc.dev/",
    name: "oRPC",
    role: "Typesafe APIs, made simple",
    slug: "orpc",
    why: {
      features: [
        {
          description:
            "Frontend and backend share the same contract for what data looks like. Mismatches are caught early — before a customer hits a broken form or empty dashboard.",
          title: "One Shared Contract",
        },
        {
          description:
            'When the API changes, TypeScript surfaces the impact across the app. Safer refactors as the product grows, with fewer silent "it worked yesterday" bugs.',
          title: "Safer Changes",
        },
        {
          description:
            "Less hand-written glue between screens and servers. Teams spend time on product behaviour instead of stitching endpoints together by hand.",
          title: "Less Boilerplate",
        },
        {
          description:
            "Clear, documented procedures make it easier for future you — or a collaborator — to understand how the system talks to itself.",
          title: "Readable by Design",
        },
        {
          description:
            "Fits naturally with modern web stacks, so end-to-end type safety does not require a separate, fragile toolchain.",
          title: "Modern Web Fit",
        },
      ],
      headline: "Why oRPC",
      lead: "oRPC keeps the frontend and API in sync with typed contracts — fewer integration bugs, clearer APIs, and safer changes as your product evolves.",
    },
  },
  {
    docsUrl: "https://react.dev/",
    name: "React",
    role: "Frontend Framework",
    slug: "react",
    why: {
      features: [
        {
          description:
            "Rich interfaces — dashboards, wizards, live forms — use a battle-tested library with a huge ecosystem of patterns and talent.",
          title: "Interactive Where It Matters",
        },
        {
          description:
            "Paired with Astro islands, React loads only on the parts of the page that need it. The rest of the site stays light and fast.",
          title: "Islands, Not Monoliths",
        },
        {
          description:
            "Component-driven UI makes complex client experiences consistent and maintainable instead of a pile of one-off scripts.",
          title: "Reusable UI",
        },
        {
          description:
            "A widely known skill set means future updates are easier to staff and review — you are not betting the product on an obscure niche tool.",
          title: "Industry Standard",
        },
        {
          description:
            "Mature tooling for accessibility, testing, and state helps client portals feel polished and trustworthy under real use.",
          title: "Production-Ready Ecosystem",
        },
      ],
      headline: "Why React",
      lead: "React powers the interactive pieces — client portals, forms, live UI — without forcing every marketing page to download a heavyweight app.",
    },
  },
  {
    docsUrl: "https://tailwindcss.com/",
    name: "Tailwindcss",
    role: "CSS Framework",
    slug: "tailwindcss",
    why: {
      features: [
        {
          description:
            "Design decisions become a shared vocabulary of spacing, type, and colour — pages look coherent instead of slightly different on every screen.",
          title: "Consistent Visual System",
        },
        {
          description:
            "Layouts and brand tweaks happen in the markup you already touch. Faster iteration when a campaign or redesign cannot wait on a CSS rewrite.",
          title: "Rapid Iteration",
        },
        {
          description:
            "Unused styles are stripped at build time, so visitors are not downloading a giant unused stylesheet from years of accumulated CSS.",
          title: "Lean by Default",
        },
        {
          description:
            "Responsive behaviour is expressed clearly in the same place as structure — mobile and desktop stay aligned without fighting separate stylesheets.",
          title: "Responsive Without Drama",
        },
        {
          description:
            "Theme tokens and utilities scale with the design system, so new pages inherit the brand instead of inventing one-off rules.",
          title: "Grows With the Brand",
        },
      ],
      headline: "Why Tailwind CSS",
      lead: "Tailwind keeps the UI consistent and quick to evolve — polished layouts without the sprawl of hand-maintained stylesheets that slow every change.",
    },
  },
  {
    docsUrl: "https://better-auth.com/",
    name: "Better-Auth",
    role: "Authentication",
    slug: "better-auth",
    why: {
      features: [
        {
          description:
            "Sign-in, sessions, and account flows use a dedicated auth library instead of home-grown shortcuts that become security liabilities.",
          title: "Security Without Reinvention",
        },
        {
          description:
            "Sensible defaults for cookies, sessions, and credentials reduce the chance of common auth mistakes that put customer data at risk.",
          title: "Trust-Minded Defaults",
        },
        {
          description:
            "Fits TypeScript stacks cleanly, so login and permissions stay typed and maintainable alongside the rest of the app.",
          title: "Fits the Modern Stack",
        },
        {
          description:
            "Plugins and patterns cover real product needs — email/password, sessions, and more — without bolting on a second vendor portal overnight.",
          title: "Ready for Real Products",
        },
        {
          description:
            "Clients get a smooth, familiar login experience while you keep control of branding and data instead of outsourcing identity entirely.",
          title: "Your Brand, Secure Access",
        },
      ],
      headline: "Why Better Auth",
      lead: "Better Auth handles sign-in and sessions with security-first defaults — so client portals feel trustworthy without reinventing authentication from scratch.",
    },
  },
];
