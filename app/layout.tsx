import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SITE } from "@/lib/site";
import { SOCIALS } from "@/lib/socials";

export const metadata: Metadata = {
	metadataBase: new URL(SITE.url),
	title: SITE.title,
	description: SITE.description,
	keywords: [...SITE.keywords],
	icons: {
		icon: [
			{ url: "/icon.ico", sizes: "any" },
			{ url: "/icon.ico", type: "image/x-icon" },
		],
		apple: "/icon.ico",
	},
	openGraph: {
		title: SITE.title,
		description: SITE.description,
		url: SITE.url,
		siteName: "Luka Adzic Portfolio",
		images: [
			{
				url: "/icon.ico",
				width: 800,
				height: 800,
				alt: SITE.name,
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: SITE.title,
		description: SITE.description,
		images: ["/icon.ico"],
	},
	alternates: {
		canonical: SITE.url,
	},
	authors: [{ name: SITE.name, url: SITE.url }],
	robots: {
		index: true,
		follow: true,
		nocache: false,
	},
};

export const viewport: Viewport = {
	themeColor: "#0a0a0a",
	// The fullscreen terminal extends under notches/home indicators; the
	// window content compensates via env(safe-area-inset-*) padding.
	viewportFit: "cover",
};

const personSchema = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: SITE.name,
	url: SITE.url,
	sameAs: SOCIALS.map((social) => social.url),
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script content.
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
					}}
				/>
			</head>
			<body className="font-sans bg-background text-foreground antialiased">
				{children}
				<Analytics />
			</body>
		</html>
	);
}
