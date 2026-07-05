import type { AnchorHTMLAttributes, ReactNode } from "react";

type ExternalLinkProps = {
	href: string;
	className?: string;
	children: ReactNode;
} & Omit<
	AnchorHTMLAttributes<HTMLAnchorElement>,
	"href" | "className" | "children" | "target" | "rel"
>;

export function ExternalLink({
	href,
	className,
	children,
	...rest
}: ExternalLinkProps) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={className}
			{...rest}
		>
			{children}
		</a>
	);
}
