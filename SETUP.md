# Ojas — Setup & Dependencies Checklist

Everything that's **built** vs. the **dependencies to fill in later** (API keys, IDs, accounts, business specifics). Nothing here blocks the other; plug each in when ready.

## ✅ Built (in this repo)

- `index.html` — the quiz funnel (lead-gen), config-driven, with Shopify-checkout wiring ready.
- `api/lead.js` — serverless lead capture → Klaviyo/webhook.
- `content/legal/*` — Privacy, Terms, Refund/Returns, Shipping policy drafts.
- `content/copy/store-copy.md` — homepage, product-page, about copy (compliant).
- `content/email/klaviyo-flows.md` — welcome, quiz-result, abandoned-cart, post-purchase, winback email copy.
- `docs/FUNNEL-SYSTEM.md` — the operating manual.

## ⏳ Dependencies to fill later

### Payments & commerce (you own: Shopify / Razorpay / Stripe)
- [ ] Shopify store created; products added.
- [ ] Razorpay connected in Shopify (India gateway); Stripe for international (optional).
- [ ] Product **variant IDs** → paste into `index.html` CONFIG (`shop.domain` + each product `variantId`) to turn on real checkout.

### Tracking (Meta)
- [ ] Meta Business account + Pixel → paste **Pixel ID** into `index.html` CONFIG.pixelId.
- [ ] (Later) Conversions API token → Vercel env `META_CAPI_TOKEN`, `META_PIXEL_ID`.

### Email / CRM (Klaviyo recommended)
- [ ] Klaviyo account → set `KLAVIYO_API_KEY`, `KLAVIYO_LIST_ID` in **Vercel env vars** (never in the repo).
- [ ] Build the flows from `content/email/klaviyo-flows.md`.

### Domain & hosting
- [ ] Buy domain (e.g. ojasoil.in) → point at Vercel (funnel) and/or Shopify (store).
- [ ] Vercel: **Settings → Deployment Protection → Vercel Authentication → Off** (so the funnel is public).

### Business / legal specifics (fill the [BRACKETS] in content/legal/*)
- [ ] Legal entity name, registered address, contact email, phone.
- [ ] GST number (tax + invoices + Razorpay onboarding).
- [ ] Grievance officer name/email (DPDP Act requirement).
- [ ] Return window, refund timelines, shipping rates/zones, delivery estimates.

### Product facts (fill in index.html CONFIG + copy)
- [ ] Real product names, herbs/ingredients, sizes, prices, launch offer.
- [ ] Product photography + logo + brand fonts.

### Later
- [ ] Affiliate app (GoAffPro / UpPromote) for commission selling.
- [ ] Subscriptions app in Shopify.
