// GET /api/vehicle?vin=1HGCM82633A004352 — free U.S. government data (NHTSA):
// vPIC decodes the VIN, then the Recalls API lists open campaigns for that make/model/year.
import { cached, guard, handle, HttpError } from "../../lib/claude.js";

const UA = { "user-agent": "Fixwise (home repair helper)", accept: "application/json" };
export const onRequestGet = handle(async ({ request, env }) => {
  await guard(request, env, { ai: false });
  const vin = String(new URL(request.url).searchParams.get("vin") || "").toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
  if (vin.length !== 17) throw new HttpError(400, "A VIN has 17 characters (no I, O or Q). It's on the driver-side dashboard or door sticker.");
  return cached(env, "vin:" + vin, 60 * 60 * 24, async () => {
    const r = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`, { headers: UA });
    if (!r.ok) throw new HttpError(502, "The NHTSA VIN service isn't answering. Try again soon.");
    const v = ((await r.json()).Results || [])[0] || {};
    if (!v.Make || !v.ModelYear) throw new HttpError(422, "We couldn't decode that VIN. Check each character.");
    const car = { vin, year: v.ModelYear, make: v.Make, model: v.Model, trim: v.Trim || "", engine: [v.DisplacementL && `${(+v.DisplacementL).toFixed(1)}L`, v.EngineCylinders && `${v.EngineCylinders}-cyl`].filter(Boolean).join(" "), fuel: v.FuelTypePrimary || "", drive: v.DriveType || "", body: v.BodyClass || "" };
    const q = new URLSearchParams({ make: car.make, model: car.model, modelYear: car.year });
    let recalls = [], partial = false;
    try {
      const rr = await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?${q}`, { headers: UA });
      const j = rr.ok ? await rr.json() : null;
      if (!j) partial = true;
      recalls = ((j && j.results) || []).slice(0, 25).map((x) => ({ id: x.NHTSACampaignNumber, component: x.Component, summary: x.Summary, consequence: x.Consequence, remedy: x.Remedy, date: x.ReportReceivedDate, parkIt: !!x.parkIt, parkOutside: !!x.parkOutSide }));
    } catch { partial = true; }
    return { car, recalls, partial, source: "NHTSA vPIC and Recalls API" };
  });
});
