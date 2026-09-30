# The Ojas Hair & Scalp Protocol — content

The actual deliverable for the digital product defined in `PRODUCT.md`.
Four concern-specific guides, matched to `quiz.html`'s existing four
concern segments (same options as `CONFIG.questions[0].opts`), delivered
by email right after the quiz.

- `thinning.md` — "Thinner-looking than before" (also the default fallback)
- `dry-brittle.md` — "Dry, rough or brittle"
- `oily-buildup.md` — "Oily roots / buildup"
- `breakage.md` — whenever the breakage question is answered "Yes,
  noticeably" — this overrides the hair-feel answer, since noticeable
  breakage is treated as the strongest signal regardless of what else was
  picked (see "How matching works" below)

## How matching works

Implemented in `quiz.html` as `matchProtocol(answers)` (added alongside
`PROTOCOL_NAMES`, right after the `state` var). It's a plain priority-order
function, no build step or scoring library needed:

1. If the breakage question is "Yes, noticeably" → `breakage`, regardless
   of the other two answers.
2. Otherwise, map the hair-feel question directly: "Thinner-looking than
   before" → `thinning`, "Dry, rough or brittle" → `dry-brittle`, "Oily
   roots / buildup" → `oily-buildup`.
3. If hair-feel was "Mostly fine, want to maintain," fall through to the
   scalp-type question: "Oily and weighed down" → `oily-buildup`, "Dry or
   tight" → `dry-brittle`.
4. Default (mostly fine + comfortable scalp + no real breakage) →
   `thinning`, since that guide is the most general/maintenance-oriented
   of the four.

`submitLead()` calls this and stores the result on `state.protocol`, which
`renderResult()` uses to show the matched protocol's name, and which is
sent with the lead payload as `attr.protocol` — so Klaviyo (once
connected) can segment on it, or it can be read manually from the lead
record today. **Actual delivery of the matching `.md` file's content is
still manual** — nothing in this repo emails or renders the guide text
itself yet; that's a real remaining gap, not solved by the matching logic
alone. `content/protocol/test-match-protocol.mjs` has a duplicated,
plain-assert copy of the matching function for testing — keep the two in
sync if the logic changes (no shared module here, per this repo's
no-build-step design).

## Claims compliance

Every guide follows this repo's claims policy (see root `CLAUDE.md`):
support/appearance framing only — nourishes/comforts the scalp,
conditions/softens/shines, helps hair *look* fuller and healthier, helps
reduce the *look* of breakage, clears buildup without stripping. Never:
regrowth, "stops hair fall," reverses greying, treats any condition,
"clinically proven" without a study. Each guide carries the same
disclaimer used on the quiz result screen: *not a medicine; not intended
to diagnose, treat, cure or prevent any disease.*
