# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Ojas** — a lead-to-sale funnel + storefront for a personalised Ayurvedic hair-oil brand (India / INR). Static single-file HTML pages plus one Vercel serverless function. **No build step, no package.json, no framework, no tests.** Everything is vanilla HTML/CSS/JS designed to deploy to Vercel as-is.

The business model (see `docs/FUNNEL-SYSTEM.md`): Meta/Instagram traffic → quiz captures a **lead** → email nurture → **sale** via Shopify. This repo is the funnel + storefront half; commerce (checkout, payments, subscriptions) is delegated to Shopify + Razorpay.

## Layout

```
index.html      Storefront HOMEPAGE / category hub (served at /)
quiz.html       The quiz funnel (served at /quiz) — the lead-gen engine, holds CONFIG
product.html    Product page (served at /product)
about|faq|contact.html               Marketing pages (served at /about, …)
privacy|terms|refund|shipping.html   Rendered policy pages (served at /privacy, …)
api/lead.js     Vercel serverless function: receives quiz leads, forwards to ESP
preview.py      Local dev server that reproduces vercel.json's clean URLs
content/legal/  Markdown source/drafts for the four policy pages
content/copy/   Storefront copy
content/email/  Klaviyo flow copy
docs/FUNNEL-SYSTEM.md   The product-agnostic operating manual
SETUP.md        "Built vs. fill-later" dependency checklist
vercel.json     cleanUrls + trailingSlash:false (so /quiz -> quiz.html)
.env.example    Names of the server-side secrets (values live in Vercel only)
```

Two things in the tree are **not** live code:

- `store/` is a **stale earlier copy** of the homepage/product page (pre-restructure, un-minified). The root `index.html` / `product.html` are canonical; ignore or delete `store/`.
- `.claude/worktrees/*/` contain **full copies of the repo** from other sessions. Repo-wide `grep`/`find` will return duplicate (and sometimes divergent) hits — exclude that path when searching.

The root policy pages and the `content/legal/*.md` drafts are **parallel copies**, not generated from each other. Editing one does not update the other; both still contain `[BRACKETS]` placeholders.

## Editing gotcha: the HTML is minified

The root pages are single-file and machine-dense — all CSS sits on one line and the JS on a handful of very long lines. Line counts are meaningless here; anchor edits on distinctive substrings, and expect a single "line" to be thousands of characters. `store/` and `api/lead.js` are the only readably-formatted sources.

## Running & deploying

No build/lint/test commands exist. Preview with **`python3 preview.py`** (port 8777).

Use that rather than `npx serve .` or `python -m http.server`: the pages link to each other without file extensions (`href="about"`), which only resolves because `vercel.json` sets `cleanUrls`. A plain static server 404s on every nav link, so the site looks broken locally while being fine in production. `preview.py` reproduces both `cleanUrls` and `trailingSlash:false`.

Opening the `.html` files directly over `file://` has the same problem, and worse — the funnel itself still works (`/api/lead` no-ops locally and the quiz swallows the fetch error), but you cannot navigate between pages.

Deploy target is **Vercel**. `api/lead.js` is auto-detected as a serverless function; `vercel.json` gives clean URLs. Server-side secrets (Klaviyo key, etc.) are set in Vercel's Environment Variables — names are in `.env.example`; never commit values.

**Deployment reality (important — not yet ideal):**
- This repo is **NOT git-connected to Vercel**, so commits here do **not** auto-deploy. The durable fix is to Import the repo in the Vercel dashboard (git-connect); until then, deploys are manual.
- There are **two** Vercel projects under team `s-brand`: `ojas-funnel` (an early single-page deploy) and `ojas-site` (the full multi-page site). `ojas-site` is the intended live project.
- Deploys were made by pushing files directly to Vercel (via the Vercel MCP `deploy_to_vercel`), not from git. The connector could create new projects but was **403-forbidden from updating** an existing one — so a fresh project name was used. Prefer git-connect for anything durable.
- New Vercel projects default to **Deployment Protection ON** (Vercel Authentication) — the public URL 302-redirects to an SSO login until it is turned **off** in Settings → Deployment Protection.

## The config-driven pattern (important)

`quiz.html` is driven by a single **`CONFIG`** object at the top of its `<script>`. Brand/currency, Pixel ID, lead endpoint, Shopify domain, the product, the concern block, and the questions all read from it; everything below it is a generic engine (`start` → `renderQuestion` → `choose` → `openLead` → `submitLead` → `renderResult`). To change the quiz you edit `CONFIG` only.

Current shape — **single product, no scoring**. `CONFIG.product` is one product and `CONFIG.concern` is one concern; answers are plain `{l:"label"}` options with no weights, and there is no ranking step. The "personalised match" screen is copy that reflects `CONFIG.concern.goalTag`, not a computed recommendation. Answer labels are still collected and sent with the lead, so they are useful for segmentation in the ESP. If a second product line is ever added, the scoring layer has to be written — it isn't there to extend.

The storefront pages (`index.html`, `product.html`) use a much smaller inline **`SHOP`** object (`{domain, variants}`) plus a `shopLink()` helper instead of `CONFIG`.

