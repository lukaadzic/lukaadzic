import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLOR = {
	background: "#0a0a0a",
	chrome: "#1c1c1c",
	hairline: "rgba(255, 255, 255, 0.08)",
	foreground: "#ededed",
	muted: "rgba(237, 237, 237, 0.55)",
	green: "#5fd75f",
	blue: "#6bc7f5",
	red: "#ff5f57",
	yellow: "#febc2e",
	trafficGreen: "#28c840",
};

export default function Image() {
	return new ImageResponse(
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
				background: COLOR.background,
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 10,
					height: 52,
					padding: "0 24px",
					borderBottom: `1px solid ${COLOR.hairline}`,
					background: COLOR.chrome,
				}}
			>
				<div
					style={{
						display: "flex",
						width: 16,
						height: 16,
						borderRadius: 999,
						background: COLOR.red,
					}}
				/>
				<div
					style={{
						display: "flex",
						width: 16,
						height: 16,
						borderRadius: 999,
						background: COLOR.yellow,
					}}
				/>
				<div
					style={{
						display: "flex",
						width: 16,
						height: 16,
						borderRadius: 999,
						background: COLOR.trafficGreen,
					}}
				/>
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					flex: 1,
					justifyContent: "center",
					padding: "0 72px",
					gap: 28,
				}}
			>
				<div style={{ display: "flex", fontSize: 30 }}>
					<span style={{ color: COLOR.green }}>{SITE.githubUsername}</span>
					<span style={{ color: COLOR.muted }}>&nbsp;</span>
					<span style={{ color: COLOR.blue }}>~</span>
					<span style={{ color: COLOR.muted }}>&nbsp;%&nbsp;</span>
					<span style={{ color: COLOR.foreground }}>whoami</span>
				</div>
				<div
					style={{
						display: "flex",
						color: COLOR.foreground,
						fontSize: 76,
						fontWeight: 700,
						letterSpacing: -1,
					}}
				>
					{SITE.name}
				</div>
				<div style={{ display: "flex", color: COLOR.muted, fontSize: 32 }}>
					{SITE.description}
				</div>
			</div>
		</div>,
		{ ...size },
	);
}
