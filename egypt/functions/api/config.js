// GET /api/config — public settings for the front end. Payment details live in Cloudflare variables.
import { PACKS } from "../../lib/credits.js";
import { KINDS } from "./report.js";
export function onRequestGet({ env }) {
  const v = (k) => env[k] || "";
  const out = {
    turnstile: v("TURNSTILE_SITE_KEY"),
    ai: !!env.ANTHROPIC_API_KEY,
    pay: !!(env.PAYMOB_SECRET_KEY && env.PAYMOB_PUBLIC_KEY && env.PAYMOB_INTEGRATION_IDS && env.PAYMOB_HMAC && env.PS_KV),
    packs: PACKS,
    reports: Object.fromEntries(Object.entries(KINDS).map(([k, v]) => [k, { cost: v.cost, min: v.min, title: v.title }])),
    free_per_day: Number(env.FREE_PER_DAY || 3),
    manual: { instapay: v("INSTAPAY_HANDLE"), vcash: v("VODAFONE_CASH_NUMBER"), whatsapp: v("OWNER_WHATSAPP") },
  };
  return new Response(JSON.stringify(out), { headers: { "content-type": "application/json", "cache-control": "max-age=300" } });
}
