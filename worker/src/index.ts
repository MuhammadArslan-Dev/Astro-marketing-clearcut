export interface Env {
	// Cloudflare Pages deployment URL for this repo's static build, e.g.
	// "https://cc-marketing.pages.dev". Set in wrangler.toml [vars] (or the
	// dashboard, for a value you don't want in source control).
	PAGES_ORIGIN: string;
}

const PREFIX = "/go";

// Non-English locales get their own leading path segment (see
// src/i18n/copy.ts Locale type) — English has none. Public URLs put that
// segment BEFORE /go: "/hi/go/landing", not "/go/hi/landing".
const LOCALES = ["hi"];

// Matches "/go", "/go/...", "/hi/go", "/hi/go/..." and splits off the
// locale segment (if any) from whatever comes after /go.
function matchGoPath(pathname: string): { localePrefix: string; rest: string } | null {
	if (pathname === PREFIX || pathname.startsWith(PREFIX + "/")) {
		return { localePrefix: "", rest: pathname.slice(PREFIX.length) };
	}
	for (const locale of LOCALES) {
		const goPrefix = `/${locale}${PREFIX}`;
		if (pathname === goPrefix || pathname.startsWith(goPrefix + "/")) {
			return { localePrefix: `/${locale}`, rest: pathname.slice(goPrefix.length) };
		}
	}
	return null;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// Route is scoped to /go, /go/*, /hi/go and /hi/go/* in wrangler.toml,
		// so this should always match — kept as a safety net in case the route
		// pattern is ever widened.
		const match = matchGoPath(url.pathname);
		if (!match) {
			return fetch(request);
		}

		// astro.config.mjs sets base: '/go', which only prefixes the *links*
		// Astro emits — it does not move the build output into a /go folder.
		// dist/ mirrors routes with the locale segment (if any) up front and no
		// /go at all: "/go/react-course" -> "/react-course", "/hi/go/landing"
		// -> "/hi/landing". Bare "/go" or "/hi/go" (no trailing segment) maps
		// to that locale's site root.
		const upstreamPath = match.rest === "" ? match.localePrefix || "/" : `${match.localePrefix}${match.rest}`;

		const upstreamUrl = new URL(env.PAGES_ORIGIN);
		upstreamUrl.pathname = upstreamPath;
		upstreamUrl.search = url.search;

		// Host must NOT be forwarded as-is — it would still read
		// "clearcutoff.in", which the Pages origin doesn't serve. Let fetch()
		// set the correct Host from upstreamUrl instead.
		const upstreamHeaders = new Headers(request.headers);
		upstreamHeaders.delete("host");

		// Every request here is a live subrequest to the Pages origin — without
		// this, that round-trip repeats for every visitor on every request
		// (measured ~2x the latency of hitting Pages directly). `cacheEverything`
		// makes Cloudflare cache this subrequest's response at the edge for
		// `cacheTtl`, so only the first visitor in a region pays the extra hop.
		// Hashed /_astro/* assets are cached for a year (safe: the filename
		// changes whenever the content does, see public/_headers); HTML pages
		// get a short TTL so deploys still show up quickly.
		const isHashedAsset = upstreamPath.startsWith("/_astro/");

		const upstreamResponse = await fetch(upstreamUrl.toString(), {
			method: request.method,
			headers: upstreamHeaders,
			body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
			redirect: "manual",
			cf: {
				cacheEverything: true,
				cacheTtl: isHashedAsset ? 31536000 : 300,
			},
		});

		const response = new Response(upstreamResponse.body, upstreamResponse);

		// public/_headers on the Astro side sets X-Robots-Tag: noindex so the
		// *.pages.dev URL itself doesn't get indexed as duplicate content. That
		// header would otherwise ride along on every proxied response here too
		// and de-index the real, indexable clearcutoff.in/go/* pages — strip it.
		response.headers.delete("X-Robots-Tag");

		return response;
	},
} satisfies ExportedHandler<Env>;
