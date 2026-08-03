# Ojas — Lead-to-Sale Funnel

A product-agnostic quiz funnel that acquires leads and converts them to sales. Static, single-file front end + an optional serverless lead endpoint. Deploys to Vercel with no build step.

## What's here

```
index.html        The funnel. Everything is driven by the CONFIG block near the
                  bottom of the file — brand, theme, currency, Pixel ID, lead
                  endpoint, and all concerns/products. Editing CONFIG is the only
                  thing you do to launch a new product.
api/lead.js       Optional Vercel serverless function. Receives quiz leads and
                  forwards them to your ESP (Klaviyo etc.). Reads secrets from
                  env vars — none are committed.
vercel.json       Static hosting + clean URLs.
.env.example      The env vars api/lead.js expects. Copy to Vercel's env settings.
docs/             The operating manual for the funnel system.
```

## Configure (per product)

Open `index.html`, find the `CONFIG` block:

- `brand`, `tagline`, `currency`, `locale` — labels + price formatting
- `theme.primary` / `accent` — brand colours
- `pixelId` — paste your Meta Pixel ID → events (PageView, Lead, AddToCart) fire automatically. Leave blank in dev.
- `leadEndpoint` — set to `"/api/lead"` to POST leads to the serverless function. Leave blank to store locally only.
- `tracks` — one block per concern/product line. Add a block = add a vertical.

Keep every product `benefit` line to **support / appearance** framing — never a claim to treat or cure a condition (see the note on the result screen and `docs/`).

## Run locally

```
npx serve .            # or open index.html directly (funnel works without a backend)
```

## Deploy

1. Push to GitHub (this repo).
2. Import into Vercel → framework preset **Other** → deploy. No build command needed.
3. Add the env vars from `.env.example` in Vercel's project settings (only needed for `api/lead.js`).
4. Point your link-in-bio at the deployed URL.

## Secrets

Never commit API keys. `api/lead.js` reads them from environment variables only. `.env` is gitignored; `.env.example` documents the names, not the values.
