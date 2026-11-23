// GET /api/config: public front-end settings. Affiliate IDs and checkout links live in Cloudflare
// variables so they can change without a redeploy. "plans" is true only when paid plans can really be delivered.
export function onRequestGet({ env }) {
  const v = (k) => env[k] || "";
  const plans = !!(env.ANTHROPIC_API_KEY && (env.PAYHIP_SECRET_SINGLE || env.PAYHIP_SECRET_PACK || env.PAYHIP_SECRET_YEAR));
  const out = {
    turnstile: v("TURNSTILE_SITE_KEY"),
    ai: !!env.ANTHROPIC_API_KEY,
    plans,
    AMAZON_TAG: v("AMAZON_TAG"), EBAY_CAMPID: v("EBAY_CAMPID"), PARTSELECT_WRAP: v("PARTSELECT_WRAP"), FILTERBUY_WRAP: v("FILTERBUY_WRAP"),
    PAYHIP: { single: v("PAYHIP_LINK_SINGLE"), pack: v("PAYHIP_LINK_PACK"), year: v("PAYHIP_LINK_YEAR") },
    PRO: { sears: v("PRO_LINK_SEARS"), call: v("PRO_CALL_NUMBER") },
  };
  return new Response(JSON.stringify(out), { headers: { "content-type": "application/json", "cache-control": "max-age=300" } });
}
