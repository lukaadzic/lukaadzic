import type { NextConfig } from "next";

// 'unsafe-inline' is required by Next's bootstrap scripts and the JSON-LD
// block (no nonce middleware — deliberate: static personal site).
// 'unsafe-eval' was dev-only (React Refresh / turbopack) until `giveon`
// started using the real Spotify iFrame API: its player bundle
// (embed-cdn.spotifycdn.com/_next/static/iframe_api.*.js) ships webpack's
// standard "resolve the global object" shim, which does `eval("this")` at
// module-init time — verified empirically via a production build + browser
// console: without 'unsafe-eval' that throws
// `EvalError: Evaluating a string as JavaScript violates ...` from inside
// `__webpack_require__`, so the iFrame API never calls back and no player
// mounts. Needed in prod now too, not just dev.
const contentSecurityPolicy = [
	"default-src 'self'",
	// https://open.spotify.com serves the `giveon` easter egg's iFrame API
	// bootstrap script (open.spotify.com/embed/iframe-api/v1); that script
	// then loads its actual player bundle from embed-cdn.spotifycdn.com in
	// the *top-level* page context (not inside the frame-src'd iframe), so
	// it needs its own script-src entry too — verified empirically via a
	// production build: without it the browser blocks
	// embed-cdn.spotifycdn.com/_next/static/iframe_api.*.js with a CSP error.
	"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://open.spotify.com https://embed-cdn.spotifycdn.com",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data:",
	"font-src 'self'",
	"connect-src 'self'",
	// The `giveon` easter egg embeds the official Spotify track player.
	"frame-src https://open.spotify.com",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	"upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
	{
		key: "Content-Security-Policy",
		value: contentSecurityPolicy,
	},
	{
		key: "Strict-Transport-Security",
		value: "max-age=63072000; includeSubDomains; preload",
	},
	{
		key: "X-Content-Type-Options",
		value: "nosniff",
	},
	{
		key: "X-Frame-Options",
		value: "DENY",
	},
	{
		key: "Referrer-Policy",
		value: "strict-origin-when-cross-origin",
	},
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=()",
	},
];

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: securityHeaders,
			},
		];
	},
};

export default nextConfig;
