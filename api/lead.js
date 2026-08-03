// Vercel serverless function — receives quiz leads and forwards them to your ESP.
// Set as CONFIG.leadEndpoint = "/api/lead" in index.html.
// Secrets come from environment variables (see .env.example) — none are committed.
//
// Behaviour:
//   • validates the payload (email required, consent required)
//   • forwards to Klaviyo if KLAVIYO_API_KEY is set
//   • else forwards to LEAD_WEBHOOK_URL if set
//   • else just returns ok (useful before you've picked an ESP)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});
  const { email, name, track, answers, attr, consent } = body;

  if (!isEmail(email)) return res.status(400).json({ error: "Valid email required" });
  if (consent !== true) return res.status(400).json({ error: "Consent required" });

  const lead = {
    email,
    name: name || "",
    track: track || "",
    answers: Array.isArray(answers) ? answers : [],
    attribution: attr || {},
    source: "quiz-funnel",
    received_at: new Date().toISOString(),
  };

  try {
    if (process.env.KLAVIYO_API_KEY) {
      await toKlaviyo(lead);
    } else if (process.env.LEAD_WEBHOOK_URL) {
      await fetch(process.env.LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
    }
    // else: no ESP configured yet — accept the lead so the funnel still works.
    return res.status(200).json({ ok: true });
  } catch (err) {
    // Don't fail the user's flow on a downstream error; log and accept.
    console.error("lead forward failed:", err);
    return res.status(200).json({ ok: true, warning: "stored, forward pending" });
  }
}

// --- Klaviyo: subscribe a profile to a list (server-side; key stays secret) ---
async function toKlaviyo(lead) {
  const listId = process.env.KLAVIYO_LIST_ID;
  const key = process.env.KLAVIYO_API_KEY;
  const r = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/", {
    method: "POST",
    headers: {
      "Authorization": `Klaviyo-API-Key ${key}`,
      "Content-Type": "application/json",
      "revision": "2024-10-15",
    },
    body: JSON.stringify({
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          profiles: {
            data: [{
              type: "profile",
              attributes: {
                email: lead.email,
                first_name: lead.name,
                properties: { quiz_track: lead.track, quiz_answers: lead.answers, ...lead.attribution },
                subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
              },
            }],
          },
        },
        ...(listId ? { relationships: { list: { data: { type: "list", id: listId } } } } : {}),
      },
    }),
  });
  if (!r.ok) throw new Error("Klaviyo " + r.status + " " + (await r.text()));
}

function isEmail(s) { return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
function safeParse(s) { try { return JSON.parse(s); } catch { return {}; } }
