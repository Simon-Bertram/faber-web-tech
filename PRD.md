# Product Requirements Document (PRD)

**Product:** Faber Web — developer portfolio, lead generation, and client portal  
**Document version:** 1.0  
**Status:** Living checklist (reflects the codebase)  
**Primary domain:** [faberwebtech.com](https://faberwebtech.com)

This document collates features by version. Checkboxes mark shipped (`[x]`) vs outstanding (`[ ]`). Update statuses as work lands. Schema source of truth remains [`packages/db/src/schema`](packages/db/src/schema) — do not treat illustrative SQL in older drafts as authoritative.

---

## 1. Vision

Establish a high-conversion, edge-native web presence that advertises bespoke technical services and doubles as a proof of modern web engineering. The authenticated portal gives clients transparent project tracking and differentiates the practice from competitors.

**Primary headline (live):** “Your website should be your most relentless employee. Right now, you're doing its job.”

An earlier strapline (“Modern web tech to boost your business.”) is superseded.

---

## 2. Service pillars

| Pillar | Description | Target outcomes |
| --- | --- | --- |
| **Modern Websites** | Lightning-fast, content-driven, SEO-oriented business sites on modern edge/static architecture. | Sub-second loads, 95+ Core Web Vitals, accessible UI, static-edge delivery. |
| **Web Apps** | Interactive full-stack applications and SaaS MVPs. | Type-safe client/server contracts, relational data, secure sessions, edge latency. |
| **AI Automation** | Practical LLM integrations, agent workflows, and backend task automation — reliability over ambition. | Validated workflows first; agents only when the work needs them. |
| **SEO & GEO** | Rank in search and get recommended by AI answer surfaces (ChatGPT, Perplexity, Gemini, AI Overviews). | Discoverability across classic search and generative engines. |

Three-pillar drafts that omit SEO & GEO are superseded.

---

## 3. Technical architecture

| Layer | Choice |
| --- | --- |
| Frontend | Astro (SSG/SSR hybrid, Islands for interactive widgets) |
| Backend | Hono on Cloudflare Workers |
| Typed API | oRPC |
| Database | Cloudflare D1 + Drizzle ORM |
| Auth | Better-Auth (sessions, roles, admin 2FA) |
| Bot verification | Cloudflare Turnstile |
| Email | Cloudflare Email Sending (contact lead notifications) |
| Observability | Evlog (structured events → drain, e.g. Axiom) |
| Infra | Alchemy (`packages/infra`) |

---

## 4. Success metrics (KPIs)

| Metric | Target | Notes |
| --- | --- | --- |
| Speed & performance | Sub-1s perceived load; ≥95 Lighthouse (desktop & mobile) | Stated on the marketing site as a guarantee. |
| Accessibility | WCAG **2.2** AA | Prefer 2.2 over mixed 2.1/2.2 wording in older drafts. |
| Monthly qualified leads | ≥10 / month via contact (+ questionnaire once shipped) | Business target. |
| CTA experiment | Primary: enquiry rate by assigned variant | See [`docs/cta-experiment.md`](docs/cta-experiment.md). Active until a winner is chosen. |
| Questionnaire completion | ≥5% of unique visitors who **start** the questionnaire complete and capture email | Applies after the AI Business Booster ships; does not replace the CTA experiment. |

---

## 5. Personas & journeys (adapted)

### Efficiency-Seeking Eddie (SMB owner/operator)

Pain: admin overhead, curiosity about AI without a clear first step.

1. Lands on homepage; reads headline and outcome-focused hero.
2. Reviews service pillars (including AI Automation and SEO & GEO).
3. **(Outstanding)** Completes the AI Business Booster questionnaire and unlocks a short recommendation after email capture.
4. Or books via the primary CTA / contact form (budget + timeline).

### Founder Fiona (startup / technical lead)

Pain: needs speed, modern serverless stack, no legacy bloat.

1. Notices load performance and stack proof points.
2. Digs into Solutions / Web Apps / AI pages.
3. Submits contact with project type, budget, and timeline.
4. After engagement, uses the client portal for milestones and requirements.

---

## 6. Design & UX guidelines

- Mobile-first; touch targets ≥48×48px where interactive.
- High contrast (≥4.5:1 for normal text); keyboard-navigable forms; ARIA for carousel and multi-step flows.
- Light/dark themes via CSS variables; default `prefers-color-scheme`; manual toggle persists in `localStorage`.

---

## 7. Feature checklist

### v1 — Marketing & conversion (shipped)

- [x] Homepage with outcome-focused hero and guarantees
- [x] Hero slideshow / carousel covering all four service pillars
- [x] Solutions overview (`/solutions`) with section anchors
- [x] AI Applications page (`/ai-applications`)
- [x] About, Contact, Privacy
- [x] Theme switcher (system preference + `localStorage`)
- [x] Contact form: name, email, project type, budget, timeline, message
- [x] Spam mitigation: Turnstile + honeypot (`company_website`)
- [x] Lead notification via Cloudflare Email (Astro action)
- [x] CTA offer friction experiment (`cta_offer_friction_v1`) with Evlog attribution
- [x] Experiment opt-out page

### v1 — Auth & client portal (shipped)

Portal was drafted as “v2” in an earlier PRD; it is **already in product**.

- [x] Better-Auth sign-up / sign-in / session handling
- [x] Admin role gating and admin 2FA flows
- [x] Client profiles, projects, project access
- [x] Milestones and requirements (admin + client views)
- [x] Client dashboard and project detail pages
- [x] Portal settings

### v1 — Outstanding

- [ ] **AI Business Booster questionnaire** — 3–4 progressive steps on operational bottlenecks / stack; client + server validation; email gate; show tailored recommendation; persist to D1 `ai_questionnaire_leads`
- [ ] **D1 `contact_inquiries`** — persist contact submissions aligned with the live form (including budget and timeline), in addition to email notification
- [ ] **Lead status workflow** — e.g. `new` → `reviewed` → `contacted` → `archived` for inquiries (and questionnaire leads as appropriate)
- [ ] Wire questionnaire conversion KPI once the feature is live (do not retire the CTA experiment solely because the questionnaire ships)

### v2 — Content & portal depth

- [ ] Case studies / content collections (or headless CMS) with verified metrics and testimonials
- [ ] Portal invoicing / billing visibility (optional; only if still desired)

### Out of scope (separate PRD)

- [ ] Standalone multi-tenant AI lead-generation micro-SaaS on Cloudflare edge

---

## 8. Data model notes (outstanding v1)

Illustrative shapes for **new** lead tables. Match project conventions (timestamp_ms, id helpers) when implementing; extend fields to cover budget/timeline on contact.

**`contact_inquiries` (planned)** — name, email, service/project type, budget, timeline, message, status, createdAt; optional experiment/variant attribution.

**`ai_questionnaire_leads` (planned)** — email, bottleneck, manualTasks, softwareUsed (or equivalent answer keys), aiRecommendationStrategy, contacted, createdAt.

**Auth & portal** — already defined in [`packages/db/src/schema/auth.ts`](packages/db/src/schema/auth.ts) and [`packages/db/src/schema/portal.ts`](packages/db/src/schema/portal.ts). Do not reintroduce conflicting hand-written Better-Auth table definitions from older drafts.

---

## 9. How to maintain this document

1. When shipping a checklist item, flip `[ ]` → `[x]` and note the PR or date in the commit message if useful.
2. Add new ideas under the appropriate version; prefer a new version section over bloating v1.
3. Resolve conflicts with the live product by updating this file — the codebase and this PRD should agree.
4. Keep deep runbooks in `docs/` (e.g. Turnstile, logging, CTA experiment); link from here rather than duplicating.
