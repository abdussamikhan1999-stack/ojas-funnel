# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Ojas** — a lead-to-sale funnel + storefront for a personalised Ayurvedic hair-oil brand (India / INR). Static single-file HTML pages plus one Vercel serverless function. **No build step, no framework, no tests.** Everything is vanilla HTML/CSS/JS designed to deploy to Vercel as-is.

The business model (see `docs/FUNNEL-SYSTEM.md`): Meta/Instagram traffic → quiz captures a **lead** → email nurture → **sale** via Shopify. This repo is the funnel + storefront half; commerce (checkout, payments, subscriptions) is delegated to Shopify + Razorpay.

## Layout (final structure)

```
index.html      Storefront HOMEPAGE (served at /)
quiz.html       The quiz funnel (served at /quiz) — the lead-gen engine
product.html    Product page (served at /product)
api/lead.js     Vercel serverless function: receives quiz leads, forwards to ESP
content/legal/  Privacy, Terms, Refund, Shipping — policy drafts (templates)
content/copy/   Storefront copy
content/email/  Klaviyo flow copy
docs/FUNNEL-SYSTEM.md   The product-agnostic operating manual
SETUP.md        "Built vs. fill-later" dependency checklist — READ THIS FIRST
vercel.json     cleanUrls: true (so /quiz -> quiz.html)
.env.example    Names of the server-side secrets (values live in Vercel only)
```

`store/` is a **stale earlier copy** of the homepage/product page (pre-restructure). The root `index.html` / `product.html` are canonical; ignore or delete `store/`.

## Running & deploying

No build/lint/test. To preview locally: `npx serve .` (or open the `.html` files directly — the funnel works without a backend; `/api/lead` just no-ops locally).

Deploy target is **Vercel**. `api/lead.js` is auto-detected as a serverless function; `vercel.json` gives clean URLs. Server-side secrets (Klaviyo key, etc.) are set in Vercel's Environment Variables — names are in `.env.example`; never commit values.

**Deployment reality (important — not yet ideal):**
- This repo is **NOT git-connected to Vercel**, so commits here do **not** auto-deploy. The durable fix is to Import the repo in the Vercel dashboard (git-connect); until then, deploys are manual.
- There are **two** Vercel projects under team `s-brand`: `ojas-funnel` (an early single-page deploy) and `ojas-site` (the full multi-page site). `ojas-site` is the intended live project.
- Deploys were made by pushing files directly to Vercel (via the Vercel MCP `deploy_to_vercel`), not from git. The connector could create new projects but was **403-forbidden from updating** an existing one — so a fresh project name was used. Prefer git-connect for anything durable.
- New Vercel projects default to **Deployment Protection ON** (Vercel Authentication) — the public URL 302-redirects to an SSO login until it is turned **off** in Settings → Deployment Protection.

## The config-driven pattern (important)

`quiz.html` is driven by a single **`CONFIG`** object near the bottom of its `<script>`. Everything — questions, scoring weights, products, prices, theme, brand — reads from it. To change the quiz or add a product line you edit `CONFIG` only; the rest of the file is generic engine.

- Answers add `w:{productKey: weight}` scores; `computeRec()` ranks products and picks a primary + add-ons.
- The storefront pages (`index.html`, `product.html`) use a smaller **`SHOP`** object instead.

## Shopify checkout wiring

"Add to cart" does not process payment here. When `CONFIG.shop.domain` (quiz) / `SHOP.domain` (store) and a product's `variantId` are set, the buy handlers redirect to a **Shopify cart permalink** `https://{domain}/cart/{variantId}:1` — real checkout happens on Shopify. Until those are filled, buttons show a "connect Shopify" prompt.

## Lead capture flow

Quiz → `POST /api/lead` with `{email, name, track, answers, attr, consent}`. `api/lead.js` validates (email + consent required), then forwards to **Klaviyo** if `KLAVIYO_API_KEY` is set, else to `LEAD_WEBHOOK_URL`, else accepts and returns ok (so the funnel works before an ESP is connected). Marketing attribution (`utm_*`, `fbclid`, `ref`) is captured client-side into `localStorage` and sent with the lead. Meta Pixel loads only if `CONFIG.pixelId` is set.

## Placeholders convention

Anything in `[BRACKETS]` or an empty config string (`pixelId: ""`, `variantId: ""`, `domain: ""`) is a **deliberate fill-later dependency**, not a bug. The full list of what to fill and where is in `SETUP.md` (product facts, prices, Shopify variant IDs, Pixel ID, Klaviyo keys, domain, GST/entity/grievance-officer details).

**Prices live in more than one place** — `quiz.html` CONFIG.products, the store pages' displayed prices, and eventually Shopify. Keep them in sync when they change.

## The hard constraint: claims compliance

This is legal, not stylistic — India's **Drugs & Magic Remedies (Objectionable Advertisements) Act**, AYUSH/cosmetics rules, and Meta's ad review all restrict health claims. It governs **all** copy: the pages, the quiz product `benefit` lines, ad creative, emails, and DMs.

- **Never** write: regrows hair, stops hair fall / treats hair loss, reverses greying, treats dandruff or any condition, cures/treats obesity, "clinically proven" (without a study). Prescription-drug DTC advertising is prohibited outright.
- **Keep to** support/appearance framing: nourishes/comforts the scalp, conditions dry hair, softness & shine, helps hair *look* fuller and healthier, helps reduce the *look* of breakage, clears buildup without stripping.
- Lead capture **must** keep its explicit consent checkbox (DPDP Act 2023); health-adjacent data needs consent.

When in doubt, describe what a product *is* and how it makes hair *look/feel* — never what it cures.
