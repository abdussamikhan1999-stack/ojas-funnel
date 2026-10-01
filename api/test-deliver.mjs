// Plain-assert check for the Razorpay signature verification in
// api/deliver.js. api/deliver.js is bundled by Vercel's own builder (no
// package.json "type":"module" here — see repo CLAUDE.md, no build step),
// so a plain `node` run can't `import` it directly the same way Vercel
// does; this duplicates the function, same convention as
// content/protocol/test-match-protocol.mjs duplicating matchProtocol.
// Keep this in sync with verifyRazorpaySignature() in api/deliver.js if
// either changes. Run: node api/test-deliver.mjs

import { createHmac, timingSafeEqual } from "node:crypto";

var VALID_PROTOCOLS = ["thinning", "dry-brittle", "oily-buildup", "breakage"];

function resolveProtocol(q) {
  return VALID_PROTOCOLS.includes(q.protocol) ? q.protocol : "thinning";
}

function verifyRazorpaySignature(q, secret) {
  var id = q.razorpay_payment_link_id || "";
  var ref = q.razorpay_payment_link_reference_id || "";
  var status = q.razorpay_payment_link_status || "";
  var paymentId = q.razorpay_payment_id || "";
  var signature = q.razorpay_signature || "";
  if (!id || !status || !paymentId || !signature) return false;

  var expected = createHmac("sha256", secret).update(id + "|" + ref + "|" + status + "|" + paymentId).digest("hex");
  var a = Buffer.from(expected, "utf8");
  var b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function sign(id, ref, status, paymentId, secret) {
  return createHmac("sha256", secret).update(id + "|" + ref + "|" + status + "|" + paymentId).digest("hex");
}

var SECRET = "test_secret_123";

// A genuinely signed, paid payment passes.
var good = {
  razorpay_payment_link_id: "plink_abc",
  razorpay_payment_link_reference_id: "ref1",
  razorpay_payment_link_status: "paid",
  razorpay_payment_id: "pay_xyz",
};
good.razorpay_signature = sign(
  good.razorpay_payment_link_id,
  good.razorpay_payment_link_reference_id,
  good.razorpay_payment_link_status,
  good.razorpay_payment_id,
  SECRET
);
assert(verifyRazorpaySignature(good, SECRET) === true, "valid signature should verify");

// Reference ID is allowed to be empty (a payment link with none set).
var noRef = Object.assign({}, good, { razorpay_payment_link_reference_id: "" });
noRef.razorpay_signature = sign(noRef.razorpay_payment_link_id, "", noRef.razorpay_payment_link_status, noRef.razorpay_payment_id, SECRET);
assert(verifyRazorpaySignature(noRef, SECRET) === true, "empty reference id should still verify");

// Tampered status (e.g. someone hand-editing the query string) fails.
var tampered = Object.assign({}, good, { razorpay_payment_link_status: "paid_but_edited" });
assert(verifyRazorpaySignature(tampered, SECRET) === false, "tampered field should fail verification");

// Wrong secret (e.g. before RAZORPAY_KEY_SECRET is set correctly) fails.
assert(verifyRazorpaySignature(good, "wrong_secret") === false, "wrong secret should fail verification");

// Missing params fail closed, not open.
assert(verifyRazorpaySignature({}, SECRET) === false, "empty params should fail verification");

// Protocol fallback: unknown/missing slug defaults to "thinning", same as
// quiz.html's own matchProtocol() default.
assert(resolveProtocol({ protocol: "oily-buildup" }) === "oily-buildup", "known protocol passes through");
assert(resolveProtocol({ protocol: "not-a-real-protocol" }) === "thinning", "unknown protocol falls back to thinning");
assert(resolveProtocol({}) === "thinning", "missing protocol falls back to thinning");

console.log("All tests passed.");

function assert(cond, msg) {
  if (!cond) throw new Error("FAILED: " + msg);
}
