"use client";

import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";

/**
 * The minimize splash's animated backdrop — a slow, dark gradient tuned to
 * the same deep blue/purple wash as `.terminal-stage`'s wallpaper
 * (`app/globals.css`), never a bright/rainbow preset. This file is the ONLY
 * place `@shadergradient/react` (and, transitively, three.js /
 * `@react-three/fiber`) gets imported anywhere in the app —
 * `minimize-dock.tsx` reaches it exclusively through
 * `next/dynamic(..., { ssr: false })`, so none of it ships in the main
 * bundle; the chunk is fetched the first time someone actually minimizes the
 * window, never on page load (verified against `next build`'s output for
 * `/` — see CLAUDE.md).
 *
 * `lightType="3d"` deliberately skips `envPreset`, which pulls an HDRI
 * environment map from a remote CDN at runtime — everything here renders
 * from local shader math and a couple of plain 3D lights, so there's
 * nothing here for the CSP to need an entry for.
 */
export default function MinimizeSplashShader() {
	return (
		<ShaderGradientCanvas
			style={{ width: "100%", height: "100%" }}
			pointerEvents="none"
			pixelDensity={1}
			lazyLoad={false}
		>
			<ShaderGradient
				control="props"
				type="waterPlane"
				animate="on"
				uSpeed={0.08}
				uStrength={1.1}
				uDensity={1.3}
				uFrequency={5.5}
				uAmplitude={0}
				color1="#12132c"
				color2="#241338"
				color3="#050508"
				reflection={0.1}
				brightness={0.55}
				grain="off"
				lightType="3d"
				cAzimuthAngle={180}
				cPolarAngle={90}
				cDistance={3.2}
				cameraZoom={1}
				positionX={0}
				positionY={0}
				positionZ={0}
				rotationX={0}
				rotationY={0}
				rotationZ={0}
				wireframe={false}
			/>
		</ShaderGradientCanvas>
	);
}
