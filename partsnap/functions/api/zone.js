// GET /api/zone?zip=10001 — USDA plant hardiness zone for a ZIP (community dataset phzmapi.org, based on USDA maps).
import { cached, guard, handle, HttpError } from "../../lib/claude.js";

export const onRequestGet = handle(async ({ request, env }) => {
  await guard(request, env, { ai: false });
  const zip = String(new URL(request.url).searchParams.get("zip") || "").replace(/\D/g, "").slice(0, 5);
  if (zip.length !== 5) throw new HttpError(400, "Enter a 5-digit ZIP code.");
  return cached(env, "zone:" + zip, 60 * 60 * 24 * 30, async () => {
    const r = await fetch(`https://phzmapi.org/${zip}.json`);
    if (!r.ok) throw new HttpError(404, "We don't have a zone for that ZIP code.");
    const j = await r.json();
    return { zip, zone: j.zone, range: j.temperature_range, source: "phzmapi.org (based on USDA hardiness zone maps)" };
  });
});
