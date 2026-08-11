export interface Env {
	// Cloudflare Pages deployment URL for this repo's static build, e.g.
	// "https://cc-marketing.pages.dev". Set in wrangler.toml [vars] (or the
	// dashboard, for a value you don't want in source control).
	PAGES_ORIGIN: string;
}

const PREFIX = "/go";

function isGoPath(pathname: string): boolean {
	return pathname === PREFIX || pathname.startsWith(PREFIX + "/");
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// Route is scoped to /go and /go/* in wrangler.toml, so this should
		// always be true — kept as a safety net in case the route pattern is
		// ever widened.
		if (!isGoPath(url.pathname)) {
			return fetch(request);
		}

		// astro.config.mjs sets base: '/go', which only prefixes the *links*
		// Astro emits — it does not move the build output into a /go folder.
		// So "/go/react-course" on the Pages deployment is just "/react-course".
		// "/go" itself (no trailing segment) maps to the site root "/".
		const upstreamPath = url.pathname === PREFIX ? "/" : url.pathname.slice(PREFIX.length);

		const upstreamUrl = new URL(env.PAGES_ORIGIN);
		upstreamUrl.pathname = upstreamPath;
		upstreamUrl.search = url.search;

		// Host must NOT be forwarded as-is — it would still read
		// "clearcutoff.in", which the Pages origin doesn't serve. Let fetch()
		// set the correct Host from upstreamUrl instead.
		const upstreamHeaders = new Headers(request.headers);
		upstreamHeaders.delete("host");

		const upstreamResponse = await fetch(upstreamUrl.toString(), {
			method: request.method,
			headers: upstreamHeaders,
			body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
			redirect: "manual",
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
