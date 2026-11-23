// Shared helpers for the Fixwise API (Cloudflare Pages Functions).
// Secrets: ANTHROPIC_API_KEY, TURNSTILE_SECRET. Bindings (optional): PS_KV (KV), EVENTS (Analytics Engine).
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-5-5";
const MAX_BODY = 7_000_000;
const MAX_IMAGE_B64 = 5_500_000;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const TYPES = ["washer", "dryer", "dishwasher", "refrigerator", "range", "microwave", "disposal"];

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });
}

const today = () => new Date().toISOString().slice(0, 10);

// Approximate counters in KV (eventually consistent; good enough as a brake).
// Best-effort brake only: KV is eventually consistent and allows ~1 write/sec per key.
// The hard spend cap is the monthly limit set in the Anthropic Console.
async function bump(env, key, ttl) {
  if (!env.PS_KV) return 0;
  try {
    const n = Number((await env.PS_KV.get(key)) || 0) + 1;
    await env.PS_KV.put(key, String(n), { expirationTtl: ttl });
    return n;
  } catch { return 0; }
}

async function verifyTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET) {
    if (env.ALLOWED_ORIGIN) throw new HttpError(503, "This feature is not switched on yet."); // production must have bot protection
    return; // local development
  }
  if (!token) throw new HttpError(403, "Please confirm you're not a robot and try again.");
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const out = await r.json().catch(() => ({}));
  if (!out.success) throw new HttpError(403, "We couldn't verify this request. Refresh the page and try again.");
}

// Every paid (AI) call goes through here: origin check, bot check, per-IP limit, daily cap.
export async function guard(request, env, { ai = true } = {}) {
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  if (env.ALLOWED_ORIGIN) {
    if (request.method === "POST" && origin !== env.ALLOWED_ORIGIN) throw new HttpError(403, "Requests from this site are not allowed.");
    if (request.method === "GET" && site && site !== "same-origin") throw new HttpError(403, "Requests from this site are not allowed.");
  }
  const ip = request.headers.get("cf-connecting-ip") || "anon";
  if (env.LIMITER) { // Workers Rate Limiting binding (preferred, atomic)
    const { success } = await env.LIMITER.limit({ key: ip }).catch(() => ({ success: true }));
    if (!success) throw new HttpError(429, "Too many requests in a short time. Wait a minute and try again.");
  } else {
    const minute = Math.floor(Date.now() / 60000);
    const ipKey = (await sha256(ip + (env.IP_SALT || "ps"))).slice(0, 16);
    if ((await bump(env, `ip:${ipKey}:${minute}`, 120)) > Number(env.PER_IP_PER_MINUTE || 8)) throw new HttpError(429, "Too many requests in a short time. Wait a minute and try again.");
  }
  if (request.method !== "POST") return null;
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY) throw new HttpError(413, "That photo is too large. Try again with a smaller photo.");
  const text = await request.text();
  if (text.length > MAX_BODY) throw new HttpError(413, "That photo is too large. Try again with a smaller photo.");
  let body;
  try { body = JSON.parse(text); } catch { throw new HttpError(400, "The request was not valid JSON."); }
  if (ai) {
    if (!env.ANTHROPIC_API_KEY) throw new HttpError(503, "This feature is not switched on yet.");
    await verifyTurnstile(env, request.headers.get("x-turnstile"), ip);
    const cap = Number(env.DAILY_AI_LIMIT || 200);
    if ((await bump(env, `ai:${today()}`, 172800)) > cap) throw new HttpError(503, "We've hit today's limit. Please try again tomorrow, or type your model number.");
  }
  return body;
}

export function imageBlock(img) {
  if (!img || typeof img.data !== "string" || !IMAGE_TYPES.has(img.media_type)) throw new HttpError(400, "Send a JPEG, PNG or WebP photo.");
  if (img.data.length > MAX_IMAGE_B64) throw new HttpError(413, "That photo is too large. Try again with a smaller photo.");
  return { type: "image", source: { type: "base64", media_type: img.media_type, data: img.data } };
}

export async function sha256(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
export async function cached(env, key, ttl, fn) {
  if (env.PS_KV) { try { const hit = await env.PS_KV.get(key, "json"); if (hit) return hit; } catch {} }
  const val = await fn();
  if (env.PS_KV && !(val && val.partial)) { try { await env.PS_KV.put(key, JSON.stringify(val), { expirationTtl: ttl }); } catch {} }
  return val;
}

// One structured call; the answer must match `schema`. Refusals fall back server-side ("default" routing).
export async function askJSON(env, { system, content, schema, effort, route }) {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 0, timeout: 30_000 });
  let res;
  try {
    res = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort, format: { type: "json_schema", schema } },
      system,
      messages: [{ role: "user", content }],
    });
  } catch (err) {
    console.error("anthropic", route, err && err.status, err && err.name);
    if (err instanceof Anthropic.RateLimitError) throw new HttpError(429, "We're busy right now. Try again in a minute.");
    if (err instanceof Anthropic.BadRequestError) throw new HttpError(400, "We couldn't read that photo. Try a clearer one.");
    if (err instanceof Anthropic.APIError) throw new HttpError(502, "This feature is unavailable right now. Try again shortly.");
    throw new HttpError(504, "That took too long. Try again.");
  }
  // Usage only, never request content.
  console.log(JSON.stringify({ route, model: res.model, in: res.usage?.input_tokens, out: res.usage?.output_tokens, stop: res.stop_reason }));
  env.EVENTS?.writeDataPoint({ blobs: ["ai", route, res.model], doubles: [res.usage?.input_tokens || 0, res.usage?.output_tokens || 0] });
  if (res.stop_reason === "refusal") throw new HttpError(422, "We can't help with that photo. Try a photo of the appliance's label.");
  if (res.stop_reason === "max_tokens") throw new HttpError(502, "The answer was cut off. Try again.");
  const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try { return JSON.parse(text); } catch { throw new HttpError(502, "We got an unreadable answer. Try again."); }
}

export function handle(fn) {
  return async (ctx) => {
    try { return json(await fn(ctx)); }
    catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error("unhandled", err && err.name, err && err.message);
      return json({ error: "Something went wrong on our side. Try again." }, 500);
    }
  };
}

// Part numbers must come from the retailer's diagram for the exact model, never from the AI.
// Strips long letter+digit codes (W10276397, DC97-16151A, WPW10276397) but keeps the
// user's own model number, years, voltages and short tokens.
const CODE = /\b[A-Z0-9]+(?:[-/][A-Z0-9]+)*\b/gi;
export function noPartNumbers(s, keep = "") {
  const K = String(keep || "").toUpperCase().replace(/\s+/g, "");
  const kBase = K.split("/")[0];
  return String(s || "").replace(CODE, (t) => {
    const T = t.toUpperCase();
    if (K && (K.includes(T) || (kBase.length >= 5 && T.includes(kBase)) || (T.length >= 6 && kBase.startsWith(T)))) return t;
    if (/^\d{4}-\d{4}$/.test(t)) return t;
    const digits = (t.match(/\d/g) || []).length;
    const letters = (t.match(/[A-Z]/gi) || []).length;
    const looksLikeCode = t.length >= 6 && digits >= 4 && (letters >= 1 || t.includes("-")) ;
    return looksLikeCode ? "" : t;
  }).replace(/\s{2,}/g, " ").replace(/\s+([.,;:])/g, "$1").trim();
}

export const pick = (v, allowed, dflt) => (allowed.includes(v) ? v : dflt);
