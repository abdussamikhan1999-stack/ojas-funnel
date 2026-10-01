// Vercel serverless function — delivers the paid digital protocol after a
// real Razorpay payment, closing the gap PRODUCT.md flags twice as
// unresolved: "nothing sends the matched guide's content to the buyer yet."
//
// How it's wired (see SETUP.md): the Razorpay Payment Link's "Redirect URL"
// is set to https://<domain>/deliver. Razorpay appends its own signed
// params to that URL after a successful payment; deliver.html forwards them
// here (plus the protocol slug it reads from localStorage, set during the
// quiz) as query params.
//
// Security model: this gates a ~0-COGS digital good behind proof of a real
// payment, not behind identity — so it only verifies Razorpay's HMAC
// signature on the redirect params (documented formula: hmac_sha256(
// payment_link_id + "|" + reference_id + "|" + status + "|" + payment_id,
// key_secret)). No email/identity cross-check; add one later only if
// content ever needs to be restricted to a specific buyer, not just "someone
// who paid." Unlike api/lead.js, this fails CLOSED when RAZORPAY_KEY_SECRET
// isn't set yet — paid content should never leak just because a dependency
// hasn't been configured.

import { createHmac, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

var VALID_PROTOCOLS = ["thinning", "dry-brittle", "oily-buildup", "breakage"];
var PROTOCOL_NAMES = {
  "thinning": "Thinner-Looking Hair Protocol",
  "dry-brittle": "Dry & Brittle Hair Protocol",
  "oily-buildup": "Oily Roots & Buildup Protocol",
  "breakage": "Breakage Protocol",
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  var q = req.query || {};
  var protocol = VALID_PROTOCOLS.includes(q.protocol) ? q.protocol : "thinning";

  var secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return res.status(503).json({ ok: false, error: "Payment verification not configured yet" });
  }

  if (!verifyRazorpaySignature(q, secret) || q.razorpay_payment_link_status !== "paid") {
    return res.status(403).json({ ok: false, error: "Payment not verified" });
  }

  var markdown;
  try {
    markdown = readFileSync(join(process.cwd(), "content", "protocol", protocol + ".md"), "utf8");
  } catch (err) {
    console.error("protocol content read failed:", err);
    return res.status(500).json({ ok: false, error: "Content unavailable" });
  }

  return res.status(200).json({ ok: true, protocol: protocol, name: PROTOCOL_NAMES[protocol], markdown: markdown });
}

export function verifyRazorpaySignature(q, secret) {
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
