# Turnstile in this project — production vs local

Bot verification uses [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/). Treat **production** and **local** as different credential environments. Do not share a production widget with `localhost`.

## Mental model (three layers)

Turnstile is three independent controls, not one config knob:

1. **Widget Hostname Management** (Cloudflare dashboard / API) — which pages may *render* the widget for a given sitekey. The sitekey is public (it ships in HTML); this hostname list is the main client-side abuse control.
2. **Sitekey + secret pair** — a production pair versus Cloudflare’s **test** pair. They do not mix: the production secret rejects dummy tokens; the test secret rejects real tokens.
3. **Server siteverify checks** (`TURNSTILE_HOSTNAMES`, expected `action`) — after siteverify returns `success`, still require the returned hostname (and usually `action`) to match the deployment.

Spin / dashboard wizards often add `localhost` and `127.0.0.1` to the widget for “convenience.” That is wrong for a production widget. Cloudflare’s Spin guidance: **do not allow local hostnames in production.**

## The mistake this guide prevents

Putting `localhost` / `127.0.0.1` on the **production** widget domain list.

It feels helpful (the widget renders locally), but:

- Anyone can copy the public sitekey onto a page they control and mint tokens if localhost is allowlisted.
- Your server hostname check may still reject those tokens — so you are not “fully open” — but you expanded attack surface for free.
- Locally you often get the worst of both worlds: the widget renders, then siteverify fails if `TURNSTILE_HOSTNAMES` correctly excludes localhost.

**Correct local path:** Cloudflare’s official test keys. They work on any domain including localhost and need **no** widget Hostname Management.

## Environment matrix

| | Production | Local / Alchemy non-prod |
|---|---|---|
| Widget domains | `faberwebtech.com`, `www.faberwebtech.com` only | N/A (test sitekey needs no widget) |
| Sitekey | real widget (`PUBLIC_TURNSTILE_SITEKEY`) | `1x00000000000000000000AA` (always pass, visible) |
| Secret | Worker secret (`TURNSTILE_SECRET` / `TURNSTILE_SECRET_KEY`) | `1x0000000000000000000000000000000AA` |
| `TURNSTILE_HOSTNAMES` | `faberwebtech.com,www.faberwebtech.com` | `example.com` (test siteverify always returns this hostname) |
| `action` check | Required (`contact`, `auth`, …) | Skip when using the test secret — test siteverify **omits** `action` / `cdata` |

`faberwebtech.co.uk` is redirect-only to `.com`. Leave it off the widget and off `TURNSTILE_HOSTNAMES`. If it ever serves the site directly, add it to **both** together.

Optional later: a separate **staging** widget with staging hostnames — still never put localhost on the production sitekey.

## Pairing rule

If you trim localhost from the production widget, you **must** switch local to test keys (and the reverse hygiene still matters). Trim without repo/local test-key wiring breaks local. Repo changes without the trim leave the hygiene issue on the widget.

Preferred order when changing both: land local test keys first, then trim the widget, so local never has a broken window.

## Pre-merge checklist

- [ ] Production widget Hostname Management has **zero** local hostnames
- [ ] Production and local use **different** sitekey/secret pairs
- [ ] Local secrets are the Cloudflare test secret, not a copy of production
- [ ] Local `TURNSTILE_HOSTNAMES` expects `example.com`, not `localhost`
- [ ] Siteverify still requires `success` + hostname; action required in production
- [ ] Smoke: localhost cannot render the production widget; local forms succeed with test keys; production still enforces action + hostname

## Failure modes

| Symptom | Likely cause |
|---|---|
| Widget blank / domain error locally with prod sitekey | Production widget no longer allows localhost — switch to test sitekey |
| Local always fails verification after switching sitekey | Still using production secret — use the test secret too |
| Local `action-mismatch` / Better Auth captcha fail with test keys | Test siteverify omits `action` — skip action only for the test secret |
| Local `hostname-mismatch` | `TURNSTILE_HOSTNAMES` must include `example.com`, not `localhost` |

## Repo map

| Concern | Where |
|---|---|
| Local vs prod hostname defaults + prod sitekey env | `packages/infra/alchemy.run.ts` |
| Test/production key constants + hostname parse | `packages/env/src/turnstile.ts` |
| Public sitekey (Astro env) | `apps/web/astro.config.mjs` → `PUBLIC_TURNSTILE_SITEKEY` |
| Client render helpers | `apps/web/src/lib/turnstile.ts` |
| Contact form implicit widget | `apps/web/src/components/contact-form.astro` |
| Contact siteverify | `apps/web/src/lib/verify-turnstile.ts` |
| Auth captcha (Better Auth) | `packages/auth/src/index.ts` |

## Cloudflare docs

- [Testing](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) — test keys, `example.com`, omitted `action`
- [Hostname management](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/)
- [Spin](https://developers.cloudflare.com/turnstile/spin/) — do not allow local hostnames in production

When updating widget domains via Wrangler (`wrangler turnstile widget update`), the domain list is **replaced** entirely — always pass the full remaining list.
