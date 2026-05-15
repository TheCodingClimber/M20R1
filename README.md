# M20R1 Landing Page

A polished single-page React and Vite landing page for M20R1's infrastructure and governance story.

## What is included

- A custom React landing page with responsive layout, accessibility affordances, and reduced-motion support.
- SEO metadata for `https://m20r1.com/`, including canonical tags, Open Graph/Twitter metadata, JSON-LD, robots.txt, and a sitemap.
- A Node home-server entry point that serves the built site, applies security headers, and handles `/api/contact`.
- A Resend-backed inquiry form with server-side validation, honeypot filtering, strict origin checks, request-size limits, and Cloudflare-aware rate limiting.

## Scripts

- `npm run dev` starts the local Vite dev server.
- `npm run build` creates the production bundle.
- `npm run lint` checks the React source with ESLint.
- `npm start` serves the built `dist` folder and `/api/contact`.
- `npm run serve:dist` is an alias for `npm start`.

## Home server deployment

This project is no longer configured around Vercel. Build it, then run the included Node server behind your reverse proxy:

```bash
npm install
npm run build
npm start
```

The server defaults to `127.0.0.1:5180`. Put Nginx, Caddy, Apache, or your tunnel in front of it, proxy `https://m20r1.com` to that local port, and pass the original host/protocol headers. In production, set:

- `CANONICAL_ORIGIN=https://m20r1.com`
- `TRUST_PROXY=true` when TLS terminates at a trusted reverse proxy.
- `ENABLE_HSTS=true` only after HTTPS is stable for `m20r1.com` and any subdomains covered by `includeSubDomains`.

For Cloudflare Tunnel, keep the Node server bound to localhost, keep `TRUST_PROXY=true`, and make sure the tunnel/reverse proxy passes `Host`, `X-Forwarded-Host`, `X-Forwarded-Proto`, and Cloudflare's `CF-Connecting-IP` header. The server uses those headers for canonical redirects, HTTPS/HSTS detection, and contact-form rate limiting.

## Resend setup

The contact form posts to [`api/contact.js`](./api/contact.js), which keeps the Resend API key on the server. The included [`scripts/server.cjs`](./scripts/server.cjs) loads that route directly on a home server.

Configure these environment variables in your host:

- `RESEND_API_KEY`: your Resend API key.
- `CONTACT_TO_EMAIL`: the inbox that should receive inquiries.
- `CONTACT_FROM_EMAIL`: the verified sender identity. Defaults to `M20R1 <onboarding@resend.dev>` when omitted.
- `CONTACT_ALLOWED_ORIGIN`: optional comma-separated list of allowed form origins. When set, requests must include a matching `Origin` header.
- `CONTACT_MAX_BODY_BYTES`: maximum JSON payload size for contact requests. Defaults to `10000`.
- `CONTACT_RATE_LIMIT_MAX`: maximum contact attempts per client IP per window. Defaults to `5`.
- `CONTACT_RATE_LIMIT_WINDOW_MS`: rate-limit window in milliseconds. Defaults to `600000`.
- `CONTACT_RATE_LIMIT_STORE_MAX`: maximum in-memory rate-limit entries. Defaults to `1000`.
- `CANONICAL_ORIGIN`: optional canonical site origin used for redirects, for example `https://m20r1.com`.
- `TRUST_PROXY`: set to `true` when the app is only reachable through a trusted reverse proxy.
- `ENABLE_HSTS`: set to `true` after HTTPS is fully working.

Use [`.env.example`](./.env.example) as the local template.
For local contact-form testing, set `CONTACT_ALLOWED_ORIGIN` to the local browser origin you are using, or leave it unset so same-host requests are accepted.

## SEO and security notes

Canonical URLs, Open Graph image URLs, and the sitemap currently use `https://m20r1.com/`. Update [`index.html`](./index.html), [`public/robots.txt`](./public/robots.txt), and [`public/sitemap.xml`](./public/sitemap.xml) if the production domain changes.

Security headers are centralized in [`server/security-headers.cjs`](./server/security-headers.cjs) and applied by the Node server. Keep the reverse proxy aligned with those headers if you decide to terminate static traffic before it reaches Node.
