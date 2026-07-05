/**
 * Thin wrapper around Spotify's official embed iFrame API
 * (https://developer.spotify.com/documentation/embeds/references/iframe-api).
 * The script exposes itself once, globally, by calling
 * `window.onSpotifyIframeApiReady` — this module injects the script exactly
 * once (module-level singleton) and turns that callback into a promise so
 * every `giveon` invocation (even several in the same session) can await
 * the same resolved API instead of re-injecting the script.
 */

/** Verified against the iFrame API reference — only documented fields. */
export type SpotifyControllerOptions = {
	uri: string;
	width?: string | number;
	height?: string | number;
};

export type SpotifyEmbedController = {
	play: () => void;
	pause: () => void;
	resume: () => void;
	togglePlay: () => void;
	destroy: () => void;
	addListener: (
		event: "ready" | "playback_started" | "playback_update",
		callback: (event: unknown) => void,
	) => void;
};

export type SpotifyIFrameApi = {
	createController: (
		element: HTMLElement,
		options: SpotifyControllerOptions,
		callback: (controller: SpotifyEmbedController) => void,
	) => void;
};

declare global {
	interface Window {
		onSpotifyIframeApiReady?: (api: SpotifyIFrameApi) => void;
	}
}

const IFRAME_API_SRC = "https://open.spotify.com/embed/iframe-api/v1";

let apiPromise: Promise<SpotifyIFrameApi> | null = null;

/** Lazily injects the iFrame API script once and resolves with the API for
 * every caller, present or future. Safe to call from multiple components. */
export function loadSpotifyIframeApi(): Promise<SpotifyIFrameApi> {
	if (apiPromise) return apiPromise;

	apiPromise = new Promise((resolve, reject) => {
		window.onSpotifyIframeApiReady = (api) => resolve(api);
		const script = document.createElement("script");
		script.src = IFRAME_API_SRC;
		script.async = true;
		script.onerror = () => {
			// Reset the singleton so a later invocation can retry instead of
			// inheriting a permanently-pending promise (ad-blockers, offline).
			apiPromise = null;
			reject(new Error("spotify iframe api failed to load"));
		};
		document.body.appendChild(script);
	});

	return apiPromise;
}
