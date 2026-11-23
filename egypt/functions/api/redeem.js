// POST /api/redeem { device, code } — voucher codes for manual InstaPay / Vodafone Cash payments
// (the owner mints them in /api/admin after the money arrives). Each code works once.
import { guard, handle, HttpError } from "../../lib/claude.js";
import { addCredits, balance, device } from "../../lib/credits.js";
export const onRequestPost = handle(async ({ request, env }) => {
  const b = await guard(request, env, { ai: false });
  const dev = device(b.device);
  const code = String(b.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^[A-Z0-9]{8,16}$/.test(code) || !env.PS_KV) throw new HttpError(400, "الكود ده مش صحيح.");
  const n = Number(await env.PS_KV.get(`vc:${code}`));
  if (!n) throw new HttpError(404, "الكود ده مش صحيح أو اتستخدم قبل كده.");
  await env.PS_KV.delete(`vc:${code}`);
  await addCredits(env, dev, n);
  return { added: n, ...(await balance(env, dev)) };
});
