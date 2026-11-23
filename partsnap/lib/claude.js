// Shared helpers for the PartSnap API (Cloudflare Pages Functions).
// The API key lives only on the server, in the ANTHROPIC_API_KEY secret.
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-5-5";
const MAX_IMAGE_B64 = 5_500_000; // about 4 MB of image data
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

// Reject cross-site calls when ALLOWED_ORIGIN is set, and apply the optional
// Workers rate-limit binding (LIMITER) so nobody can run up the API bill.
export async function guard(request, env) {
  const origin = request.headers.get("origin");
  if (env.ALLOWED_ORIGIN && origin && origin !== env.ALLOWED_ORIGIN) throw new HttpError(403, "Requests from this site are not allowed.");
  if (!env.ANTHROPIC_API_KEY) throw new HttpError(503, "The parts finder is not configured yet.");
  if (env.LIMITER) {
    const key = request.headers.get("cf-connecting-ip") || "anon";
    const { success } = await env.LIMITER.limit({ key });
    if (!success) throw new HttpError(429, "Too many scans in a short time. Wait a minute and try again.");
  }
  const len = Number(request.headers.get("content-length") || 0);
  if (len > 7_000_000) throw new HttpError(413, "That photo is too large. Try again with a smaller photo.");
  try { return await request.json(); } catch { throw new HttpError(400, "The request was not valid JSON."); }
}

export function imageBlock(img) {
  if (!img || typeof img.data !== "string" || !IMAGE_TYPES.has(img.media_type)) throw new HttpError(400, "Send a JPEG, PNG or WebP photo.");
  if (img.data.length > MAX_IMAGE_B64) throw new HttpError(413, "That photo is too large. Try again with a smaller photo.");
  return { type: "image", source: { type: "base64", media_type: img.media_type, data: img.data } };
}

// One structured call: the answer must match `schema`. Refusals fall back to
// Anthropic's recommended model on the server side ("default" routing).
export async function askJSON(env, { system, content, schema, effort }) {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 2, timeout: 60_000 });
  let res;
  try {
    res = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 8000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort, format: { type: "json_schema", schema } },
      system,
      messages: [{ role: "user", content }],
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) throw new HttpError(429, "We're busy right now. Try again in a minute.");
    if (err instanceof Anthropic.BadRequestError) throw new HttpError(400, "We couldn't read that photo. Try a clearer one.");
    if (err instanceof Anthropic.APIError) throw new HttpError(502, "The parts finder is unavailable right now. Try again shortly.");
    throw err;
  }
  if (res.stop_reason === "refusal") throw new HttpError(422, "We can't help with that photo. Try a photo of the appliance's model label.");
  if (res.stop_reason === "max_tokens") throw new HttpError(502, "The answer was cut off. Try again.");
  const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try { return JSON.parse(text); } catch { throw new HttpError(502, "The parts finder returned an unreadable answer. Try again."); }
}

export function handle(fn) {
  return async (ctx) => {
    try { return json(await fn(ctx)); }
    catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error(err);
      return json({ error: "Something went wrong on our side. Try again." }, 500);
    }
  };
}

// Part numbers must come from the retailer's catalog for the exact model,
// never from the model. Strip anything that looks like one.
const PART_NO = /\b(?=[A-Z0-9-]*\d)[A-Z]{0,4}-?\d{4,}[A-Z0-9-]*\b/gi;
export const noPartNumbers = (s) => String(s || "").replace(PART_NO, "").replace(/\s{2,}/g, " ").trim();
