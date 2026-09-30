// Plain-assert check for the matchProtocol logic in quiz.html.
// quiz.html is a single inline <script> with no module system (see repo
// CLAUDE.md — no build step), so this duplicates the function rather than
// importing it. Keep this in sync with matchProtocol() in quiz.html if
// either changes. Run: node content/protocol/test-match-protocol.mjs

function matchProtocol(answers) {
  var feel = answers[0] && answers[0].l,
    scalp = answers[1] && answers[1].l,
    breakage = answers[2] && answers[2].l;
  if (breakage === "Yes, noticeably") return "breakage";
  if (feel === "Thinner-looking than before") return "thinning";
  if (feel === "Dry, rough or brittle") return "dry-brittle";
  if (feel === "Oily roots / buildup") return "oily-buildup";
  if (scalp === "Oily and weighed down") return "oily-buildup";
  if (scalp === "Dry or tight") return "dry-brittle";
  return "thinning";
}

function a(l) {
  return { l: l };
}

// Breakage overrides everything when noticeable.
assertEq(
  matchProtocol([a("Mostly fine, want to maintain"), a("Comfortable"), a("Yes, noticeably")]),
  "breakage"
);

// Direct hair-feel mapping when breakage isn't the strongest signal.
assertEq(
  matchProtocol([a("Thinner-looking than before"), a("Comfortable"), a("Not really")]),
  "thinning"
);
assertEq(
  matchProtocol([a("Dry, rough or brittle"), a("Dry or tight"), a("A little")]),
  "dry-brittle"
);
assertEq(
  matchProtocol([a("Oily roots / buildup"), a("Oily and weighed down"), a("Not really")]),
  "oily-buildup"
);

// "Mostly fine" falls through to scalp type.
assertEq(
  matchProtocol([a("Mostly fine, want to maintain"), a("Oily and weighed down"), a("Not really")]),
  "oily-buildup"
);
assertEq(
  matchProtocol([a("Mostly fine, want to maintain"), a("Dry or tight"), a("A little")]),
  "dry-brittle"
);

// "Mostly fine" + comfortable scalp + no breakage: default.
assertEq(
  matchProtocol([a("Mostly fine, want to maintain"), a("Comfortable"), a("Not really")]),
  "thinning"
);

console.log("All tests passed.");

function assertEq(actual, expected) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}`);
  }
}
