import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

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
	metadataBase: new URL("https://lukaadzic.dev"),
	title: "Luka Adzic's Portfolio",
	description:
		"Here's some stuff I've built, things I've worked on, and where to find me online.",
	keywords: [
		"Luka Adzic",
		"Luka Adzic Portfolio",
		"Luka Adzic Projects",
		"Startup founder Luka Adzic",
		"Portfolio",
		"Programmer Luka Adzic",
		"Software Engineer Luka Adzic",
		"University of Pennsylvania Luka Adzic",
		"Luka Adzic GitHub",
		"Luka Adzic Twitter",
		"Luka Adzic Instagram",
		"Luka Adzic Facebook",
		"Luka Adzic Wharton",
		"Luka Adzic LinkedIn",
		"Personal Website",
		"Contact Luka Adzic",
	],
	icons: {
		icon: [
			{ url: "/icon.jpeg", sizes: "any" },
			{ url: "/icon.jpeg", type: "image/jpeg" },
		],
		apple: "/icon.jpeg",
	},
	openGraph: {
		title: "Luka Adzic's Portfolio",
		description:
			"Here's some stuff I've built, things I've worked on, and where to find me online.",
		url: "https://lukaadzic.dev",
		siteName: "Luka Adzic Portfolio",
		images: [
			{
				url: "/icon.jpeg",
				width: 800,
				height: 800,
				alt: "Luka Adzic Portfolio Icon",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Luka Adzic's Portfolio",
		description:
			"Here's some stuff I've built, things I've worked on, and where to find me online.",
		images: ["/icon.jpeg"],
	},
	alternates: {
		canonical: "https://lukaadzic.dev",
	},
	authors: [{ name: "Luka Adzic", url: "https://lukaadzic.dev" }],
	robots: {
		index: true,
		follow: true,
		nocache: false,
	},
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
				<link rel="prefetch" href="/journals" />
				<link
					rel="preconnect"
					href="https://fonts.googleapis.com"
					crossOrigin="anonymous"
				/>
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
				<link rel="dns-prefetch" href="https://fonts.gstatic.com" />
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
					@media (prefers-color-scheme: light) {
						body {
							background: #ffffff !important;
							color: #171717 !important;
						}
					}
				`}</style>
				<script type="application/ld+json">
					{`{
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Luka Adzic",
            "url": "https://lukaadzic.dev",
            "sameAs": [
              "https://github.com/lukaadzic",
              "https://twitter.com/lukaadzic7",
              "https://linkedin.com/in/lukaadzic",
              "https://instagram.com/lukaadzic7"
            ]
          }`}
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
