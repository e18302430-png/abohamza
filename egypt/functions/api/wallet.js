// GET /api/wallet?device= — free uses left today and paid credits for this wallet code.
import { guard, handle } from "../../lib/claude.js";
import { balance, device } from "../../lib/credits.js";
export const onRequestGet = handle(async ({ request, env }) => {
  await guard(request, env, { ai: false });
  return balance(env, device(new URL(request.url).searchParams.get("device")));
});
