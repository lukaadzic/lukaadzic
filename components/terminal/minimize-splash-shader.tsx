"use client";

import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";

/**
 * The minimize splash's animated backdrop — ShaderGradient's "Nighty night"
 * preset (Luka's pick), values lifted verbatim from the package's own preset
 * table so it matches shadergradient.co's 04 exactly. This file is the ONLY
 * place `@shadergradient/react` (and, transitively, three.js /
 * `@react-three/fiber`) gets imported anywhere in the app —
 * `minimize-dock.tsx` reaches it exclusively through
 * `next/dynamic(..., { ssr: false })`, so none of it ships in the main
 * bundle; the chunk is fetched the first time someone actually minimizes the
 * window, never on page load (verified against `next build`'s output for
 * `/` — see CLAUDE.md).
 *
 * `lightType="3d"` means the preset's `envPreset` is never used, so no
 * remote HDRI is fetched — everything renders from local shader math, and
 * the CSP needs no entry for it.
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
				uTime={8}
				uSpeed={0.3}
				uStrength={1.5}
				uDensity={1.5}
				uFrequency={0}
				uAmplitude={0}
				color1="#606080"
				color2="#8d7dca"
				color3="#212121"
				reflection={0.1}
				brightness={1}
				grain="on"
				lightType="3d"
				cAzimuthAngle={180}
				cPolarAngle={80}
				cDistance={2.8}
				cameraZoom={9.1}
				positionX={0}
				positionY={0}
				positionZ={0}
				rotationX={50}
				rotationY={0}
				rotationZ={-60}
				wireframe={false}
			/>
		</ShaderGradientCanvas>
	);
}
