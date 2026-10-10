/**
 * SIAP PIDUM — Proxy aman ke Google Apps Script (Vercel Serverless Function)
 * ------------------------------------------------------------------------
 * Browser hanya melihat "/api/gas". URL Apps Script dan kunci rahasia
 * disimpan di Environment Variables Vercel (tidak pernah dikirim ke browser):
 *   GAS_URL          = https://script.google.com/macros/s/XXXX/exec
 *   GAS_PROXY_KEY    = hasil fungsi aturKunciProxy() di Apps Script
 *   ALLOWED_ORIGINS  = (opsional) domain tambahan, pisahkan koma
 */
const MAX_BODY_BYTES = 4 * 1024 * 1024; // batas payload Vercel ±4,5 MB
const TIMEOUT_MS = 58000;

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

function isAllowedOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false; // browser modern selalu mengirim Origin untuk POST
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  try {
    if (new URL(origin).host === host) return true;
  } catch (error) {
    return false;
  }
  const extra = String(process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return extra.includes(origin);
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null && req.body !== "") {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error("too_large"), { code: 413 });
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { success: false, message: "Metode tidak diizinkan." });
  }
  if (!isAllowedOrigin(req)) {
    return sendJson(res, 403, { success: false, message: "Akses ditolak." });
  }
  const gasUrl = process.env.GAS_URL;
  const proxyKey = process.env.GAS_PROXY_KEY;
  if (!gasUrl || !/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(gasUrl) || !proxyKey) {
    return sendJson(res, 500, { success: false, message: "Proxy belum dikonfigurasi (GAS_URL / GAS_PROXY_KEY)." });
  }

  let input;
  try {
    input = await readBody(req);
  } catch (error) {
    if (error.code === 413) return sendJson(res, 413, { success: false, message: "Ukuran data terlalu besar (maks ±3 MB per file)." });
    return sendJson(res, 400, { success: false, message: "Format permintaan tidak valid." });
  }
  if (!input || typeof input.action !== "string" || !/^[A-Za-z]{2,40}$/.test(input.action)) {
    return sendJson(res, 400, { success: false, message: "Aksi tidak valid." });
  }

  const forward = JSON.stringify({
    action: input.action,
    payload: input.payload && typeof input.payload === "object" ? input.payload : {},
    token: typeof input.token === "string" ? input.token : "",
    proxyKey
  });
  if (Buffer.byteLength(forward) > MAX_BODY_BYTES) {
    return sendJson(res, 413, { success: false, message: "Ukuran data terlalu besar (maks ±3 MB per file)." });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const upstream = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: forward,
      redirect: "follow",
      signal: controller.signal
    });
    const text = await upstream.text();
    try {
      JSON.parse(text);
    } catch (error) {
      return sendJson(res, 502, { success: false, message: "Respons backend tidak valid. Periksa deployment Apps Script." });
    }
    return sendJson(res, 200, text);
  } catch (error) {
    const timeout = error && error.name === "AbortError";
    return sendJson(res, timeout ? 504 : 502, {
      success: false,
      message: timeout ? "Server terlalu lama merespons. Coba lagi." : "Backend tidak dapat dihubungi."
    });
  } finally {
    clearTimeout(timer);
  }
};
