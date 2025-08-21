"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { GitHubContributions } from "@/components/github-contributions";
import { SocialsSection } from "@/components/socials-section";

// Live age component - ultra fast loading with immediate calculation
const LiveAge = () => {
	// Pre-calculate birth timestamp once for maximum performance
	const birthTimestamp = useMemo(() => new Date(2005, 11, 7).getTime(), []);

	const calculateAge = useCallback(() => {
		const now = Date.now(); // Faster than new Date().getTime()
		const ageInMs = now - birthTimestamp;
		return ageInMs / (365.25 * 24 * 60 * 60 * 1000);
	}, [birthTimestamp]);

	// Initialize with null to prevent hydration mismatch, calculate on client
	const [age, setAge] = useState<number | null>(null);

	useEffect(() => {
		setAge(calculateAge());
	}, [calculateAge]);

	useEffect(() => {
		// Set initial age after hydration
		setAge(calculateAge());

		// High-frequency updates for ultra smooth live effect
		const interval = setInterval(() => {
			setAge(calculateAge());
		}, 50); // 20fps for smooth animation

		return () => clearInterval(interval);
	}, [calculateAge]);

	// Memoize the formatted age string to avoid unnecessary re-renders
	const formattedAge = useMemo(() => age?.toFixed(8) ?? "19.00000000", [age]);

	return (
		<div className="text-[14px] text-foreground/60 mb-4">
			{formattedAge} years old
		</div>
	);
};

