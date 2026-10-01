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
  `content/copy/store-copy.md`). Delivered immediately after purchase, so
  the "2-minute quiz → personalised result" flow that's already built
  becomes the lead-gen AND personalization step, with the actual paid
  content released only after checkout (see Delivery below) — not on the
  free result screen.
- **Launch offer:** ₹249 founding price (anchored against the ₹399 regular
  price), ends at **whichever comes first: 200 buyers, or 14 days from
  launch**. A fixed calendar date isn't set — ads aren't live yet
  (`CONFIG.pixelId`/Klaviyo/`payLink` all still empty), so a hardcoded date
  would go stale before the funnel even runs. `CONFIG.launchDate` in
  `quiz.html` stays empty until launch; the 14-day window is 14 days from
  whatever gets filled in there. The 200-buyer cap has no live counter
  (this repo has no order-tracking backend) — enforce it manually by
  swapping `CONFIG.product.price` to 399 (and dropping the strikethrough)
  once either condition is hit.
- **Channel:** Meta/Instagram ads → quiz (lead capture + personalization) →
  Razorpay checkout → automatic digital delivery (see below) + Klaviyo
  nurture. Still not live — `CONFIG.pixelId` and Klaviyo keys are empty
  per `SETUP.md`; those remain the real dependencies before ads can run,
  unrelated to delivery.

## Delivery (built 2026-10-01 — this was the last real blocker)

`api/deliver.js` + `deliver.html` close the gap flagged twice below in
earlier status updates ("nothing sends the matched guide's content to the
buyer yet"). How it works: the Razorpay Payment Link's Redirect URL
(configured once in the Razorpay dashboard — see `SETUP.md`) sends the
buyer's browser to `/deliver?<razorpay's own signed params>` after a
successful payment. `deliver.html` reads the matched protocol slug out of
the `ojasLead` record `quiz.html` already writes to `localStorage` during
the quiz, and asks `/api/deliver` to verify Razorpay's signature
(HMAC-SHA256 against `RAZORPAY_KEY_SECRET`, the documented Razorpay
Payment Link formula) before releasing the matching guide's content —
gated on proof of payment, not on identity, since there's nothing
sensitive to protect beyond the ~₹0-COGS content itself. If the buyer's
quiz match can't be found (different device, cleared storage), it falls
back to the general `thinning` guide and asks them to email support for
their specific match — a known, acceptable gap given how rarely a ₹249
impulse purchase happens on a different device than the quiz was taken on.

**What this does NOT need**: Klaviyo. The delivery path works as soon as
`RAZORPAY_KEY_SECRET` is set and the Payment Link's redirect URL points at
`/deliver` — both are things you'd set up anyway to take payment at all,
not new dependencies. A Klaviyo-flow-based delivery (emailing the guide
instead of/in addition to showing it on `/deliver`) is still a reasonable
later addition — the content and matching are already there either way —
but is no longer the blocker it was.

**What's still a real gap**: `RAZORPAY_KEY_SECRET` not being set yet means
`/deliver` can't verify anything — it currently shows a "your protocol is
on its way, email support if you don't hear back" holding message rather
than leaking content, by design (see `api/deliver.js`'s own comments on
why it fails closed, unlike `api/lead.js`). Set the env var once a
Razorpay account exists (per `SETUP.md`) to turn this on for real.

## Target CAC (from `tools/calc.py unit-econ`)

At ₹249 launch price, ~95% margin (payment fee only), 1 order/customer:
`LTV ≈ ₹236.55`. For a healthy 3:1 LTV:CAC, **target CAC/CPA is ≤ ₹79**.
At ₹150 CAC the ratio drops to 1.58:1 — still profitable but thin. Use ₹79
as the number to hold `ads-meta/` spend against once campaigns are live.

## Status (updated 2026-10-01)

- ✅ `quiz.html`'s `CONFIG.product` now models this digital protocol (₹249 /
  ₹399, id `ojas-protocol`), not the physical oil.
- ✅ Quiz-to-guide matching is implemented: `matchProtocol()` in
  `quiz.html` maps the three existing quiz answers to one of the four
  protocol slugs; the result screen shows the matched protocol's name and
  the lead payload carries `attr.protocol`. See
  `content/protocol/README.md` → "How matching works".
- ✅ The four protocol guides themselves exist in `content/protocol/`
  (`thinning.md`, `dry-brittle.md`, `oily-buildup.md`, `breakage.md`).
- ✅ **Delivery is built** (`api/deliver.js` + `deliver.html`, see above) —
  releases the matched guide automatically after a verified Razorpay
  payment. The one remaining step is operational, not code: point the
  Payment Link's redirect URL at `/deliver` and set `RAZORPAY_KEY_SECRET`
  once Razorpay is connected (see `SETUP.md`).
- ✅ Founding-offer deadline/cap decided: first 200 buyers or 14 days from
  launch, whichever comes first (see Launch offer above).
- ✅ Refund terms decided: 7-day satisfaction guarantee, full refund, no
  reason required — `refund.html` and `content/legal/refund-and-returns.md`
  rewritten for the digital product (the old versions were physical-return
  policies and didn't apply). Legal-entity fields (`[LEGAL ENTITY NAME]`,
  `[SUPPORT EMAIL]`, `[PHONE]`, `[DATE]`) are still real placeholders —
  genuine business facts only you can supply, not filled in here.
- ⬜ `CONFIG.pixelId`, Klaviyo keys, and a real Razorpay `payLink` — all
  still empty; pre-existing gaps per `SETUP.md`, the real remaining
  dependencies before ads can run.
