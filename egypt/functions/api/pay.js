// POST /api/pay { device, pack } — creates a Paymob payment intention and returns the Unified Checkout URL.
// Secrets/vars: PAYMOB_SECRET_KEY, PAYMOB_PUBLIC_KEY, PAYMOB_INTEGRATION_IDS ("123,456" — card + wallet), PAYMOB_HMAC, ALLOWED_ORIGIN.
// API shape follows Paymob's Intention API docs; check it against your dashboard before going live (see LAUNCH-AR.md).
import { guard, handle, HttpError } from "../../lib/claude.js";
import { device, PACKS } from "../../lib/credits.js";

export const onRequestPost = handle(async ({ request, env }) => {
  const b = await guard(request, env, { ai: false });
  const dev = device(b.device);
  const pack = PACKS[b.pack];
  if (!pack) throw new HttpError(400, "اختار باقة.");
  if (!(env.PAYMOB_SECRET_KEY && env.PAYMOB_PUBLIC_KEY && env.PAYMOB_INTEGRATION_IDS && env.PS_KV)) throw new HttpError(503, "الدفع الأونلاين لسه ما اشتغلش. استخدم إنستاباي أو فودافون كاش.");
  const ref = `yo${Date.now().toString(36)}${crypto.randomUUID().slice(0, 8)}`;
  await env.PS_KV.put(`po:${ref}`, JSON.stringify({ dev, pack: b.pack }), { expirationTtl: 60 * 60 * 24 * 3 });
  const site = env.ALLOWED_ORIGIN || new URL(request.url).origin;
  const r = await fetch("https://accept.paymob.com/v1/intention/", {
    method: "POST",
    headers: { authorization: `Token ${env.PAYMOB_SECRET_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      amount: pack.egp * 100, currency: "EGP",
      payment_methods: String(env.PAYMOB_INTEGRATION_IDS).split(",").map((s) => Number(s.trim())).filter(Boolean),
      items: [{ name: `YaOsta ${b.pack}`, amount: pack.egp * 100, description: pack.label, quantity: 1 }],
      billing_data: { first_name: "YaOsta", last_name: "User", email: "na@na.com", phone_number: "+201000000000", apartment: "NA", floor: "NA", street: "NA", building: "NA", city: "NA", state: "NA", country: "EG", postal_code: "NA", shipping_method: "NA" },
      special_reference: ref,
      notification_url: `${site}/api/paymob-webhook`,
      redirection_url: `${site}/?paid=${ref}#wallet`,
    }),
  });
  const out = await r.json().catch(() => ({}));
  if (!r.ok || !out.client_secret) { console.error("paymob intention", r.status); throw new HttpError(502, "بوابة الدفع مش بترد دلوقتي. جرّب كمان شوية."); }
  return { url: `https://accept.paymob.com/unifiedcheckout/?publicKey=${encodeURIComponent(env.PAYMOB_PUBLIC_KEY)}&clientSecret=${encodeURIComponent(out.client_secret)}`, ref };
});
