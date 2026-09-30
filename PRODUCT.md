# Product: The Ojas Hair & Scalp Protocol

Pivoted 2026-09-30 from the physical Ojas Hair Oil (still real, still in
the repo) to a **digital product sold to the same audience** — this
sidesteps the unresolved COGS/inventory blocker entirely and lets the
funnel go live fast. The physical oil can come back later as an upsell
once its economics are actually known; it isn't the primary offer for now.

- **Type:** digital product — a personalized PDF/email-delivered hair &
  scalp protocol.
- **Price:** ₹399 regular, **₹249 founding-cohort launch price** (see
  Launch offer). Value-based, not cost-plus — there's no meaningful cost
  floor to price against (see Cost to deliver), so the number comes from
  what the outcome is worth to the buyer, anchored against what a
  salon/dermat consultation or a comparable routine-guide product costs.
- **Cost to deliver:** ~₹0. No COGS — it's a document, delivered by email.
  The only real cost is the payment gateway fee (~2% via Razorpay) and
  whatever time goes into writing the four concern-specific protocols
  once. `tools/calc.py price` isn't very informative here (any price nets
  close to 100% margin) — the actual pricing lever is value/anchor, from
  `pricing-offer-design/`, not cost-plus.
- **Audience:** unchanged — India-based people with a specific hair/scalp
  concern: thinning-looking hair, dry/brittle hair, oily roots/buildup, or
  visible breakage. These are exactly `quiz.html`'s four concern segments,
  so the quiz's existing answers become the personalization input for
  which protocol variant a buyer gets — no new segmentation work needed.
- **Positioning:** A personalized Ayurvedic hair & scalp protocol — the
  same honest, ingredient-literate approach as the Ojas brand, but sold as
  a guide+ritual-calendar instead of a bottle: what to do, in what order,
  for your specific concern, with a realistic timeline (Ayurveda is a
  ritual, not an overnight fix — matches existing brand voice in
  `content/copy/store-copy.md`). Delivered immediately after the quiz, so
  the "2-minute quiz → personalised result" flow that's already built
  becomes the actual product delivery mechanism, not just a lead-gen step.
- **Launch offer:** ₹249 for the first cohort (founding price, anchored
  against the ₹399 regular price), time-boxed — pick a concrete window
  (e.g. first 14 days or first 200 buyers) before running ads.
  **NEEDS DECISION:** exact deadline/cap.
- **Channel:** Meta/Instagram ads → quiz (now doubles as both lead capture
  *and* the personalization step for the digital product) → immediate
  digital delivery + Klaviyo nurture. Still not live — `CONFIG.pixelId`
  and Klaviyo keys are empty per `SETUP.md`; those remain the real
  dependencies before ads can run, unrelated to this pivot.

## Target CAC (from `tools/calc.py unit-econ`)

At ₹249 launch price, ~95% margin (payment fee only), 1 order/customer:
`LTV ≈ ₹236.55`. For a healthy 3:1 LTV:CAC, **target CAC/CPA is ≤ ₹79**.
At ₹150 CAC the ratio drops to 1.58:1 — still profitable but thin. Use ₹79
as the number to hold `ads-meta/` spend against once campaigns are live.

## Status (updated 2026-09-30)

- ✅ `quiz.html`'s `CONFIG.product` now models this digital protocol (₹249 /
  ₹399, id `ojas-protocol`), not the physical oil.
- ✅ Quiz-to-guide matching is implemented: `matchProtocol()` in
  `quiz.html` maps the three existing quiz answers to one of the four
  protocol slugs; the result screen shows the matched protocol's name and
  the lead payload carries `attr.protocol`. See
  `content/protocol/README.md` → "How matching works".
- ✅ The four protocol guides themselves exist in `content/protocol/`
  (`thinning.md`, `dry-brittle.md`, `oily-buildup.md`, `breakage.md`).
- ⬜ **Actual delivery is still manual.** Nothing sends the matched
  guide's content to the buyer yet — no email automation renders it, and
  it isn't shown on the result screen (would give away the paid content
  for free). This needs either a Klaviyo flow keyed on `attr.protocol`
  (once Klaviyo is connected) or a paywalled reveal after checkout.
- ⬜ Founding-offer deadline/cap — still not chosen (see Launch offer above).
- ⬜ Refund terms — blocks the landing page's guarantee claim (see
  `content/copy/protocol-landing-page.md`).
- ⬜ `CONFIG.pixelId`, Klaviyo keys, and a real Razorpay `payLink` — all
  still empty; pre-existing gaps per `SETUP.md`, unrelated to this pivot.
