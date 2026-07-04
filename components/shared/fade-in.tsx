import type { CSSProperties, ReactNode } from "react";

type FadeInProps = {
	delay?: string;
	className?: string;
	children: ReactNode;
};

export function FadeIn({
	delay = "0s",
	className = "",
	children,
}: FadeInProps) {
	const style = { "--delay": delay } as CSSProperties;

	return (
		<div
			className={["fade-in", className].filter(Boolean).join(" ")}
			style={style}
		>
			{children}
		</div>
	);
}
