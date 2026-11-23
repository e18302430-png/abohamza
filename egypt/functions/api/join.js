// POST /api/join { name, phone, craft, area, consent } — technician waiting list (stored 180 days, owner reads it via /api/admin).
import { guard, handle, HttpError } from "../../lib/claude.js";
const clean = (s, n) => String(s || "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, n);
export const onRequestPost = handle(async ({ request, env }) => {
  const b = await guard(request, env, { ai: false });
  if (b.consent !== true) throw new HttpError(400, "لازم توافق على شروط التسجيل.");
  const phone = clean(b.phone, 20).replace(/[^\d+]/g, "");
  if (!/^(\+?20|0)1[0125]\d{8}$/.test(phone)) throw new HttpError(400, "اكتب رقم موبايل مصري صحيح.");
  const rec = { name: clean(b.name, 60), phone, craft: clean(b.craft, 40), area: clean(b.area, 60), at: new Date().toISOString() };
  if (!rec.name || !rec.craft || !rec.area) throw new HttpError(400, "كمّل البيانات.");
  if (env.PS_KV) await env.PS_KV.put(`job:${Date.now()}:${crypto.randomUUID().slice(0, 8)}`, JSON.stringify(rec), { expirationTtl: 60 * 60 * 24 * 180 });
  return { ok: true };
});
