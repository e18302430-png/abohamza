// POST /api/event { e, p } — anonymous funnel events (no cookies, no IDs) into Workers Analytics Engine.
const OK = new Set(["view", "label_start", "label_read", "label_confirm", "symptom", "results", "click", "save", "filter", "recall", "calc", "pro"]);
export async function onRequestPost({ request, env }) {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return new Response(null, { status: 204 });
  if (Number(request.headers.get("content-length") || 0) > 2000) return new Response(null, { status: 413 });
  try {
    const { e, p = {} } = await request.json();
    if (OK.has(e) && env.EVENTS) env.EVENTS.writeDataPoint({ blobs: [e, String(p.type || ""), String(p.partner || ""), String(p.src || "")].map((s) => s.slice(0, 64)), indexes: [e] });
  } catch {}
  return new Response(null, { status: 204 });
}
