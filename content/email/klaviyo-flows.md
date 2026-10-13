# Ojas — Email/WhatsApp Flows (Klaviyo-ready copy)

_Compliant copy for the core automations. Two products are on sale: the **₹249 Ojas Hair & Scalp Protocol** (digital, founding price, ₹399 regular) is the lead offer from the quiz; **Ojas Hair Oil** (₹299 / 50 mL, ₹259 on subscription) is the second product. Keep every claim in support/appearance framing (see CLAUDE.md → claims compliance)._

**Merge tags available on every quiz lead** (set by `api/lead.js`): `{{ first_name }}`, `{{ person.protocol }}` (one of `thinning`, `dry-brittle`, `oily-buildup`, `breakage`), `{{ person.quiz_answers }}`. Map `protocol` to a readable name with a Klaviyo conditional block:

| `protocol` | Say |
|---|---|
| `thinning` | thinning-looking hair |
| `dry-brittle` | dry, rough or brittle hair |
| `oily-buildup` | oily roots and buildup |
| `breakage` | visible breakage |

## Flow 1 — Quiz lead → protocol purchase (triggered on Lead, exits on purchase)

**Email 1 (immediately)**
- Subject: Your match: the protocol for {{ concern }}
- Preview: Two minutes of answers, one written routine.
- Body: Hi {{ first_name|default:"there" }}, your answers matched you to our protocol for {{ concern }}. It's a written routine: what to do each week, in what order, which ingredients and why, and a realistic timeline. It isn't a generic tips list. It's ₹249 at the founding price (₹399 after the first 200 buyers or 14 days), and it opens in your browser the moment you pay.
- CTA: Get my protocol → (link to `/quiz`; the result screen remembers their match on the same device)
- Footer line: Ayurveda is a ritual, not an overnight fix. Ojas is not a medicine and is not intended to diagnose, treat, cure or prevent any disease.

**Email 2 (+1 day)**
- Subject: The 30-minute ritual most people rush
- Body: Give one free step from the matched protocol's ritual (warm → massage → comb → leave → wash) as real value, then: "The full protocol covers the rest: the weekly order, what to skip for {{ concern }}, and when to expect hair to look and feel different."
- CTA: Get the full protocol, ₹249 →

**Email 3 (+3 days)**
- Subject: The founding price ends soon
- Body: The ₹249 price is for the first 200 buyers or 14 days from launch, whichever comes first. After that it's ₹399. Recap in three bullets what's inside. Only send this while `CONFIG.launchDate` is set and the window is still open; otherwise skip to Email 4.
- CTA: Get it at ₹249 →

**Email 4 (+6 days, oil cross-sell for non-buyers)**
- Subject: Prefer something you can hold?
- Body: Some people would rather start with the bottle. Ojas Hair Oil is mustard oil, onion, garlic and flax seed, every ingredient named. It nourishes the scalp and leaves lengths softer and shinier. ₹299 for 50 mL, or ₹259 on subscription.
- CTA: See the oil → (`/product`)

## Flow 2 — Protocol purchased (triggered on Purchase of the protocol)

> **Needs a purchase signal.** Razorpay Payment Links don't tell Klaviyo about a sale on their own. Until a Razorpay webhook (or Zapier/Make step) posts a `Placed Order` event to Klaviyo, this flow can't trigger automatically. Buyers still get their protocol on `/deliver` right after paying; this email is the backup copy.

**Email 1 (immediately)**
- Subject: Your Ojas protocol, saved for later
- Body: Thanks for buying. Your protocol for {{ concern }} opened on screen after checkout. Here's a copy so you can come back to it. Attach or link the matching guide from `content/protocol/`.
- Support line: Reply to this email if anything looks wrong.

**Email 2 (+7 days)**
- Subject: One week in: how's the ritual going?
- Body: A check-in with one tip from their protocol. Ask one question: "What's been hardest to keep up?" (replies go to the inbox, not a survey tool).

**Email 3 (+14 days, oil cross-sell)**
- Subject: The oil that fits your protocol
- Body: The protocol works with oils you already have. If you'd like the one we made for it: Ojas Hair Oil, four named botanicals, ₹299 / 50 mL or ₹259 on subscription.
- CTA: See the oil →

## Flow 3 — Oil purchased (triggered on Purchase of the oil)

**Email 1 (on ship)**
- Subject: Your Ojas Hair Oil is on its way
- Body: Tracking link, then how to use it: warm a little oil, massage into the scalp, comb through, leave for 30 minutes or overnight, wash with a mild shampoo.

**Email 2 (+10 days)**
- Subject: How does your hair feel after a few washes?
- Body: Usage tips, a request for an honest review (no incentive tied to a positive rating), and the subscribe-and-save option at ₹259.

## Flow 4 — Abandoned checkout (triggered on InitiateCheckout, no purchase in 1 hour)

**Email 1 (+1 hour):** Subject: You were one step away. Gentle nudge, recap of whichever product they clicked (protocol or oil), and a CTA back to it.
**Email 2 (+24 hours):** Subject: Still thinking it over? Answer one common question ("Is the protocol a PDF?" It opens in your browser right after payment. "Is the oil natural?" Every ingredient is named on the label.) + CTA.

## Flow 5 — Winback (no purchase in [60] days)

**Email 1:** Subject: We kept your match. Remind them which protocol they matched to, plus a CTA back to the quiz to re-take it if their hair has changed.

## Notes
- Add a WhatsApp step (via WATI or Klaviyo's channels) for Flow 1 and Flow 4. Open rates in India are high.
- Every email needs an unsubscribe link and the business's physical address (legal requirement).
- Waitlist signups (`track: "waitlist-<category>"`) shouldn't enter Flow 1. Filter Flow 1 on `quiz_track = hair`.
- Never write: regrows hair, stops hair fall, treats hair loss or dandruff, reverses greying, "clinically proven".
