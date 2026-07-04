import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SITE } from "@/lib/site";
import { SOCIALS } from "@/lib/socials";

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	style: ["normal", "italic"],
	display: "block",
	preload: true,
	adjustFontFallback: false,
	variable: "--font-jetbrains-mono",
});
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

const personSchema = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: SITE.name,
	url: SITE.url,
	sameAs: [
		`https://github.com/${SITE.githubUsername}`,
		...SOCIALS.map((social) => social.url),
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" content="#181a23" />
				<link rel="apple-touch-icon" href="/icon.ico" />
				<style>{`
					html, body {
						margin: 0 !important;
						padding: 0 !important;
						font-family: var(--font-jetbrains-mono) !important;
						font-display: block !important;
						line-height: 1.5 !important;
						-webkit-font-smoothing: antialiased !important;
						-moz-osx-font-smoothing: grayscale !important;
						text-rendering: optimizeLegibility !important;
						font-synthesis: none !important;
						font-kerning: normal !important;
						text-size-adjust: 100% !important;
						box-sizing: border-box !important;
					}
					*, *::before, *::after {
						box-sizing: border-box !important;
						font-synthesis: none !important;
						font-display: block !important;
						font-family: inherit !important;
					}
					body {
						background: #0a0a0a !important;
						color: #ededed !important;
					}
				`}</style>
				<script type="application/ld+json">
					{JSON.stringify(personSchema)}
				</script>
			</head>
			<body
				className={`${jetbrainsMono.variable} antialiased font-jetbrains-mono`}
			>
				{children}
				<Analytics />
			</body>
		</html>
	);
}
