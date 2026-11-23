// Credits and free quota for YaOsta. No accounts: each phone gets a random "wallet code" (device token)
// that the user can copy to restore their balance on another phone.
// KV keys: fr:<day>:<dev> free uses today · fri:<day>:<ip> free uses per IP · cr:<dev> paid credits ·
//          tx:<id> processed payment (idempotency) · fu:<id> follow-up tickets · vc:<code> voucher codes.
import { HttpError, sha256 } from "./claude.js";

export const PACKS = {
  p3: { n: 3, egp: 49, label: "٣ تشخيصات" },
  p10: { n: 10, egp: 129, label: "١٠ تشخيصات" },
  p30: { n: 30, egp: 299, label: "٣٠ تشخيص (للعيلة والصنايعي)" },
};
const DEV = /^[a-z0-9]{24,40}$/;
const day = () => new Date().toISOString().slice(0, 10);

export function device(v) {
  const d = String(v || "").toLowerCase();
  if (!DEV.test(d)) throw new HttpError(400, "افتح التطبيق من الأول وجرّب تاني.");
  return d;
}
async function num(env, k) { try { return Number((await env.PS_KV.get(k)) || 0); } catch { return 0; } }
async function put(env, k, v, ttl) { try { await env.PS_KV.put(k, String(v), ttl ? { expirationTtl: ttl } : undefined); } catch {} }

export async function balance(env, dev) {
  if (!env.PS_KV) return { credits: 0, free_left: freeCap(env), open: true };
  const used = await num(env, `fr:${day()}:${dev}`);
  return { credits: await num(env, `cr:${dev}`), free_left: Math.max(0, freeCap(env) - used) };
}
const freeCap = (env) => Number(env.FREE_PER_DAY || 3);

// Takes one unit (free first, then a paid credit). Returns a receipt for refund().
export async function spend(env, request, dev) {
  if (!env.PS_KV) return { src: "open" }; // local development without KV
  const ip = (await sha256((request.headers.get("cf-connecting-ip") || "anon") + (env.IP_SALT || "yo"))).slice(0, 16);
  const fk = `fr:${day()}:${dev}`, ik = `fri:${day()}:${ip}`;
  const used = await num(env, fk), ipUsed = await num(env, ik);
  if (used < freeCap(env) && ipUsed < freeCap(env) * 3) {
    await put(env, fk, used + 1, 172800); await put(env, ik, ipUsed + 1, 172800);
    return { src: "free", fk, ik, free_left: freeCap(env) - used - 1 };
  }
  const ck = `cr:${dev}`, c = await num(env, ck);
  if (c <= 0) throw new HttpError(402, "خلصت التشخيصات المجانية بتاعة النهارده. اشحن رصيد صغير أو استنى لبكرة.");
  await put(env, ck, c - 1);
  return { src: "credit", ck, credits: c - 1 };
}
export async function refund(env, r) {
  if (!r || !env.PS_KV) return;
  if (r.src === "free") { await put(env, r.fk, Math.max(0, (await num(env, r.fk)) - 1), 172800); await put(env, r.ik, Math.max(0, (await num(env, r.ik)) - 1), 172800); }
  if (r.src === "credit") await put(env, r.ck, (await num(env, r.ck)) + 1);
}
// Runs fn() only on a cache miss, charging one unit and refunding it if the AI call fails.
export async function metered(env, request, dev, meter, fn) {
  const r = await spend(env, request, dev);
  Object.assign(meter, { charged: r.src, free_left: r.free_left, credits: r.credits });
  try { return await fn(); } catch (e) { await refund(env, r); meter.charged = "refunded"; throw e; }
}
export async function addCredits(env, dev, n) {
  const ck = `cr:${dev}`;
  await put(env, ck, (await num(env, ck)) + n);
}
// Follow-up questions: each diagnosis gives a ticket with 5 questions.
export async function newTicket(env) {
  const id = crypto.randomUUID().replace(/-/g, "");
  if (env.PS_KV) await put(env, `fu:${id}`, 5, 60 * 60 * 24 * 7);
  return id;
}
export async function useTicket(env, id) {
  if (!env.PS_KV) return 5;
  if (!/^[a-f0-9]{32}$/.test(String(id || ""))) throw new HttpError(400, "اعمل تشخيص الأول وبعدين اسأل.");
  const left = await num(env, `fu:${id}`);
  if (left <= 0) throw new HttpError(402, "خلصت الأسئلة بتاعة التشخيص ده. اعمل تشخيص جديد لو محتاج.");
  await put(env, `fu:${id}`, left - 1, 60 * 60 * 24 * 7);
  return left - 1;
}