// Typewriter component for description
const DescriptionTypewriter = ({ speed = 1 }: { speed?: number }) => {
	const [currentLineIndex, setCurrentLineIndex] = useState(0);
	const [currentCharIndex, setCurrentCharIndex] = useState(0);
	const [showCursor, setShowCursor] = useState(true);
	const [isComplete, setIsComplete] = useState(false);

	const lines = useMemo(
		() => [
			{
				text: "Replacing your chief of staff with ",
				links: [{ text: "@\u00A0PennyOne", href: "https://penny-one.com" }],
				suffix: ".",
			},
			{
				text: "Studying finance ",
				links: [
					{ text: "@\u00A0Wharton", href: "https://www.wharton.upenn.edu/" },
					{ text: " & running an AI/SaaS agency ", href: null },
					{ text: "@\u00A0Pingless", href: "https://pingless.dev" },
				],
				suffix: ".",
			},
		],
		[],
	);

	useEffect(() => {
		if (currentLineIndex >= lines.length) {
			setIsComplete(true);
			return;
		}

		const currentLine = lines[currentLineIndex];
		const fullText =
			currentLine.text +
			currentLine.links.map((link) => link.text).join("") +
			currentLine.suffix;

		const timeout = setTimeout(() => {
			if (currentCharIndex < fullText.length) {
				setCurrentCharIndex((prev) => prev + 1);
			} else {
				// Line complete, move to next line
				setCurrentLineIndex((prev) => prev + 1);
				setCurrentCharIndex(0);
			}
		}, speed);

		return () => clearTimeout(timeout);
	}, [currentCharIndex, currentLineIndex, speed, lines]);

	// Cursor blinking effect
	useEffect(() => {
		const cursorInterval = setInterval(() => {
			setShowCursor((prev) => !prev);
		}, 530);

		return () => clearInterval(cursorInterval);
	}, []);

	const getCurrentDisplayText = () => {
		if (currentLineIndex >= lines.length) return "";

		const currentLine = lines[currentLineIndex];
		const fullText =
			currentLine.text +
			currentLine.links.map((link) => link.text).join("") +
			currentLine.suffix;
		const displayText = fullText.slice(0, currentCharIndex);

		// Build the display progressively
		let currentPos = 0;
		const result = [];

		// Add the initial text
		const initialTextLength = currentLine.text.length;
		if (displayText.length > currentPos) {
			const textPortion = displayText.slice(
				currentPos,
				Math.min(displayText.length, initialTextLength),
			);
			result.push(<span key="initial">{textPortion}</span>);
			currentPos = initialTextLength;
		}

		// Add links progressively
		currentLine.links.forEach((link, linkIndex) => {
			const linkStart = currentPos;
			const linkEnd = currentPos + link.text.length;

			if (displayText.length > linkStart) {
				const linkPortion = displayText.slice(
					linkStart,
					Math.min(displayText.length, linkEnd),
				);

				if (link.href) {
					result.push(
						<Link
							key={`${link.href}-${link.text}-${linkIndex}`}
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							className="text-foreground hover:text-foreground/80 transition-colors"
						>
							{linkPortion}
						</Link>,
					);
				} else {
					result.push(
						<span key={`${link.text}-${linkIndex}`}>{linkPortion}</span>,
					);
				}
			}
			currentPos = linkEnd;
		});

		// Add suffix if we've reached it
		if (displayText.length > currentPos) {
			const suffixPortion = displayText.slice(currentPos);
			result.push(<span key="suffix">{suffixPortion}</span>);
		}

		return <>{result}</>;
	};

	return (
		<div>
			{/* Pre-render all lines with original spacing to preserve look but prevent shifts */}
			{lines.map((line, lineIndex) => (
				<div
					key={`line-${lineIndex}-${line.text.slice(0, 10)}`}
					className={`text-[18px] text-foreground/80 leading-7 ${
						lineIndex === 0 ? "pt-1" : "pt-4"
					}`}
				>
					{lineIndex < currentLineIndex ? (
						// Completed line - show full content with invisible cursor for consistent height
						<>
							{line.text}
							{line.links.map((link, linkIndex) =>
								link.href ? (
									<Link
										key={`${link.href}-${link.text}-${linkIndex}`}
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-foreground hover:text-foreground/80 transition-colors"
									>
										{link.text}
									</Link>
								) : (
									<span key={`${link.text}-${linkIndex}`}>{link.text}</span>
								),
							)}
							{line.suffix}
							<span className="opacity-0 inline-block w-[1ch]">|</span>
						</>
					) : lineIndex === currentLineIndex && !isComplete ? (
						// Currently typing line
						<>
							{getCurrentDisplayText()}
							<span
								className={`${
									showCursor ? "opacity-100" : "opacity-0"
								} transition-opacity inline-block w-[1ch]`}
							>
								|
							</span>
						</>
					) : lineIndex === currentLineIndex && isComplete ? (
						// Just completed line
						<>
							{line.text}
							{line.links.map((link, linkIndex) =>
								link.href ? (
									<Link
										key={`${link.href}-${link.text}-${linkIndex}`}
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-foreground hover:text-foreground/80 transition-colors"
									>
										{link.text}
									</Link>
								) : (
									<span key={`${link.text}-${linkIndex}`}>{link.text}</span>
								),
							)}
							{line.suffix}
							<span className="opacity-0 inline-block w-[1ch]">|</span>
						</>
					) : (
						// Future line - show full invisible content to reserve proper space
						<div className="opacity-0">
							{line.text}
							{line.links.map((link, linkIndex) =>
								link.href ? (
									<Link
										key={`${link.href}-${link.text}-${linkIndex}`}
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-foreground hover:text-foreground/80 transition-colors"
									>
										{link.text}
									</Link>
								) : (
									<span key={`${link.text}-${linkIndex}`}>{link.text}</span>
								),
							)}
							{line.suffix}
							<span className="inline-block w-[1ch]">|</span>
						</div>
					)}
				</div>
			))}
		</div>
	);
};

type Tab = {
	id: string;
	name: string;
	content: "portfolio" | "journals" | "post";
};

