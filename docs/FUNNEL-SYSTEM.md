# The Lead-to-Sale Funnel System

_A product-agnostic system for acquiring leads and converting them into paying clients — for any wellness/cosmetic product. Configure once per product; the machine is the same every time. Written for the Indian market and its ad rules._

---

## 1. The machine, end to end

```
  TRAFFIC            →   FUNNEL             →   LEAD              →   NURTURE           →   SALE              →   RETAIN / AMPLIFY
  (you buy/earn)         (you build once)       (you own)             (you buy)             (you buy)             (you buy)

  Meta / IG ads         Quiz landing page      Email + phone         Email/WhatsApp        Checkout +            Subscription refills
  Influencers           → questions            + consent (DPDP)      welcome + offer       subscription          Affiliate / referral
  Organic IG            → recommendation        + UTM/fbclid/ref      abandon nudges        (Razorpay/Shopify)    Reviews / UGC
```

**One sentence:** paid + organic traffic hits a **quiz funnel** → the quiz captures a **lead** (with consent + attribution) → an **email/WhatsApp sequence** nurtures them → they **buy on subscription** → they’re **retained and turned into referrers**.

---

## 2. Components & build-vs-buy

| Component | Build / Buy | Notes |
|---|---|---|
| Traffic (Meta/IG ads, creators) | Buy | Ads sell the *assessment*, never a cure |
| Funnel front-end (quiz) | **BUILD** | `index.html` — config-driven, already built |
| Lead capture | **BUILD (thin)** | `api/lead.js` → ESP |
| Attribution (utm/fbclid/ref) | **BUILD** | already in the funnel |
| Tracking (Pixel/CAPI) | **BUILD (light)** | add Pixel ID to CONFIG |
| CRM / ESP | Buy | Klaviyo (recommended), WATI (WhatsApp) |
| Nurture flows | Buy | welcome, quiz-result, cart-abandon |
| Checkout + subscription | Buy | Shopify + Razorpay |
| Retention | Buy | subscription + reviews apps |
| Affiliate / commission | Buy | GoAffPro / UpPromote / Refersion |

**Rule:** build only the funnel + lead capture + tracking. Buy the CRM, payments, subscription, and affiliate/payout layers.

---

## 3. Launch a new product on the system (checklist)

- [ ] Add the product’s `tracks` block in `index.html` CONFIG (concern + questions + product + price).
- [ ] Write 3–5 **compliant** benefit lines (support/appearance only).
- [ ] Add the product in the checkout tool (Shopify/Razorpay).
- [ ] Add / reuse an ESP nurture flow.
- [ ] Point a new ad set at the funnel with `utm_campaign=<product>`.
- [ ] Launch. Watch CPL → conversion → ROAS.

---

## 4. KPIs

- **Acquisition:** cost per lead (CPL), quiz start→finish rate, opt-in rate.
- **Conversion:** lead→customer %, first-order conversion, AOV.
- **Economics:** CAC, ROAS, payback, subscription retention.
- **Amplify:** % revenue via affiliates/referrals.

---

## 5. Compliance guardrails (every product)

- **Market the assessment/brand, not a cure.** No treatment claims for hair loss, greying, obesity, digestive conditions, etc. (India’s DMR Act; Meta ad review enforces the same).
- **Prescription products need a different model** (licensed doctor + pharmacy; DTC drug ads are prohibited in India).
- **Consent is mandatory** — explicit checkbox + privacy policy (DPDP Act 2023), especially for health data.
- **Keep a say / never-say list per product** so all copy stays consistent.
- _Operational guidance, not legal advice — a quick review by an advertising/AYUSH lawyer is worth it before scaling spend._
