# Product: Ojas Hair Oil

Filled from what's already real in this repo (`quiz.html` CONFIG,
`content/copy/store-copy.md`, `docs/FUNNEL-SYSTEM.md`). Fields marked
**NEEDS DECISION** are genuinely undecided — don't treat them as final.

- **Type:** physical product (India / INR).
- **Price:** ₹99 for 50 mL, per `quiz.html` `CONFIG.product.price`.
  **NEEDS DECISION** — ₹99/50mL is well below market for an Ayurvedic hair
  oil (comparable oils run ₹250-500+ for similar sizes); this reads like a
  placeholder/dev value rather than a considered price. Run
  `revenue-toolkit/pricing-offer-design/` + `tools/calc.py price` once
  cost-to-deliver is known, before treating this as real.
- **Cost to deliver:** **UNKNOWN — not documented anywhere in this repo.**
  Needs a real per-unit cost (ingredients, bottling, packaging, shipping)
  from you or your supplier before pricing/unit-economics work can produce
  real numbers instead of guesses.
- **Audience:** India-based hair-oil buyers with a specific concern —
  thinning-looking hair, dry/brittle hair, oily roots/buildup, or visible
  breakage (the exact segments `quiz.html`'s question options sort leads
  into). Comfortable buying skincare/haircare online, likely reached via
  Instagram.
- **Positioning:** An honest, ingredient-literate Ayurvedic hair oil
  (mustard oil, onion, garlic, flax seed) that nourishes the scalp and
  supports stronger, fuller-looking hair — explicitly *not* a cure/regrowth
  claim, matched to the buyer via a 2-minute quiz instead of one-size-fits-all
  marketing. (Source: `quiz.html` `CONFIG.product.benefit` +
  `content/copy/store-copy.md` "Why Ojas" / "honesty section".)
- **Launch offer:** **NOT YET DEFINED.** No founding-offer, bundle, or
  deadline exists anywhere in the repo. Needs a decision — see
  `revenue-toolkit/pricing-offer-design/README.md` → "Launch offer types".
- **Channel:** Meta/Instagram ads → quiz (lead capture) → Klaviyo email
  nurture → sale via Razorpay payment link (preferred) or Shopify. (Source:
  `docs/FUNNEL-SYSTEM.md`, `SETUP.md`.) Not yet live — `CONFIG.pixelId`,
  `CONFIG.product.payLink`, and Klaviyo API keys are all still empty per
  `SETUP.md`.