export default function Home() {
	const router = useRouter();
	const [tabs, setTabs] = useState<Tab[]>([
		{ id: "portfolio", name: "lukaadzic.tsx", content: "portfolio" },
	]);
	const [activeTab, setActiveTab] = useState("portfolio");

	// Load tabs from sessionStorage on mount - prevent flickering
	useEffect(() => {
		const editorTabsState = sessionStorage.getItem("editorTabs");

		// Only check sessionStorage for editor tabs (from navigation)
		// This preserves tabs when navigating between pages
		if (editorTabsState) {
			try {
				const { tabs: editorTabs } = JSON.parse(editorTabsState);
				if (editorTabs && editorTabs.length > 0) {
					setTabs(editorTabs);
				}
				setActiveTab("portfolio"); // Always set portfolio as active when on main page
			} catch {
				// Silently handle parsing error - keep initial state
			}
		}
	}, []);

	// Save tabs to sessionStorage whenever tabs change (for navigation persistence)
	useEffect(() => {
		if (tabs.length > 0) {
			const tabsState = {
				tabs,
				activeTab,
			};
			sessionStorage.setItem("editorTabs", JSON.stringify(tabsState));
		}
	}, [tabs, activeTab]);

	// Helper function to truncate long tab names
	const truncateTabName = (name: string) => {
		if (name.length <= 50) return name;

		// Remove .tsx extension, truncate, then add ...tsx
		const nameWithoutExt = name.replace(".tsx", "");
		if (nameWithoutExt.length <= 47) return name; // 47 + 3 chars for .tsx = 50

		return `${nameWithoutExt.substring(0, 44)}...tsx`;
	};

	const switchTab = (tabId: string, e?: React.MouseEvent) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		// Store current tabs state in sessionStorage BEFORE navigation to prevent layout shifts
		const tabsState = {
			tabs,
			activeTab: tabId,
		};
		sessionStorage.setItem("editorTabs", JSON.stringify(tabsState));

		// Navigate using Next.js router (no page reload)
		if (tabId === "journals") {
			router.push("/journals");
		} else if (tabId !== "portfolio") {
			// It's a post tab
			router.push(`/journals/${tabId}`);
		} else {
			// If it's portfolio tab, just update the active state
			setActiveTab(tabId);
		}
	};

	const closeTab = (tabId: string, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		// Don't allow closing the portfolio tab
		if (tabId === "portfolio") {
			return;
		}

		const newTabs = tabs.filter((tab) => tab.id !== tabId);
		setTabs(newTabs);

		// If we're closing the journals tab and we're currently on it, go to portfolio
		if (activeTab === tabId && tabId === "journals") {
			// Stay on current page (portfolio) since we're closing journals tab
			setActiveTab("portfolio");
		}
	};

	const handleJournalsClick = (e: React.MouseEvent) => {
		e.preventDefault();

		// Ultra fast navigation with immediate transition
		router.push("/journals");
	};

	return (
		<>
			{/*
		Hey!

		If you're reading this, you're either very bored or very curious.

		Let's build something together: lukaadz@wharton.upenn.edu

	  */}
			<div
				className="min-h-screen text-foreground"
				style={{
					backgroundColor: "oklch(0.15 0.08 240)",
					backgroundImage: `
			linear-gradient(90deg, oklch(0.18 0.06 240) 1px, transparent 1px),
			linear-gradient(oklch(0.18 0.06 240) 1px, transparent 1px)
		  `,
					backgroundSize: "20px 20px",
				}}
			>
				{/* Code Editor Container */}
				<div
					className="mx-auto border-l border-r border-dashed"
					style={{
						maxWidth: "926px",
						borderColor: "oklch(0.4 0.1 240 / 0.3)",
						borderWidth: "1px",
					}}
				>
					{/* Code Editor Tab Bar */}
					<div
						className="border-b border-dashed px-4 pt-2 tab-scroll-container"
						style={{
							borderColor: "oklch(0.4 0.1 240 / 0.3)",
							backgroundColor: "oklch(0.12 0.1 240)",
							height: "52px", // Fixed height to prevent layout shift
						}}
					>
						<div
							className="flex items-end h-full"
							style={{ minWidth: "max-content" }}
						>
							{tabs.map((tab) => (
								<div
									key={tab.id}
									className="tab-item flex items-center gap-2 rounded-t-md text-sm border-t border-l border-r border-dashed mr-1 hover:bg-foreground/5 transition-all duration-75"
									style={{
										backgroundColor:
											activeTab === tab.id
												? "oklch(0.2 0.08 240)"
												: "oklch(0.16 0.06 240)",
										borderColor: "oklch(0.4 0.1 240 / 0.3)",
										marginBottom: "-1px",
										opacity: activeTab === tab.id ? 1 : 0.8,
										minWidth: "140px",
									}}
								>
									<div className="flex items-center justify-between w-full">
										{tab.content === "portfolio" ? (
											<div
												className="flex items-center gap-2 px-3 py-2 flex-1"
												style={{
													color:
														activeTab === tab.id
															? "oklch(0.9 0.02 240)"
															: "oklch(0.7 0.04 240)",
												}}
											>
												<svg
													className="w-4 h-4"
													viewBox="0 0 24 24"
													fill="currentColor"
													aria-label="Home"
												>
													<title>Home</title>
													<path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
													<path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
												</svg>
												<span>{tab.name}</span>
											</div>
										) : tab.content === "journals" ? (
											<Link
												href="/journals"
												onClick={(e) => switchTab(tab.id, e)}
												className="flex items-center gap-2 px-3 py-2 flex-1 tab-link"
												style={{
													color:
														activeTab === tab.id
															? "oklch(0.9 0.02 240)"
															: "oklch(0.7 0.04 240)",
												}}
											>
												<svg
													className="w-4 h-4"
													viewBox="0 0 24 24"
													fill="currentColor"
													aria-label="Journals"
												>
													<title>Journals</title>
													<path d="M1.5 6.375c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 17.625V6.375zM21 9.375A.375.375 0 0 0 20.625 9h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5zM10.875 18.75a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5zM3.375 15.375a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5zm0-3.75a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5z" />
												</svg>
												<span>{tab.name}</span>
											</Link>
										) : (
											<Link
												href={`/journals/${tab.id}`}
												onClick={(e) => switchTab(tab.id, e)}
												prefetch={true}
												className="flex items-center gap-2 px-3 py-2 flex-1 tab-link"
												style={{
													color:
														activeTab === tab.id
															? "oklch(0.9 0.02 240)"
															: "oklch(0.7 0.04 240)",
												}}
											>
												<svg
													className="w-4 h-4"
													viewBox="0 0 24 24"
													fill="currentColor"
													aria-label="Document"
												>
													<title>Document</title>
													<path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
													<path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
												</svg>
												<span>{truncateTabName(tab.name)}</span>
											</Link>
										)}
										{(tab.id === "journals" || tab.content === "post") && (
											<button
												type="button"
												onClick={(e) => closeTab(tab.id, e)}
												aria-label={`Close ${tab.name} tab`}
												className="ml-1 px-1 py-1 transition-all duration-75 rounded-sm group"
												style={{
													color: "oklch(0.6 0.04 240)",
												}}
											>
												<svg
													className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													aria-label="Close"
												>
													<title>Close</title>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</button>
										)}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Code Editor Content */}
					<div className="pb-24">
						<header
							className="flex justify-between items-start pt-8"
							style={{ paddingLeft: "16px", paddingRight: "16px" }}
						>
							<div>
								<Link
									href="/"
									className="text-[24px] font-bold text-foreground hover:text-foreground/80 transition-colors mb-1 block"
								>
									Luka Adzic
								</Link>
								<LiveAge />
							</div>
							<Link
								href="/journals"
								onClick={handleJournalsClick}
								prefetch={true}
								className="text-[16px] text-foreground hover:text-foreground/80 transition-colors duration-75 cursor-pointer"
							>
								Journals
							</Link>
						</header>

						{/* Conditional Content Based on Active Tab */}
						{activeTab === "portfolio" && (
							<div>
								{/* Profile Section */}
								<div className="typewriter-container px-4 mobile-padding min-h-[90px] sm:min-h-0">
									{/* Description */}
									<DescriptionTypewriter speed={50} />
								</div>
								{/* Projects Section */}
								<div className="mt-4 space-y-6 dynamic-content-container project-section-spacing px-4 mobile-padding">
									<p className="text-[18px] text-foreground/80 leading-7">
										Stuff I shipped:
									</p>

									<div className="space-y-3">
										{/* Project 1 - Financial Bubble Detection Dashboard */}
										<Link
											href="https://financial-bubble.vercel.app/"
											target="_blank"
											rel="noopener noreferrer"
											className="group font-mono block"
										>
											<div className="flex items-start gap-3 py-3 transition-opacity duration-200 hover:opacity-70 cursor-pointer">
												<span className="text-green-400 text-base mt-0.5 select-none font-bold">
													❯
												</span>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<span className="text-cyan-400 text-base font-medium">
															~/projects/
														</span>
														<h3 className="font-medium text-foreground text-base tablet-text-base truncate">
															financial-bubble-detection-dashboard
														</h3>
														<span className="text-green-400 text-xs">●</span>
													</div>
													<p className="text-sm text-foreground/60 mb-2 leading-relaxed">
														Real-time financial bubble detection using options
														data
													</p>
												</div>
												<div className="text-foreground/70 group-hover:text-foreground transition-colors p-1">
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														aria-label="External link"
													>
														<title>External link</title>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
														/>
													</svg>
												</div>
											</div>
										</Link>

										{/* Separator */}
										<div className="my-4">
											<div className="h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent"></div>
										</div>

										{/* Project 2 - Maritime@Penn Web App */}
										<Link
											href="https://pennmaritime.club/"
											target="_blank"
											rel="noopener noreferrer"
											className="group font-mono block"
										>
											<div className="flex items-start gap-3 py-3 transition-opacity duration-200 hover:opacity-70 cursor-pointer">
												<span className="text-green-400 text-base mt-0.5 select-none font-bold">
													❯
												</span>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<span className="text-cyan-400 text-base font-medium">
															~/projects/
														</span>
														<h3 className="font-medium text-foreground text-base tablet-text-base truncate">
															maritime-penn-web-app
														</h3>
														<span className="text-green-400 text-xs">●</span>
													</div>
													<p className="text-sm text-foreground/60 mb-2 leading-relaxed">
														Building tomorrow&apos;s maritime leaders at UPenn &
														Wharton
													</p>
												</div>
												<div className="text-foreground/70 group-hover:text-foreground transition-colors p-1">
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														aria-label="External link"
													>
														<title>External link</title>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
														/>
													</svg>
												</div>
											</div>
										</Link>

										{/* Separator */}
										<div className="my-4">
											<div className="h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent"></div>
										</div>

										{/* Project 3 - FIFA Momentum Tracker */}
										<Link
											href="https://github.com/lukaadzic/fifa-momentum-tracker"
											target="_blank"
											rel="noopener noreferrer"
											className="group font-mono block"
										>
											<div className="flex items-start gap-3 py-3 transition-opacity duration-200 hover:opacity-70 cursor-pointer">
												<span className="text-green-400 text-base mt-0.5 select-none font-bold">
													❯
												</span>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<span className="text-cyan-400 text-base font-medium">
															~/projects/
														</span>
														<h3 className="font-medium text-foreground text-base tablet-text-base truncate">
															fifa-momentum-tracker
														</h3>
														<span className="text-green-400 text-xs">●</span>
													</div>
													<p className="text-sm text-foreground/60 mb-2 leading-relaxed">
														Cracking EAFC/FIFA&apos;s dynamic difficulty
														algorithms through OpenCV and ML-driven pattern
														recognition.
													</p>
												</div>
												<div className="text-foreground/70 group-hover:text-foreground transition-colors p-1">
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														aria-label="External link"
													>
														<title>External link</title>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
														/>
													</svg>
												</div>
											</div>
										</Link>
									</div>
								</div>

								{/* GitHub Contributions Section */}
								<div
									className="mt-4 space-y-6 github-contributions-container"
									style={{ paddingLeft: "16px", paddingRight: "16px" }}
								>
									{/* Separator */}
									<div className="my-6">
										<div className="h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent"></div>
									</div>

									{/* GitHub Activity Header */}
									<div className="text-[18px] text-foreground/80">
										Code I pushed:
									</div>

									<GitHubContributions username="lukaadzic" />

									<SocialsSection />
								</div>
							</div>
						)}
					</div>

					{/* CLI Footer */}
					<div className="py-6 mb-20">
						<div className="flex items-center justify-center font-mono">
							<span className="text-green-400 text-sm mr-2">❯</span>
							<span className="text-cyan-400 text-sm mr-1">~</span>
							<span className="text-foreground/60 text-sm mr-2">/</span>
							<span className="text-foreground text-sm font-medium">Luka</span>
							<span className="text-green-400 text-sm ml-2">●</span>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
