// GET /api/weather?zip=10001 — active National Weather Service alerts for a U.S. ZIP code.
import { cached, guard, handle, HttpError } from "../../lib/claude.js";

const UA = { "user-agent": "Fixwise (home repair helper)", accept: "application/geo+json" };
export const onRequestGet = handle(async ({ request, env }) => {
  await guard(request, env, { ai: false });
  const zip = String(new URL(request.url).searchParams.get("zip") || "").replace(/\D/g, "").slice(0, 5);
  if (zip.length !== 5) throw new HttpError(400, "Enter a 5-digit ZIP code.");
  return cached(env, "wx:" + zip, 60 * 15, async () => {
    const g = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!g.ok) throw new HttpError(404, "We couldn't find that ZIP code.");
    const pl = ((await g.json()).places || [])[0];
    const lat = (+pl.latitude).toFixed(4), lon = (+pl.longitude).toFixed(4);
    const r = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, { headers: UA });
    if (!r.ok) throw new HttpError(502, "The National Weather Service isn't answering. Try again soon.");
    const alerts = ((await r.json()).features || []).slice(0, 8).map((f) => ({ event: f.properties.event, severity: f.properties.severity, headline: f.properties.headline, instruction: (f.properties.instruction || "").slice(0, 600), expires: f.properties.expires }));
    return { place: `${pl["place name"]}, ${pl["state abbreviation"]}`, alerts, checked: new Date().toISOString(), source: "National Weather Service" };
  });
});
