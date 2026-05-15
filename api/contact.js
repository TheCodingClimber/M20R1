import { Resend } from "resend";
import headersModule from "../server/security-headers.cjs";

const requiredFields = ["name", "email", "message"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maxBodyBytes = readPositiveIntegerEnv("CONTACT_MAX_BODY_BYTES", 10_000);
const rateLimitWindowMs = readPositiveIntegerEnv(
  "CONTACT_RATE_LIMIT_WINDOW_MS",
  10 * 60 * 1000,
);
const rateLimitMax = readPositiveIntegerEnv("CONTACT_RATE_LIMIT_MAX", 5);
const rateLimitStoreMax = readPositiveIntegerEnv("CONTACT_RATE_LIMIT_STORE_MAX", 1000);
const rateLimitStore = new Map();
const { apiSecurityHeaders } = headersModule;
const fieldLimits = {
  company: 160,
  email: 254,
  message: 4000,
  name: 120,
  website: 120,
};

function readPositiveIntegerEnv(name, fallback) {
  const value = Number.parseInt(process.env[name] || "", 10);

  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function getHeader(request, name) {
  if (typeof request.headers?.get === "function") {
    return request.headers.get(name) || "";
  }

  const value = request.headers?.[name.toLowerCase()] || request.headers?.[name] || "";

  return Array.isArray(value) ? value[0] || "" : value;
}

function getFirstHeaderValue(request, name) {
  return String(getHeader(request, name)).split(",")[0].trim();
}

function setSecurityHeaders(response) {
  for (const [key, value] of Object.entries(apiSecurityHeaders)) {
    response.setHeader(key, value);
  }
}

function sendJson(response, statusCode, payload) {
  setSecurityHeaders(response);

  if (typeof response.status === "function") {
    response.status(statusCode);
  } else {
    response.statusCode = statusCode;
  }

  if (typeof response.json === "function") {
    response.json(payload);
    return;
  }

  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}

function cleanExpiredRateLimits(now) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  while (rateLimitStore.size > rateLimitStoreMax) {
    const oldestKey = rateLimitStore.keys().next().value;

    if (!oldestKey) {
      break;
    }

    rateLimitStore.delete(oldestKey);
  }
}

function getClientIp(request) {
  const trustProxy = /^true$/i.test(process.env.TRUST_PROXY || "");

  if (trustProxy) {
    const proxiedIp =
      getFirstHeaderValue(request, "cf-connecting-ip") ||
      getFirstHeaderValue(request, "true-client-ip") ||
      getFirstHeaderValue(request, "x-real-ip") ||
      getFirstHeaderValue(request, "x-forwarded-for");

    if (proxiedIp) {
      return proxiedIp.slice(0, 80);
    }
  }

  return request.socket?.remoteAddress || "unknown";
}

function checkRateLimit(request) {
  const now = Date.now();
  const key = getClientIp(request);

  cleanExpiredRateLimits(now);

  const entry = rateLimitStore.get(key) || {
    count: 0,
    resetAt: now + rateLimitWindowMs,
  };

  entry.count += 1;
  rateLimitStore.set(key, entry);

  return {
    isLimited: entry.count > rateLimitMax,
    retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

function normalizeOrigin(value) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

function getConfiguredOrigins() {
  return (process.env.CONTACT_ALLOWED_ORIGIN || "")
    .split(",")
    .map((value) => normalizeOrigin(value.trim()))
    .filter(Boolean);
}

function getRequestHost(request) {
  const trustProxy = /^true$/i.test(process.env.TRUST_PROXY || "");
  const host = trustProxy
    ? getFirstHeaderValue(request, "x-forwarded-host") || getFirstHeaderValue(request, "host")
    : getFirstHeaderValue(request, "host");

  return host.toLowerCase();
}

function isAllowedOrigin(request) {
  const origin = normalizeOrigin(getHeader(request, "origin"));
  const configuredOrigins = getConfiguredOrigins();

  if (configuredOrigins.length > 0) {
    return Boolean(origin) && configuredOrigins.includes(origin);
  }

  if (!origin) {
    return true;
  }

  try {
    return Boolean(getRequestHost(request)) && new URL(origin).host === getRequestHost(request);
  } catch {
    return false;
  }
}

function isJsonContentType(value) {
  return value.split(";")[0].trim().toLowerCase() === "application/json";
}

function clean(value, maxLength) {
  return typeof value === "string"
    ? value.replaceAll("\u0000", "").trim().slice(0, maxLength)
    : "";
}

function cleanSingleLine(value, maxLength) {
  return clean(value, maxLength).replace(/[\r\n]+/g, " ");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function readRequestBody(request) {
  if (request.body && typeof request.body === "object") {
    const approxBytes = Buffer.byteLength(JSON.stringify(request.body), "utf8");

    if (approxBytes > maxBodyBytes) {
      throw new Error("Request body is too large.");
    }

    return request.body;
  }

  if (typeof request.body === "string") {
    if (Buffer.byteLength(request.body, "utf8") > maxBodyBytes) {
      throw new Error("Request body is too large.");
    }

    return JSON.parse(request.body);
  }

  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    totalBytes += chunk.length;

    if (totalBytes > maxBodyBytes) {
      throw new Error("Request body is too large.");
    }

    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}

function buildEmail({ name, email, company, message }) {
  const subjectName = company ? `${name} at ${company}` : name;
  const subject = `M20R1 inquiry from ${subjectName}`.slice(0, 180);
  const text = [
    "New M20R1 inquiry",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company || "Not provided"}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
      <h1 style="font-size: 20px;">New M20R1 inquiry</h1>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Company:</strong> ${escapeHtml(company || "Not provided")}</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
      <p>${escapeHtml(message).split("\n").join("<br />")}</p>
    </div>
  `;

  return {
    subject,
    text,
    html,
  };
}

export default async function handler(request, response) {
  setSecurityHeaders(response);

  if (!isAllowedOrigin(request)) {
    sendJson(response, 403, { message: "Request origin is not allowed." });
    return;
  }

  const origin = normalizeOrigin(getHeader(request, "origin"));

  if (origin) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }

  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Accept, Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.statusCode = 204;
    response.end();
    return;
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    sendJson(response, 405, { message: "Method not allowed." });
    return;
  }

  const contentType = getHeader(request, "content-type");

  if (!contentType || !isJsonContentType(contentType)) {
    sendJson(response, 415, { message: "Content type must be application/json." });
    return;
  }

  const contentLength = Number.parseInt(getHeader(request, "content-length") || "0", 10);

  if (Number.isFinite(contentLength) && contentLength > maxBodyBytes) {
    sendJson(response, 413, { message: "Request body is too large." });
    return;
  }

  const rateLimit = checkRateLimit(request);

  if (rateLimit.isLimited) {
    response.setHeader("Retry-After", String(rateLimit.retryAfter));
    sendJson(response, 429, {
      message: "Too many contact attempts. Please try again later.",
    });
    return;
  }

  let body;

  try {
    body = await readRequestBody(request);
  } catch {
    sendJson(response, 400, { message: "Invalid request body." });
    return;
  }

  const payload = {
    name: cleanSingleLine(body.name, fieldLimits.name),
    email: cleanSingleLine(body.email, fieldLimits.email).toLowerCase(),
    company: cleanSingleLine(body.company, fieldLimits.company),
    message: clean(body.message, fieldLimits.message),
    website: clean(body.website, fieldLimits.website),
  };

  if (payload.website) {
    sendJson(response, 200, { message: "Thanks, your brief was received." });
    return;
  }

  const missingField = requiredFields.find((field) => !payload[field]);

  if (missingField || !emailPattern.test(payload.email)) {
    sendJson(response, 400, {
      message: "Please provide a valid name, email, and message.",
    });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || "M20R1 <onboarding@resend.dev>";

  if (!apiKey || !to) {
    sendJson(response, 500, {
      message: "Email is not configured yet. Please try again later.",
    });
    return;
  }

  const resend = new Resend(apiKey);
  const email = buildEmail(payload);

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: payload.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });

    if (error) {
      throw error;
    }

    sendJson(response, 200, { message: "Thanks, your brief was sent." });
  } catch (error) {
    console.error("Resend contact error:", error);
    sendJson(response, 502, {
      message: "The message could not be sent right now. Please try again shortly.",
    });
  }
}
