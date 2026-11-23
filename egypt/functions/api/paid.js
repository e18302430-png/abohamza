// GET /api/paid?ref= — lets the front end show "تم الشحن" after Paymob redirects back.
import { guard, handle } from "../../lib/claude.js";
export const onRequestGet = handle(async ({ request, env }) => {
  await guard(request, env, { ai: false });
  const ref = String(new URL(request.url).searchParams.get("ref") || "");
  if (!/^yo[a-z0-9]{6,30}$/.test(ref) || !env.PS_KV) return { done: false };
  const n = Number(await env.PS_KV.get(`paid:${ref}`));
  return { done: !!n, n: n || 0 };
});
