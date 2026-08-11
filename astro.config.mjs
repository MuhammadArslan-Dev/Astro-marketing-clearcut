// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Real domain, not the *.pages.dev URL — keeps canonical tags / sitemap
  // pointing at clearcutoff.in.
  site: 'https://clearcutoff.in',

  // Deployed at clearcutoff.in/go/* via a Cloudflare Worker in front of
  // Cloudflare Pages. Astro does NOT move build output into a /go folder —
  // it only prefixes emitted HTML links and asset URLs with /go. The Worker
  // must strip that /go prefix before forwarding to this Pages deployment.
  base: '/go',

  // Must match whatever the Worker/proxy expects, or you get a redirect loop.
  trailingSlash: 'never',

  vite: {
    plugins: [tailwindcss()],
  },
});
