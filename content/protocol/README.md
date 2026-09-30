# The Ojas Hair & Scalp Protocol — content

The actual deliverable for the digital product defined in `PRODUCT.md`.
Four concern-specific guides, matched to `quiz.html`'s existing four
concern segments (same options as `CONFIG.questions[0].opts`), delivered
by email right after the quiz.

- `thinning.md` — "Thinner-looking than before"
- `dry-brittle.md` — "Dry, rough or brittle"
- `oily-buildup.md` — "Oily roots / buildup"
- `breakage.md` — for anyone who answered "Yes, noticeably" or "A little"
  on the breakage question, regardless of their first answer (breakage is
  scored as a modifier, not a fourth exclusive segment — see "How
  matching works" below)

## How matching works

`quiz.html` currently collects three questions (hair feel, scalp type,
breakage) but has no scoring/matching layer — SETUP.md and the repo's
CLAUDE.md both note the quiz is "single product, no scoring" and that a
second segmentation layer "isn't there to extend" without being built.
Wiring the quiz's answers to actually pick one of these four files is
**separate engineering work**, not part of this content task. Until that
exists, delivery is manual: read the lead's answers (collected and sent
with the lead per the repo's lead-capture flow) and send the matching
file.

## Claims compliance

Every guide follows this repo's claims policy (see root `CLAUDE.md`):
support/appearance framing only — nourishes/comforts the scalp,
conditions/softens/shines, helps hair *look* fuller and healthier, helps
reduce the *look* of breakage, clears buildup without stripping. Never:
regrowth, "stops hair fall," reverses greying, treats any condition,
"clinically proven" without a study. Each guide carries the same
disclaimer used on the quiz result screen: *not a medicine; not intended
to diagnose, treat, cure or prevent any disease.*
