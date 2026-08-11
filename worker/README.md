# clearcut-go-router

Cloudflare Worker that sits in front of the `clearcutoff.in` zone and routes
`/go` and `/go/*` to this repo's Cloudflare Pages deployment, so marketing
pages appear at `clearcutoff.in/go/*` without the request ever touching the
VPS running the main Next.js apps.

What it does (`src/index.ts`):
- Strips the `/go` prefix before forwarding to Pages (Astro's `base: '/go'`
  only prefixes emitted links — it doesn't move build output into a `/go`
  folder, so the Pages deployment itself has no `/go` in its paths).
- Strips the `Host` header so the upstream fetch goes to the Pages origin
  correctly instead of echoing `clearcutoff.in`.
- Strips `X-Robots-Tag` from the Pages response — that header is set by this
  repo's `public/_headers` to keep the raw `*.pages.dev` URL out of Google,
  and would otherwise wrongly de-index the real `/go/*` pages too since this
  Worker proxies that same response.

## Setup

1. Create the Cloudflare Pages project for the Astro repo (root directory,
   not this `worker/` folder) and note its `*.pages.dev` URL.
2. Update `PAGES_ORIGIN` in `wrangler.toml` to that URL.
3. `npm install`
4. `npx wrangler login` (once, if not already authenticated)
5. `npm run deploy`

`wrangler dev` runs it locally on `http://127.0.0.1:8787` (or `--port` of
your choice) for testing before deploying.

## Notes

- `routes` in `wrangler.toml` requires the `clearcutoff.in` zone to already
  be on Cloudflare DNS, and needs both `/go` and `/go/*` patterns — `/go/*`
  alone does not match the bare `/go` path with no trailing segment.
- This Worker assumes GET/HEAD traffic (static marketing pages). Other
  methods are forwarded transparently but Pages will reject anything it
  doesn't support.
