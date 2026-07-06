"use client";

import { useMemo } from "react";

type Dust = {
	left: number;
	top: number;
	size: number;
	delay: number;
	duration: number;
};

/** A layer of tiny starfield dots. Positions are randomized per mount, held
 * stable for the component's lifetime via `useMemo` — reopening whichever
 * egg is showing this reshuffles the sky, the same "fresh each time" spirit
 * as the rest of these overlays' per-open state. */
function makeDustLayer(
	count: number,
	sizeRange: [number, number],
	durationRange: [number, number],
): Dust[] {
	const dust: Dust[] = [];
	for (let i = 0; i < count; i++) {
		dust.push({
			left: Math.random() * 100,
			top: Math.random() * 100,
			size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
			delay: Math.random() * 4000,
			duration:
				durationRange[0] +
				Math.random() * (durationRange[1] - durationRange[0]),
		});
	}
	return dust;
}

/**
 * The shared cosmos backdrop — a near-black base gradient plus three layers
 * of twinkling starfield dust (the farthest layer also drifts, very slowly).
 * Used by BOTH the green light's expanding-universe overlay
 * (`universe-overlay.tsx`) AND the yellow light's minimize splash
 * (`minimize-dock.tsx`) — one cosmos, two eggs, instead of the splash running
 * its own separate ShaderGradient/three.js backdrop (that stack is gone
 * entirely; see CLAUDE.md). CSS-only — no WebGL, no lazy-loaded chunk — so it
 * paints instantly, the same tick as everything else around it.
 * `prefers-reduced-motion` is handled entirely in CSS (`.cosmos-dot` /
 * `.cosmos-dust-layer-2` in globals.css: a static starfield, no twinkle, no
 * drift) — no JS branch needed here.
 */
export function CosmosSky() {
	const dustLayers = useMemo(
		() => [
			makeDustLayer(90, [1, 1.6], [2600, 5200]),
			makeDustLayer(50, [1.4, 2.2], [3400, 6200]),
			makeDustLayer(22, [1.6, 2.6], [7000, 12000]),
		],
		[],
	);

	return (
		<div aria-hidden="true" className="cosmos-sky absolute inset-0">
			{dustLayers.map((layer, layerIndex) => (
				<div
					key={`layer-${
						// biome-ignore lint/suspicious/noArrayIndexKey: static-length decorative layers, never reordered.
						layerIndex
					}`}
					className={`cosmos-dust-layer cosmos-dust-layer-${layerIndex}`}
				>
					{layer.map((dot, dotIndex) => (
						<span
							key={`dot-${
								// biome-ignore lint/suspicious/noArrayIndexKey: static-length decorative dots, never reordered.
								dotIndex
							}`}
							className="cosmos-dot"
							style={{
								left: `${dot.left}%`,
								top: `${dot.top}%`,
								width: dot.size,
								height: dot.size,
								animationDelay: `${dot.delay}ms`,
								animationDuration: `${dot.duration}ms`,
							}}
						/>
					))}
				</div>
			))}
		</div>
	);
}
