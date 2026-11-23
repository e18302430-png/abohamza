// GET /api/config — public front-end settings (the Turnstile site key is public by design).
export function onRequestGet({ env }) {
  return new Response(JSON.stringify({ turnstile: env.TURNSTILE_SITE_KEY || "" }), { headers: { "content-type": "application/json", "cache-control": "max-age=300" } });
}
