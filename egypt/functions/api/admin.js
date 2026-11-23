// POST /api/admin { action, ... } with header "x-admin-token: <ADMIN_TOKEN>" — owner tools (used by the ops agent too).
//   { action:"voucher", n:10 }            → mints a one-time code worth n credits
//   { action:"credit", device, n }        → adds credits to a wallet code directly
//   { action:"joins" }                    → lists technician sign-ups
import { handle, HttpError } from "../../lib/claude.js";
import { addCredits, balance, device } from "../../lib/credits.js";
const ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function same(a, b) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }
export const onRequestPost = handle(async ({ request, env }) => {
  const t = request.headers.get("x-admin-token") || "";
  if (!env.ADMIN_TOKEN || env.ADMIN_TOKEN.length < 24 || !same(t, env.ADMIN_TOKEN)) throw new HttpError(401, "unauthorized");
  if (!env.PS_KV) throw new HttpError(503, "KV missing");
  const b = await request.json().catch(() => ({}));
  const n = Math.min(500, Math.max(1, Number(b.n) | 0));
  if (b.action === "voucher") {
    const code = [...crypto.getRandomValues(new Uint8Array(10))].map((x) => ALPH[x % ALPH.length]).join("");
    await env.PS_KV.put(`vc:${code}`, String(n), { expirationTtl: 60 * 60 * 24 * 90 });
    return { code, n };
  }
  if (b.action === "credit") { const dev = device(b.device); await addCredits(env, dev, n); return balance(env, dev); }
  if (b.action === "joins") {
    const list = await env.PS_KV.list({ prefix: "job:", limit: 200 });
    return { joins: await Promise.all(list.keys.map(async (k) => env.PS_KV.get(k.name, "json"))) };
  }
  throw new HttpError(400, "unknown action");
});
