# Ojas — Lead-to-Sale Funnel

A lead-to-sale funnel + storefront for a personalised Ayurvedic hair-oil brand. Static, single-file pages + one serverless lead endpoint. Deploys to Vercel with no build step.

## What's here

```
index.html        Storefront homepage / category hub (served at /).
quiz.html         The quiz funnel — the lead-gen engine. Everything is driven
                  by the CONFIG block at the top of its <script> — brand,
                  theme, currency, Pixel ID, lead endpoint, the product, and
                  the concern/questions. Editing CONFIG is the only thing you
                  do to change the quiz.
product.html      Product page.
about|faq|contact.html               Marketing pages.
privacy|terms|refund|shipping.html   Rendered policy pages.
api/lead.js       Optional Vercel serverless function. Receives quiz leads and
                  forwards them to your ESP (Klaviyo etc.). Reads secrets from
                  env vars — none are committed.
preview.py        Local dev server that reproduces vercel.json's clean URLs.
vercel.json       Static hosting + clean URLs.
.env.example      The env vars api/lead.js expects. Copy to Vercel's env settings.
docs/             The operating manual for the funnel system.
```

## Configure

Open `quiz.html`, find the `CONFIG` block:

- `brand`, `tagline`, `currency`, `locale` — labels + price formatting
- `theme.primary` / `accent` — brand colours
- `pixelId` — paste your Meta Pixel ID → events (PageView, Lead, AddToCart) fire automatically. Leave blank in dev.
- `leadEndpoint` — set to `"/api/lead"` to POST leads to the serverless function. Leave blank to store locally only.
- `product` — the single product being sold. `concern` — the single concern the quiz screens for. (The quiz is single-product, no weighted scoring — see the repo's `CLAUDE.md` before adding a second line.)

Keep every product `benefit` line to **support / appearance** framing — never a claim to treat or cure a condition (see the note on the result screen and `docs/`).

## Run locally

```
python3 preview.py     # reproduces vercel.json's clean URLs (nav links use no extension)
```

Don't use `npx serve .` or `python3 -m http.server` — pages link to each other as `href="about"` etc., which only resolves under `preview.py` or on Vercel.

## Deploy

1. Push to GitHub (this repo).
2. Import into Vercel → framework preset **Other** → deploy. No build command needed.
3. Add the env vars from `.env.example` in Vercel's project settings (only needed for `api/lead.js`).
4. Point your link-in-bio at the deployed URL.

## Secrets

Never commit API keys. `api/lead.js` reads them from environment variables only. `.env` is gitignored; `.env.example` documents the names, not the values.
