// Vercel serverless function — counts paid founding-price orders so the
// quiz can close the ₹249 founding offer by itself once the first 200
// buyers have paid (PRODUCT.md → "Launch offer"). The 14-day half of the
// rule needs no server: quiz.html compares CONFIG.product.launchDate with
// today on its own.
//
// GET /api/offer?amount=249&since=2026-11-01&cap=200
//   amount  founding price in rupees (CONFIG.product.price), so the price
//           lives in one place; only captured payments of exactly this
//           amount count, which keeps the ₹299 oil and ₹259 subscription
//           out of the tally
//   since   CONFIG.product.launchDate (optional); payments before it are
//           ignored
//   cap     CONFIG.product.foundingCap; counting stops once it is reached
//
// Source of truth is Razorpay's own payments list (GET /v1/payments, Basic
// auth with RAZORPAY_KEY_ID:RAZORPAY_KEY_SECRET). That works whether the
// checkout is a Payment Link or a Payment Page, and refunded payments drop
// out because their status is no longer "captured". If all three stores take
// payment on one Razorpay account, the cap is shared across them.
//
// This only drives what the page DISPLAYS; the amount actually charged is
// whatever the payment link is set to. So it fails OPEN (the opposite of
// api/deliver.js): with no keys, or Razorpay unreachable, it answers
// configured:false / ok:false and the quiz keeps showing the founding price
// and founding link, which is what the buyer would be charged anyway.

var PAGE = 100;      // Razorpay's maximum page size
var MAX_PAGES = 20;  // scan at most 2,000 payments per call
var TTL_MS = 60 * 1000;
var cache = {};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  var q = req.query || {};
  var amount = toInt(q.amount);
  var cap = toInt(q.cap) || 200;
  var since = parseDate(q.since);
  if (!amount || amount > 100000 || cap > 100000) {
    return res.status(400).json({ ok: false, error: "amount (rupees) is required" });
  }

  var keyId = process.env.RAZORPAY_KEY_ID;
  var keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return res.status(200).json({ ok: true, configured: false, sold: null, cap: cap });
  }

  var key = [amount, cap, since || 0].join(":");
  var hit = cache[key];
  if (hit && Date.now() - hit.at < TTL_MS) {
    return send(res, hit.sold, cap);
  }

  try {
    var sold = await countPaid(keyId, keySecret, amount * 100, since, cap);
    cache[key] = { sold: sold, at: Date.now() };
    return send(res, sold, cap);
  } catch (err) {
    console.error("founding-offer count failed:", err);
    return res.status(200).json({ ok: false, configured: true, sold: null, cap: cap });
  }
}

function send(res, sold, cap) {
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res.status(200).json({ ok: true, configured: true, sold: sold, cap: cap, open: sold < cap });
}

export async function countPaid(keyId, keySecret, amountPaise, since, cap, fetchImpl) {
  var doFetch = fetchImpl || fetch;
  var auth = "Basic " + Buffer.from(keyId + ":" + keySecret).toString("base64");
  var sold = 0;
  for (var page = 0; page < MAX_PAGES; page++) {
    var url = "https://api.razorpay.com/v1/payments?count=" + PAGE + "&skip=" + page * PAGE +
      (since ? "&from=" + since : "");
    var r = await doFetch(url, { headers: { Authorization: auth } });
    if (!r.ok) throw new Error("Razorpay " + r.status);
    var body = await r.json();
    var items = (body && body.items) || [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].status === "captured" && items[i].amount === amountPaise) sold++;
    }
    if (sold >= cap || items.length < PAGE) break;
  }
  return sold;
}

function toInt(v) {
  var n = parseInt(v, 10);
  return isFinite(n) && n > 0 ? n : 0;
}

// "2026-11-01" -> unix seconds at 00:00 IST, or 0 if absent/invalid.
function parseDate(v) {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return 0;
  var t = Date.parse(v + "T00:00:00+05:30");
  return isFinite(t) ? Math.floor(t / 1000) : 0;
}
