# Ojas — Setup & Dependencies Checklist

Everything that's **built** vs. the **dependencies to fill in later** (API keys, IDs, accounts, business specifics). Nothing here blocks the other; plug each in when ready.

## ✅ Built (in this repo)

- `index.html` — storefront/category-hub homepage; `product.html` — product page; `quiz.html` — the quiz funnel (lead-gen), config-driven, with payment-link/Shopify checkout wiring ready.
- `about.html`, `faq.html`, `contact.html` — marketing pages.
- `privacy|terms|refund|shipping.html` — rendered policy pages (drafts also live in `content/legal/*`, edited separately).
- `api/lead.js` — serverless lead capture → Klaviyo/webhook.
- `content/copy/store-copy.md` — homepage, product-page, about copy (compliant).
- `content/email/klaviyo-flows.md` — welcome, quiz-result, abandoned-cart, post-purchase, winback email copy.
- `docs/FUNNEL-SYSTEM.md` — the operating manual.
- `robots.txt` — allows all crawlers.

## ⏳ Dependencies to fill later

### Payments & commerce (you own: Razorpay / Shopify / Stripe)
- [ ] Razorpay Payment Link (or Payment Page) created for the product → paste into `SHOP.payLinks[key]` (index.html/product.html) and `CONFIG.product.payLink` (quiz.html). This is the preferred route — no monthly platform fee.
- [ ] (Optional, only if not using a payment link) Shopify store created, products added, Razorpay connected as the India gateway → paste `shop.domain` + each product `variantId`.

### Tracking (Meta)
- [ ] Meta Business account + Pixel → paste **Pixel ID** into `quiz.html` CONFIG.pixelId.
- [ ] (Later) Conversions API token → Vercel env `META_CAPI_TOKEN`, `META_PIXEL_ID`.

### Email / CRM (Klaviyo recommended)
- [ ] Klaviyo account → set `KLAVIYO_API_KEY`, `KLAVIYO_LIST_ID` in **Vercel env vars** (never in the repo).
- [ ] Build the flows from `content/email/klaviyo-flows.md`.

### Domain & hosting
- [ ] Buy domain (e.g. ojasoil.in) → point at Vercel (funnel) and/or Shopify (store).
- [ ] Vercel: **Settings → Deployment Protection → Vercel Authentication → Off** (so the funnel is public).
- [ ] Import this repo into Vercel (git-connect) so pushes auto-deploy — as of now nothing here has ever been deployed.
- [ ] Add a `sitemap.xml` once the domain is live (needs absolute URLs, so it can't be written before then).

### Business / legal specifics (fill the [BRACKETS] in content/legal/*)
- [ ] Legal entity name, registered address, contact email, phone.
- [ ] GST number (tax + invoices + Razorpay onboarding).
- [ ] Grievance officer name/email (DPDP Act requirement).
- [ ] Return window, refund timelines, shipping rates/zones, delivery estimates.

### Product facts (fill in quiz.html CONFIG + copy)
- [ ] Real product names, herbs/ingredients, sizes, prices, launch offer.
- [ ] Product photography + logo + brand fonts. (Once photography exists, add `og:image` to every page's `<head>` — omitted for now since there's no real image to point at.)

### Later
- [ ] Affiliate app (GoAffPro / UpPromote) for commission selling.
- [ ] Subscriptions app in Shopify.
