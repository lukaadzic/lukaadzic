"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { SocialDock } from "@/components/social-dock";

type Tab = {
	id: string;
	name: string;
	content: "portfolio" | "journals" | "post";
};

type Post = {
	slug: string;
	title: string;
	publishedDate: string | null;
	postType: "post" | "take";
	excerpt: string;
	featuredImage?: string | null;
	featuredImagePosition?: string;
	featuredImageCrop?: {
		x: number;
		y: number;
	};
	additionalImages?: Array<{
		image: string | null;
		alt: string;
	}>;
	content: string;
};

interface PostClientProps {
	post: Post;
}

export default function PostClient({ post }: PostClientProps) {
	const router = useRouter();

	// Initialize with empty state - will be populated from sessionStorage or defaults
	const [tabs, setTabs] = useState<Tab[]>([]);
	const [activeTab, setActiveTab] = useState(post.slug);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [isInitialized, setIsInitialized] = useState(false);

	// Load tabs from sessionStorage after hydration
	useEffect(() => {
		// Default tabs for this post
		const defaultTabs: Tab[] = [
			{ id: "portfolio", name: "lukaadzic.tsx", content: "portfolio" as const },
			{ id: "journals", name: "journals.tsx", content: "journals" as const },
			{ id: post.slug, name: `${post.slug}.tsx`, content: "post" as const },
		];

		let finalTabs = defaultTabs;

		const editorTabsState = sessionStorage.getItem("editorTabs");
		if (editorTabsState) {
			try {
				const { tabs: editorTabs } = JSON.parse(editorTabsState);

				// Check if current post tab already exists
				const hasCurrentPost = editorTabs.some(
					(tab: Tab) => tab.id === post.slug,
				);

				if (hasCurrentPost) {
					// Update the existing post tab to have the correct name
					finalTabs = editorTabs.map((tab: Tab) =>
						tab.id === post.slug ? { ...tab, name: `${post.slug}.tsx` } : tab,
					);
				} else {
					// Replace any existing post tab with the current post tab
					const nonPostTabs = editorTabs.filter(
						(tab: Tab) => tab.content !== "post",
					);
					finalTabs = [
						...nonPostTabs,
						{
							id: post.slug,
							name: `${post.slug}.tsx`,
							content: "post" as const,
						},
					];
				}
			} catch {
				// Silently handle parsing error
			}
		}

		setTabs(finalTabs);
		setIsInitialized(true);

		// Update sessionStorage with final state
		const tabsState = {
			tabs: finalTabs,
			activeTab: post.slug,
		};
		sessionStorage.setItem("editorTabs", JSON.stringify(tabsState));
	}, [post.slug]); // Only depend on post.slug

	// Save tabs to sessionStorage when they change (but only after initialization)
	useEffect(() => {
		if (isInitialized && tabs.length > 0) {
			const tabsState = {
				tabs,
				activeTab,
			};
			sessionStorage.setItem("editorTabs", JSON.stringify(tabsState));
		}
	}, [tabs, activeTab, isInitialized]);

	// Collect all images (featured + additional)
	const allImages = [
		...(post.featuredImage
			? [
					{
						src: post.featuredImage,
						alt: post.title,
						crop: post.featuredImageCrop,
					},
				]
			: []),
		...(post.additionalImages
			?.filter((img): img is typeof img & { image: string } =>
				Boolean(img.image),
			)
			.map((img) => ({
				src: img.image,
				alt: img.alt || "",
				crop: undefined,
			})) || []),
	];

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

		setActiveTab(tabId);

		// Store current tabs state in sessionStorage to persist across navigation
		const tabsState = {
			tabs,
			activeTab: tabId,
		};
		sessionStorage.setItem("editorTabs", JSON.stringify(tabsState));

		// Navigate using Next.js router (no page reload)
		if (tabId === "portfolio") {
			router.push("/");
		} else if (tabId === "journals") {
			router.push("/journals");
		} else if (tabId !== post.slug) {
			// It's a different post tab - navigate to that post
			router.push(`/journals/${tabId}`);
		}
		// If it's the current post tab, just stay here - don't navigate
	};

	const closeTab = (tabId: string, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		// Don't allow closing the portfolio tab
		if (tabId === "portfolio") return;

		// Remove the tab from tabs array
		const newTabs = tabs.filter((tab) => tab.id !== tabId);

		// Update sessionStorage with new tabs
		const tabsState = {
			tabs: newTabs,
			activeTab: tabId === post.slug ? "journals" : activeTab,
		};
		sessionStorage.setItem("editorTabs", JSON.stringify(tabsState));

		// Navigate based on which tab was closed
		if (tabId === post.slug) {
			// If closing current post tab, go to journals
			router.push("/journals");
		} else if (tabId === "journals") {
			// If closing journals tab, go to portfolio
			router.push("/");
		}
	};

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
	};

	const prevImage = () => {
		setCurrentImageIndex(
			(prev) => (prev - 1 + allImages.length) % allImages.length,
		);
	};

	const getObjectPosition = (crop: { x: number; y: number }) => {
		return `${crop.x}% ${crop.y}%`;
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
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
											<Link
												href="/"
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
													className="w-4 h-4 flex-shrink-0"
													viewBox="0 0 24 24"
													fill="currentColor"
													aria-label="Home"
												>
													<title>Home icon</title>
													<path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
													<path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
												</svg>
												<span>{truncateTabName(tab.name)}</span>
											</Link>
										) : tab.content === "journals" ? (
											<Link
												href="/journals"
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
													className="w-4 h-4 flex-shrink-0"
													viewBox="0 0 24 24"
													fill="currentColor"
													aria-label="Journals"
												>
													<title>Journals icon</title>
													<path d="M1.5 6.375c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 17.625V6.375zM21 9.375A.375.375 0 0 0 20.625 9h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5zM10.875 18.75a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5zM3.375 15.375a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5zm0-3.75a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5z" />
												</svg>
												<span>{truncateTabName(tab.name)}</span>
											</Link>
										) : (
											<button
												type="button"
												onClick={(e) => switchTab(tab.id, e)}
												className="flex items-center gap-2 px-3 py-2 flex-1 tab-link transition-all duration-75"
												style={{
													color:
														activeTab === tab.id
															? "oklch(0.9 0.02 240)"
															: "oklch(0.7 0.04 240)",
												}}
											>
												<svg
													className="w-4 h-4 flex-shrink-0"
													viewBox="0 0 24 24"
													fill="currentColor"
													aria-label="Document"
												>
													<title>Document icon</title>
													<path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
													<path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
												</svg>
												<span>{truncateTabName(tab.name)}</span>
											</button>
										)}
										{(tab.id === "journals" || tab.content === "post") && (
											<button
												type="button"
												onClick={(e) => closeTab(tab.id, e)}
												aria-label={`Close ${tab.name} tab`}
												className="ml-1 px-1 py-1 transition-all duration-75 rounded-sm group"
												style={{ color: "oklch(0.6 0.04 240)" }}
											>
												<svg
													className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													aria-label="Close"
												>
													<title>Close icon</title>
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
							className="flex justify-end items-start pt-8"
							style={{ paddingLeft: "16px", paddingRight: "16px" }}
						>
							<Link
								href="/journals"
								className="text-[16px] text-foreground hover:text-foreground/80 transition-colors"
							>
								Back to Journals
							</Link>
						</header>

						{/* Writing Content */}
						<div
							className="py-8 min-h-screen post-content tab-content-container"
							style={{ paddingLeft: "16px", paddingRight: "16px" }}
						>
							<div className="space-y-8">
								<div className="space-y-12">
									<article className="group font-mono">
										{/* Post Header */}
										<div className="flex items-start gap-3 mb-4">
											<span className="text-green-400 text-sm mt-0.5 select-none font-bold">
												❯
											</span>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-2">
													<span className="text-cyan-400 text-sm font-medium">
														~/{post.postType === "take" ? "takes" : "posts"}/
													</span>
													<h2 className="font-medium text-foreground text-lg">
														{post.title}
													</h2>
													<span
														className={`text-xs ${
															post.postType === "take"
																? "text-yellow-400"
																: "text-green-400"
														}`}
													>
														{post.postType === "take" ? "◆" : "●"}
													</span>
													{post.postType === "take" && (
														<span className="text-xs text-yellow-400/60 font-mono">
															quick take
														</span>
													)}
												</div>
												{post.publishedDate && (
													<div className="flex items-center gap-2 text-xs mb-3">
														<span className="text-foreground/50">
															Published:
														</span>
														<span className="text-foreground/70">
															{formatDate(post.publishedDate)}
														</span>
													</div>
												)}
											</div>
										</div>

										{/* Featured Image - CLI Style */}
										{allImages.length > 0 && (
											<div className="flex items-start gap-3 mb-6">
												<span className="text-transparent text-sm mt-0.5 select-none font-bold">
													❯
												</span>
												<div className="flex-1 min-w-0">
													<div className="border border-dashed border-foreground/20 rounded-md overflow-hidden bg-foreground/5 max-w-lg">
														<div className="flex items-center gap-2 px-2 py-1.5 bg-foreground/10 border-b border-dashed border-foreground/20">
															<div className="flex gap-1">
																<div className="w-1.5 h-1.5 rounded-full bg-red-400/60"></div>
																<div className="w-1.5 h-1.5 rounded-full bg-yellow-400/60"></div>
																<div className="w-1.5 h-1.5 rounded-full bg-green-400/60"></div>
															</div>
															<span className="text-xs font-mono text-foreground/50 ml-1.5 truncate">
																{allImages[currentImageIndex]?.alt
																	? allImages[currentImageIndex].alt
																			.toLowerCase()
																			.replace(/\s+/g, "-")
																	: post.title
																			.toLowerCase()
																			.replace(/\s+/g, "-")}
																.jpg
															</span>
															{/* Navigation controls in header */}
															{allImages.length > 1 && (
																<div className="flex items-center gap-2 ml-auto">
																	<button
																		type="button"
																		onClick={prevImage}
																		aria-label="Previous image"
																		className="w-4 h-4 flex items-center justify-center text-foreground/50 hover:text-foreground/80 transition-colors text-xs"
																	>
																		❮
																	</button>
																	<span className="text-xs text-foreground/40 px-1">
																		{currentImageIndex + 1}/{allImages.length}
																	</span>
																	<button
																		type="button"
																		onClick={nextImage}
																		aria-label="Next image"
																		className="w-4 h-4 flex items-center justify-center text-foreground/50 hover:text-foreground/80 transition-colors text-xs"
																	>
																		❯
																	</button>
																</div>
															)}
														</div>
														<div className="p-2">
															<div className="w-full h-48 rounded border border-foreground/10 overflow-hidden bg-foreground/5">
																<Image
																	src={allImages[currentImageIndex]?.src || ""}
																	alt={
																		allImages[currentImageIndex]?.alt ||
																		post.title
																	}
																	width={400}
																	height={192}
																	className="w-full h-full object-cover"
																	style={{
																		objectPosition: allImages[currentImageIndex]
																			?.crop
																			? getObjectPosition(
																					allImages[currentImageIndex].crop,
																				)
																			: "center center",
																	}}
																/>
															</div>
															{/* Image dots indicator */}
															{allImages.length > 1 && (
																<div className="flex justify-center gap-1 mt-2">
																	{allImages.map((image, index) => (
																		<button
																			key={`image-${image.src}-${index}`}
																			type="button"
																			onClick={() =>
																				setCurrentImageIndex(index)
																			}
																			aria-label={`Go to image ${index + 1}`}
																			className="inline-flex items-center justify-center min-w-[48px] min-h-[48px] rounded focus:outline-none focus-visible:ring focus-visible:ring-cyan-400/40"
																		>
																			<span
																				className={`w-1.5 h-1.5 rounded-full transition-colors ${
																					index === currentImageIndex
																						? "bg-foreground/70"
																						: "bg-foreground/20 hover:bg-foreground/40"
																				}`}
																			/>
																		</button>
																	))}
																</div>
															)}
														</div>
													</div>
												</div>
											</div>
										)}

										{/* Post Content */}
										<div className="max-w-none">
											<ReactMarkdown
												components={{
													h1: ({ children }) => (
														<h1 className="text-xl font-semibold text-foreground mb-6 mt-8 leading-relaxed">
															{children}
														</h1>
													),
													h2: ({ children }) => (
														<h2 className="text-lg font-medium text-foreground mb-4 mt-7 leading-relaxed">
															{children}
														</h2>
													),
													h3: ({ children }) => (
														<h3 className="text-base font-medium text-foreground mb-3 mt-6 leading-relaxed">
															{children}
														</h3>
													),
													p: ({ children }) => (
														<p className="text-foreground/85 mb-6 leading-[1.7] text-base">
															{children}
														</p>
													),
													a: ({ href, children }) => (
														<a
															href={href}
															className="text-cyan-400 hover:text-cyan-300 underline decoration-1 underline-offset-2"
															target="_blank"
															rel="noopener noreferrer"
														>
															{children}
														</a>
													),
													ul: ({ children }) => (
														<ul className="list-none text-foreground/85 mb-6 space-y-3">
															{children}
														</ul>
													),
													ol: ({ children }) => (
														<ol className="list-none text-foreground/85 mb-6 space-y-3">
															{children}
														</ol>
													),
													li: ({ children }) => (
														<li className="text-base leading-[1.7] flex items-start">
															<span className="text-cyan-400 mr-3 mt-1 text-sm">
																•
															</span>
															<span>{children}</span>
														</li>
													),
													blockquote: ({ children }) => (
														<blockquote className="border-l-3 border-cyan-400/50 pl-6 italic text-foreground/75 mb-6 text-base leading-[1.7]">
															{children}
														</blockquote>
													),
													code: ({ children }) => (
														<code className="bg-foreground/10 px-2 py-1 rounded text-sm font-mono text-foreground">
															{children}
														</code>
													),
													pre: ({ children }) => (
														<pre className="bg-foreground/10 p-4 rounded overflow-x-auto mb-6 text-sm">
															{children}
														</pre>
													),
												}}
											>
												{post.content}
											</ReactMarkdown>
										</div>
									</article>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<SocialDock />
		</>
	);
}
