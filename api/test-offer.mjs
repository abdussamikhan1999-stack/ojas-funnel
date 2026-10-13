// Plain-assert check for the founding-offer counter in api/offer.js, with
// Razorpay's payments API faked. Run: node api/test-offer.mjs
import assert from "node:assert/strict";
import handler, { countPaid } from "./offer.js";

function fakeRazorpay(payments) {
  var calls = [];
  var impl = async function (url, opts) {
    calls.push(url);
    assert.match(opts.headers.Authorization, /^Basic /);
    var skip = +new URL(url).searchParams.get("skip");
    return { ok: true, json: async () => ({ items: payments.slice(skip, skip + 100) }) };
  };
  impl.calls = calls;
  return impl;
}

function pay(n, amount, status) {
  return Array.from({ length: n }, () => ({ amount: amount, status: status || "captured" }));
}

// Only captured ₹249 payments count; oil, subscription and refunds don't.
var mixed = [].concat(pay(30, 24900), pay(10, 29900), pay(5, 25900), pay(4, 24900, "refunded"), pay(2, 24900, "failed"));
assert.equal(await countPaid("id", "secret", 24900, 0, 200, fakeRazorpay(mixed)), 30);

// Pages through results and stops once the cap is reached.
var many = pay(450, 24900);
var f = fakeRazorpay(many);
assert.equal(await countPaid("id", "secret", 24900, 0, 200, f), 200);
assert.equal(f.calls.length, 2);

// "since" is passed through as Razorpay's from= filter.
f = fakeRazorpay([]);
await countPaid("id", "secret", 24900, 1793500000, 200, f);
assert.match(f.calls[0], /from=1793500000/);

// Razorpay errors throw (the handler turns that into ok:false).
await assert.rejects(countPaid("id", "secret", 24900, 0, 200, async () => ({ ok: false, status: 401 })));

// Handler: no keys -> configured:false, quiz keeps the founding price.
function res() {
  var r = { headers: {} };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  r.status = (c) => { r.code = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  return r;
}
delete process.env.RAZORPAY_KEY_ID;
delete process.env.RAZORPAY_KEY_SECRET;
var r = await handler({ method: "GET", query: { amount: "249", cap: "200" } }, res());
assert.deepEqual([r.code, r.body.configured, r.body.sold], [200, false, null]);

r = await handler({ method: "GET", query: {} }, res());
assert.equal(r.code, 400);

r = await handler({ method: "POST", query: {} }, res());
assert.equal(r.code, 405);

console.log("api/offer.js: all checks passed");
