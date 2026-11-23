// POST /api/paymob-webhook?hmac=… — Paymob "transaction processed" callback. Adds credits once per transaction.
// HMAC-SHA512 over these fields in this order (Paymob Accept docs). VERIFY the list against the current docs before launch.
import { addCredits, PACKS } from "../../lib/credits.js";

const FIELDS = ["amount_cents", "created_at", "currency", "error_occured", "has_parent_transaction", "id", "integration_id", "is_3d_secure", "is_auth", "is_capture", "is_refunded", "is_standalone_payment", "is_voided", "order.id", "owner", "pending", "source_data.pan", "source_data.sub_type", "source_data.type", "success"];
const get = (o, path) => path.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
async function hmac512(key, msg) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  return [...new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg)))].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function same(a, b) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }
export function signedString(obj) { return FIELDS.map((f) => { const v = get(obj, f); return v == null ? "" : String(v); }).join(""); }

export async function onRequestPost({ request, env }) {
  const ok = () => new Response("ok");
  if (!env.PAYMOB_HMAC || !env.PS_KV) return new Response("not configured", { status: 503 });
  let body; try { body = await request.json(); } catch { return new Response("bad", { status: 400 }); }
  const obj = body && body.obj;
  const given = String(new URL(request.url).searchParams.get("hmac") || "").toLowerCase();
  if (!obj || !given || !same(await hmac512(env.PAYMOB_HMAC, signedString(obj)), given)) return new Response("bad signature", { status: 401 });
  if (!(obj.success === true && obj.pending === false && obj.is_refunded === false && obj.is_voided === false)) return ok();
  const ref = obj.order?.merchant_order_id || obj.special_reference || obj.payment_key_claims?.extra?.special_reference;
  const po = ref && (await env.PS_KV.get(`po:${ref}`, "json"));
  if (!po || !PACKS[po.pack]) { console.error("paymob: unknown ref"); return ok(); }
  const pack = PACKS[po.pack];
  if (Number(obj.amount_cents) !== pack.egp * 100 || obj.currency !== "EGP") { console.error("paymob: amount mismatch"); return ok(); }
  const tk = `tx:${obj.id}`;
  if (await env.PS_KV.get(tk)) return ok(); // already credited
  await env.PS_KV.put(tk, ref, { expirationTtl: 60 * 60 * 24 * 400 });
  await env.PS_KV.delete(`po:${ref}`);
  await env.PS_KV.put(`paid:${ref}`, String(pack.n), { expirationTtl: 60 * 60 * 24 * 3 });
  await addCredits(env, po.dev, pack.n);
  env.EVENTS?.writeDataPoint({ blobs: ["paid", po.pack], doubles: [pack.egp], indexes: ["paid"] });
  return ok();
}