The homepage is a **category hub**: a grid of product-line cards, one live (Hair & Scalp) and five marked "Coming soon". The coming-soon cards call `notifyMe(category)`, which opens an inline waitlist modal — email + DPDP consent — and POSTs to `/api/lead` with `track: "waitlist-<category>"` and `attr.interest` set. Waitlist signups therefore land in the same ESP list as quiz leads, segmented by interest.

Don't revert this to a redirect into the quiz: the quiz is hair-specific throughout, so sending a skin-care visitor there is a mismatch that leaks signups. (`interest` is also still read from the query string by the quiz, harmless but no longer the main path.)

## Checkout wiring

"Add to cart" does not process payment here — it redirects somewhere that does. The handlers (`shopLink()` on the store pages, `addToCart()` in the quiz) try two routes in order:

1. **A payment link** — `SHOP.payLinks[key]` / `CONFIG.product.payLink`. Intended for a **Razorpay Payment Link or Payment Page**, which has no monthly platform fee, only a per-transaction cut. This is the preferred route and the reason the site does not require Shopify.
2. **A Shopify cart permalink** — `https://{domain}/cart/{variantId}:1`, used only if `domain` + `variantId` are set and no payment link is.

With neither set, the buttons `alert()` a "checkout not connected" prompt. The owner is cost-sensitive, so prefer the payment-link path when extending this; don't reintroduce a hard Shopify dependency without asking.

## Lead capture flow

Quiz → `POST /api/lead` with `{email, name, track, answers, attr, consent}` (`track` is hardcoded `"hair"`). `api/lead.js` validates (valid email + `consent === true`, else 400), then forwards to **Klaviyo** (subscription bulk-create job, API revision pinned to `2024-10-15`) if `KLAVIYO_API_KEY` is set, else to `LEAD_WEBHOOK_URL`, else accepts and returns ok — so the funnel works before an ESP is connected.

Two deliberate fail-open behaviours worth knowing before debugging "missing leads": the handler returns **200 even when the downstream forward throws** (it only `console.error`s), and the client fires the `fetch` without awaiting or checking the response. A lead can therefore appear to succeed and never reach the ESP; the Vercel function logs are the only signal. The lead is also mirrored into `localStorage` (`ojasLead`).

Marketing attribution (`utm_*`, `fbclid`, `ref`, `interest`) is captured client-side into `localStorage` (`ojasAttr`, merged across visits) and sent with the lead. Meta Pixel loads only if `CONFIG.pixelId` is set; `track()` is a no-op otherwise.

## Placeholders convention

Anything in `[BRACKETS]` or an empty config string (`pixelId: ""`, `variantId: ""`, `domain: ""`) is a **deliberate fill-later dependency**, not a bug. The full list of what to fill is in `SETUP.md` (product facts, prices, Shopify variant IDs, Pixel ID, Klaviyo keys, domain, GST/entity/grievance-officer details).

**Prices live in more than one place** — `quiz.html` `CONFIG.product.price`, the store pages' displayed prices, and eventually Shopify. Keep them in sync when they change.

`README.md` and `SETUP.md` now match this layout (quiz.html holds CONFIG, no `tracks`); `api/lead.js`'s header comment does too. If you spot any of the three drift again after further edits, fix it opportunistically.

## SEO baseline (added — keep in sync when adding pages)

Every page carries a `<meta name="description">`, Open Graph tags (`og:type`, `og:site_name`, `og:title`, `og:description`), a `twitter:card`, and an inline-SVG data-URI favicon (a teardrop on the brand-green `#2f6d4f`, no external asset). `robots.txt` allows all crawlers. There is **no `sitemap.xml` yet** — it needs absolute URLs, and no domain is purchased yet (see `SETUP.md`); add one once the domain is live. There is **no `og:image`** for the same reason product photography doesn't exist yet — add one to every page once real photos exist.

## The hard constraint: claims compliance

This is legal, not stylistic — India's **Drugs & Magic Remedies (Objectionable Advertisements) Act**, AYUSH/cosmetics rules, and Meta's ad review all restrict health claims. It governs **all** copy: the pages, the quiz product `benefit` line, ad creative, emails, and DMs.

- **Never** write: regrows hair, stops hair fall / treats hair loss, reverses greying, treats dandruff or any condition, cures/treats obesity, "clinically proven" (without a study). Prescription-drug DTC advertising is prohibited outright.
- **Keep to** support/appearance framing: nourishes/comforts the scalp, conditions dry hair, softness & shine, helps hair *look* fuller and healthier, helps reduce the *look* of breakage, clears buildup without stripping.
- Lead capture **must** keep its explicit consent checkbox (DPDP Act 2023); health-adjacent data needs consent. The server enforces this too — don't relax the `consent !== true` check.
- The result screen carries a "not a medicine / not intended to diagnose, treat, cure or prevent any disease" disclaimer. Keep it on any new result or product surface.
- New product categories must stay cosmetic. Anything framed as restoration, treatment, or clinical care — the model most telehealth sites use — is not available to this brand in India.

When in doubt, describe what a product *is* and how it makes hair *look/feel* — never what it cures.
