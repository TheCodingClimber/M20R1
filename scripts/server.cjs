const fs = require("fs");
const http = require("http");
const path = require("path");
const { pathToFileURL } = require("url");
const { apiSecurityHeaders, baseSecurityHeaders } = require("../server/security-headers.cjs");

const projectRoot = path.resolve(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");
const apiEntry = path.join(projectRoot, "api", "contact.js");
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

let contactHandlerPromise;

function loadEnvFile(fileName) {
  const envPath = path.join(projectRoot, fileName);

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 5180);
const trustProxy = /^true$/i.test(process.env.TRUST_PROXY || "");
const enableHsts = /^true$/i.test(process.env.ENABLE_HSTS || "");
const canonicalOrigin = process.env.CANONICAL_ORIGIN || "";
let canonicalUrl;

try {
  canonicalUrl = canonicalOrigin ? new URL(canonicalOrigin) : null;
} catch {
  canonicalUrl = null;
}

function getHeaderValue(request, headerName) {
  const value = request.headers[headerName];

  return Array.isArray(value) ? value[0] || "" : value || "";
}

function getFirstHeaderValue(request, headerName) {
  return String(getHeaderValue(request, headerName)).split(",")[0].trim();
}

function normalizeHost(value) {
  return String(value).split(",")[0].trim().toLowerCase();
}

function isValidHost(value) {
  const normalized = normalizeHost(value);

  return (
    normalized.length > 0 &&
    normalized.length <= 253 &&
    /^(?:\[[0-9a-f:.]+\]|[a-z0-9.-]+)(?::\d{1,5})?$/i.test(normalized)
  );
}

function getForwardedValue(request, headerName) {
  return getFirstHeaderValue(request, headerName);
}

function getRequestHost(request) {
  const candidate = trustProxy
    ? getForwardedValue(request, "x-forwarded-host") || getFirstHeaderValue(request, "host")
    : getFirstHeaderValue(request, "host");

  return isValidHost(candidate) ? normalizeHost(candidate) : "";
}

function getUrlBaseHost(request) {
  const requestHost = getRequestHost(request);

  if (requestHost) {
    return requestHost;
  }

  const localHost = host === "0.0.0.0" || host === "::" ? "127.0.0.1" : host;
  return `${localHost}:${port}`;
}

function getRequestUrl(request) {
  try {
    return new URL(request.url || "/", `http://${getUrlBaseHost(request)}`);
  } catch {
    return null;
  }
}

function getRequestProto(request) {
  if (trustProxy) {
    const forwardedProto = getForwardedValue(request, "x-forwarded-proto").toLowerCase();

    if (forwardedProto === "https" || forwardedProto === "http") {
      return forwardedProto;
    }
  }

  return request.socket.encrypted ? "https" : "http";
}

function getCanonicalRedirect(request, url) {
  if (!canonicalUrl) {
    return "";
  }

  const currentHost = getRequestHost(request);
  const currentProto = getRequestProto(request);
  const canonicalProto = canonicalUrl.protocol.replace(":", "");
  const canKnowExternalProto = trustProxy || request.socket.encrypted;
  const hostMismatch = currentHost && currentHost !== canonicalUrl.host;
  const protoMismatch = canKnowExternalProto && currentProto !== canonicalProto;

  if (!hostMismatch && !protoMismatch) {
    return "";
  }

  return `${canonicalUrl.origin}${url.pathname}${url.search}`;
}

function isHttpsRequest(request) {
  return getRequestProto(request) === "https";
}

function writeHead(response, request, statusCode, headers = {}) {
  const hstsHeaders =
    enableHsts && isHttpsRequest(request)
      ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains" }
      : {};

  response.writeHead(statusCode, {
    ...baseSecurityHeaders,
    ...hstsHeaders,
    ...headers,
  });
}

function getCacheControl(filePath) {
  const normalized = filePath.toLowerCase();

  if (normalized.endsWith(".html")) {
    return "public, max-age=0, must-revalidate";
  }

  if (normalized.endsWith("robots.txt") || normalized.endsWith("sitemap.xml")) {
    return "public, max-age=3600";
  }

  if (normalized.includes(`${path.sep}assets${path.sep}`)) {
    return "public, max-age=31536000, immutable";
  }

  return "public, max-age=86400";
}

function sendText(response, request, statusCode, body, headers = {}) {
  writeHead(response, request, statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "text/plain; charset=utf-8",
    ...headers,
  });
  response.end(request.method === "HEAD" ? undefined : body);
}

function sendFile(response, request, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendText(response, request, 404, "Not found");
      return;
    }

    writeHead(response, request, 200, {
      "Cache-Control": getCacheControl(filePath),
      "Content-Length": data.length,
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    });
    response.end(request.method === "HEAD" ? undefined : data);
  });
}

function getStaticPath(url) {
  let requestedPath;

  try {
    requestedPath = decodeURIComponent(url.pathname);
  } catch {
    return "";
  }

  if (requestedPath === "/") {
    requestedPath = "/index.html";
  }

  if (requestedPath.split("/").some((segment) => segment.startsWith(".") && segment !== ".well-known")) {
    return "";
  }

  const filePath = path.resolve(distRoot, `.${requestedPath}`);
  const rootWithSeparator = `${distRoot}${path.sep}`.toLowerCase();
  const normalizedFilePath = filePath.toLowerCase();

  if (normalizedFilePath !== distRoot.toLowerCase() && !normalizedFilePath.startsWith(rootWithSeparator)) {
    return "";
  }

  return filePath;
}

async function getContactHandler() {
  if (!contactHandlerPromise) {
    contactHandlerPromise = import(pathToFileURL(apiEntry).href).then((module) => module.default);
  }

  return contactHandlerPromise;
}

async function handleApi(request, response) {
  for (const [key, value] of Object.entries(apiSecurityHeaders)) {
    response.setHeader(key, value);
  }

  try {
    const handler = await getContactHandler();
    await handler(request, response);
  } catch (error) {
    console.error("Contact API failure:", error);

    if (!response.headersSent) {
      writeHead(response, request, 500, {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
      });
    }

    response.end(JSON.stringify({ message: "The contact service is unavailable." }));
  }
}

http
  .createServer((request, response) => {
    const url = getRequestUrl(request);

    if (!url) {
      sendText(response, request, 400, "Bad request");
      return;
    }

    if (url.pathname === "/api/contact") {
      handleApi(request, response);
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      sendText(response, request, 405, "Method not allowed", { Allow: "GET, HEAD" });
      return;
    }

    const redirectUrl = getCanonicalRedirect(request, url);

    if (redirectUrl) {
      writeHead(response, request, 308, {
        "Cache-Control": "public, max-age=3600",
        Location: redirectUrl,
      });
      response.end();
      return;
    }

    if (url.pathname === "/index.html") {
      writeHead(response, request, 308, {
        "Cache-Control": "public, max-age=3600",
        Location: "/",
      });
      response.end();
      return;
    }

    const filePath = getStaticPath(url);

    if (!filePath) {
      sendText(response, request, 400, "Bad request");
      return;
    }

    fs.stat(filePath, (error, stats) => {
      if (!error && stats.isFile()) {
        sendFile(response, request, filePath);
        return;
      }

      sendText(response, request, 404, "Not found");
    });
  })
  .listen(port, host, () => {
    console.log(`M20R1 server listening at http://${host}:${port}`);
  });
