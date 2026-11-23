// GET /api/recalls?model=WTW5000DW1&brand=Whirlpool&type=washer
// Checks the US Consumer Product Safety Commission recall database (free, public data).
// Docs: https://www.cpsc.gov/node/5808 (Recall Retrieval Web Services).
import { cached, guard, handle, HttpError, json } from "../../lib/claude.js";

const API = "https://www.saferproducts.gov/RestWebServices/Recall";
const WORD = { washer: "washer", dryer: "dryer", dishwasher: "dishwasher", refrigerator: "refrigerator", range: "range", microwave: "microwave", disposal: "disposer" };

async function query(params) {
  const u = new URL(API);
  u.searchParams.set("format", "json");
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u, { headers: { accept: "application/json" }, cf: { cacheTtl: 21600 } });
  if (!r.ok) throw new HttpError(502, "The recall database is not answering right now. Try again later.");
  const data = await r.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

const shape = (r) => ({
  id: r.RecallID,
  number: r.RecallNumber,
  date: String(r.RecallDate || "").slice(0, 10),
  title: r.Title || "",
  url: r.URL || "",
  hazard: (r.Hazards || []).map((h) => h.Name).filter(Boolean).join(" "),
  remedy: (r.Remedies || []).map((h) => h.Name).filter(Boolean).join(" "),
  models: (r.Products || []).map((p) => p.Model || "").join(" ").slice(0, 2000),
});

export const onRequestGet = handle(async ({ request, env }) => {
  await guard(request, env, { ai: false });
  const q = new URL(request.url).searchParams;
  const model = String(q.get("model") || "").toUpperCase().replace(/[^A-Z0-9./-]/g, "").slice(0, 40);
  const brand = String(q.get("brand") || "").replace(/[^A-Za-z0-9 &-]/g, "").slice(0, 40);
  const word = WORD[q.get("type")] || "";
  if (model.length < 4) throw new HttpError(400, "Enter a model number to check.");
  return cached(env, `recall:${model}:${brand}:${word}`, 60 * 60 * 12, async () => {
    const norm = (x) => String(x || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const full = norm(model);
    const base = full.slice(0, Math.max(6, full.length - 2));
    // The model query must succeed; an outage must never look like "no recalls".
    const byModel = await query({ ProductModel: model });
    let byName = [], partial = false;
    if (brand && word) { try { byName = await query({ Manufacturer: brand, ProductName: word }); } catch { partial = true; } }
    const seen = new Set();
    const exact = [], possible = [], related = [];
    for (const r of [...byModel, ...byName].map(shape)) {
      if (seen.has(r.id)) continue; seen.add(r.id);
      if (!/^https:\/\//.test(r.url)) r.url = "";
      const tokens = r.models.toUpperCase().split(/[\s,;]+/).map(norm);
      if (tokens.includes(full) || norm(r.models).includes(full)) exact.push(r);
      else if (tokens.some((t) => t.length >= 6 && (t.startsWith(base) || base.startsWith(t)))) possible.push(r);
      else related.push(r);
    }
    related.sort((x, y) => y.date.localeCompare(x.date));
    return { checked: new Date().toISOString(), model, exact, possible, related: related.slice(0, 5), partial, source: "U.S. Consumer Product Safety Commission" };
  });
});
