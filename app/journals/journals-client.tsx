"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SocialDock } from "@/components/social-dock";
import ReactMarkdown from "react-markdown";

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
  featuredImagePosition?: string; // Legacy field - ignored
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

interface JournalsClientProps {
  posts: Post[];
}

export default function JournalsClient({ posts }: JournalsClientProps) {
  const router = useRouter();

  // Initialize with default state for SSR
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "portfolio", name: "lukaadzic.tsx", content: "portfolio" },
    { id: "journals", name: "journals.tsx", content: "journals" },
  ]);

  const [activeTab, setActiveTab] = useState("journals");

  // Load tabs from sessionStorage after hydration and ensure journal tab exists
  useEffect(() => {
    const editorTabsState = sessionStorage.getItem("editorTabs");

    if (editorTabsState) {
      try {
        const { tabs: editorTabs } = JSON.parse(editorTabsState) as {
          tabs: Tab[];
        };

        // Always use the existing tabs from sessionStorage
        // Only add journal tab if it doesn't exist
        const journalsTabExists = editorTabs.some(
          (tab: Tab) => tab.id === "journals"
        );

        if (!journalsTabExists) {
          // Add journal tab to existing tabs
          const newTabs = [
            ...editorTabs,
            {
              id: "journals",
              name: "journals.tsx",
              content: "journals" as const,
            },
          ];
          setTabs(newTabs);
        } else {
          // Use existing tabs as-is
          setTabs(editorTabs);
        }
      } catch {
        // Fallback to default tabs on error
        setTabs([
          { id: "portfolio", name: "lukaadzic.tsx", content: "portfolio" },
          { id: "journals", name: "journals.tsx", content: "journals" },
        ]);
      }
    } else {
      // No sessionStorage, use default tabs
      setTabs([
        { id: "portfolio", name: "lukaadzic.tsx", content: "portfolio" },
        { id: "journals", name: "journals.tsx", content: "journals" },
      ]);
    }

    setActiveTab("journals");
    setIsInitialized(true);
  }, []);

  // Save tabs to sessionStorage only when tabs change after initial load
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized && tabs.length > 0) {
      const tabsState = {
        tabs,
        activeTab,
      };
      sessionStorage.setItem("editorTabs", JSON.stringify(tabsState));
    }
  }, [tabs, activeTab, isInitialized]);

  // Helper function to truncate long tab names
  const truncateTabName = (name: string) => {
    if (name.length <= 50) return name;

    // Remove .tsx extension, truncate, then add ...tsx
    const nameWithoutExt = name.replace(".tsx", "");
    if (nameWithoutExt.length <= 47) return name; // 47 + 3 chars for .tsx = 50

    return nameWithoutExt.substring(0, 44) + "...tsx";
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
    if (tabId === "portfolio") {
      router.push("/");
    } else if (tabId !== "journals") {
      // It's a post tab
      router.push(`/journals/${tabId}`);
    } else {
      // If it's journals tab, just update the active state
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

    // Update sessionStorage with new tabs
    const tabsState = {
      tabs: newTabs,
      activeTab: activeTab === tabId ? "journals" : activeTab,
    };
    sessionStorage.setItem("editorTabs", JSON.stringify(tabsState));

    // If we're closing the journals tab and we're currently on it, go to portfolio
    if (activeTab === tabId && tabId === "journals") {
      router.push("/");
    }
    // If we're closing a post tab, stay on journals page but update active tab
    else if (activeTab === tabId && tabId !== "journals") {
      setActiveTab("journals");
    }
  };

  const handlePostClick = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();

    // Check if this specific post tab already exists
    const postTabExists = tabs.some((tab) => tab.id === slug);

    if (!postTabExists) {
      // Replace any existing post tab with the new post tab
      const nonPostTabs = tabs.filter((tab) => tab.content !== "post");
      const newTabs = [
        ...nonPostTabs,
        { id: slug, name: `${slug}.tsx`, content: "post" as const },
      ];
      setTabs(newTabs);

      // Save to sessionStorage for navigation
      const tabsState = {
        tabs: newTabs,
        activeTab: slug,
      };
      sessionStorage.setItem("editorTabs", JSON.stringify(tabsState));
    }

    // Navigate to post using Next.js router
    router.push(`/journals/${slug}`);
  };

  // Function to render post content properly
  const renderPostContent = (
    content: string,
    excerpt: string,
    slug: string,
    postType: "post" | "take"
  ) => {
    // If no main content, show excerpt as fallback
    const textToRender = content && content.trim() !== "" ? content : excerpt;

    if (!textToRender || textToRender.trim() === "") {
      return (
        <p className="text-foreground/60 italic">
          No content available. Please add content in the &quot;Content&quot;
          field in Keystatic admin.
        </p>
      );
    }

    // For takes, always show full content. For posts, check length and truncate
    const isLongContent = postType === "post" && textToRender.length > 150;
    const displayContent = isLongContent
      ? textToRender.substring(0, 150) + "..."
      : textToRender;

    // Use ReactMarkdown for proper rendering
    return (
      <div className="relative">
        <div
          className={`prose prose-invert prose-sm max-w-none ${
            isLongContent ? "overflow-hidden" : ""
          }`}
        >
          <div className={isLongContent ? "relative" : ""}>
            <ReactMarkdown
              components={{
                // Paragraphs with proper spacing
                p: ({ children }) => (
                  <p className="mb-4 text-foreground/80 leading-relaxed">
                    {children}
                  </p>
                ),
                // Headings with CLI-style hierarchy
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold text-foreground mb-4 border-b border-foreground/20 pb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold text-foreground mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-medium text-foreground mb-2">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    {children}
                  </h4>
                ),
                // Lists with CLI styling
                ul: ({ children }) => (
                  <ul className="list-none mb-4 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-none mb-4 space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-foreground/80 before:content-['▸'] before:text-cyan-400 before:mr-2">
                    {children}
                  </li>
                ),
                // Links with CLI styling
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-cyan-400/50 hover:decoration-cyan-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                // Code styling
                code: ({ children }) => (
                  <code className="bg-foreground/10 px-1 py-0.5 rounded text-sm font-mono text-cyan-400">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-foreground/5 p-4 rounded-lg overflow-x-auto mb-4 border border-foreground/10">
                    {children}
                  </pre>
                ),
                // Blockquotes
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-cyan-400/50 pl-4 italic text-foreground/70 mb-4">
                    {children}
                  </blockquote>
                ),
                // Horizontal rules
                hr: () => <hr className="border-foreground/20 my-6" />,
                // Line breaks
                br: () => <br className="leading-relaxed" />,
              }}
            >
              {displayContent}
            </ReactMarkdown>

            {/* Fade gradient overlay for long content */}
            {isLongContent && (
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[oklch(0.15_0.08_240)] via-[oklch(0.15_0.08_240)]/80 to-transparent pointer-events-none z-10"></div>
            )}
          </div>
        </div>

        {/* CLI-style "more" link positioned outside content container */}
        {isLongContent && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
            <Link
              href={`/journals/${slug}`}
              onClick={(e) => handlePostClick(slug, e)}
              prefetch={true}
              className="pointer-events-auto inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-cyan-400/60 hover:text-cyan-300 bg-foreground/5 hover:bg-foreground/8 border border-foreground/10 hover:border-cyan-400/30 rounded transition-all duration-75 whitespace-nowrap"
              style={{ textDecoration: "none" }}
            >
              <span>read more</span>
              <svg
                className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    );
  };

  // Function to convert crop values to CSS object-position
  const getObjectPosition = (crop: { x: number; y: number }) => {
    return `${crop.x}% ${crop.y}%`;
  };

  return (
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
        className="mx-auto border-l border-r border-b border-dashed"
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
            height: "52px",
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
                      >
                        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                        <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                      </svg>
                      <span>{truncateTabName(tab.name)}</span>
                    </Link>
                  ) : tab.content === "journals" ? (
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
                      >
                        <path d="M1.5 6.375c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 17.625V6.375zM21 9.375A.375.375 0 0 0 20.625 9h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5zM10.875 18.75a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5zM3.375 15.375a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5zm0-3.75a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5z" />
                      </svg>
                      <span>{truncateTabName(tab.name)}</span>
                    </div>
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
                      >
                        <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
                        <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                      </svg>
                      <span>{truncateTabName(tab.name)}</span>
                    </Link>
                  )}

                  {(tab.id === "journals" || tab.content === "post") && (
                    <button
                      onClick={(e) => closeTab(tab.id, e)}
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
                      >
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
              <h1 className="text-[24px] font-bold text-foreground hover:text-foreground/80 transition-colors mb-1 block">
                Journals
              </h1>
            </div>
            <Link
              href="/"
              className="text-[16px] text-foreground hover:text-foreground/80 transition-colors"
            >
              Portfolio
            </Link>
          </header>

          {/* Writing Content */}
          <div
            className="py-8 min-h-screen tab-content-container"
            style={{ paddingLeft: "16px", paddingRight: "16px" }}
          >
            <div className="space-y-8">
              {posts.length > 0 ? (
                <div className="space-y-12">
                  {posts.map((post, index) => (
                    <article
                      key={post.slug}
                      className="group font-mono mobile-post-spacing"
                    >
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
                            <Link
                              href={`/journals/${post.slug}`}
                              onClick={(e) => handlePostClick(post.slug, e)}
                              prefetch={true}
                              className="font-medium text-foreground text-lg mobile-text-lg tablet-text-lg tablet-title-nowrap hover:text-foreground/80 transition-colors"
                            >
                              {post.title}
                            </Link>
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
                              <span className="text-foreground/40">
                                Published:{" "}
                                {new Date(
                                  post.publishedDate
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          )}

                          {/* Featured Image - CLI Style */}
                          {post.featuredImage && (
                            <div className="mb-6">
                              <div className="border border-dashed border-foreground/20 rounded-md overflow-hidden bg-foreground/5 max-w-lg">
                                <div className="flex items-center gap-2 px-2 py-1.5 bg-foreground/10 border-b border-dashed border-foreground/20">
                                  <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400/60"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/60"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400/60"></div>
                                  </div>
                                  <span className="text-xs font-mono text-foreground/50 ml-1.5 truncate">
                                    {post.title
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")}
                                    .jpg
                                  </span>
                                </div>
                                <div className="p-2">
                                  <div className="w-full h-48 rounded border border-foreground/10 overflow-hidden bg-foreground/5">
                                    <Image
                                      src={post.featuredImage || ""}
                                      alt={post.title}
                                      width={400}
                                      height={192}
                                      className="w-full h-full object-cover"
                                      style={{
                                        objectPosition: getObjectPosition(
                                          post.featuredImageCrop || {
                                            x: 50,
                                            y: 50,
                                          }
                                        ),
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Post Content */}
                          <div className="max-w-none">
                            {renderPostContent(
                              post.content,
                              post.excerpt,
                              post.slug,
                              post.postType
                            )}
                          </div>

                          {/* Separator between posts */}
                          {index < posts.length - 1 && (
                            <div className="mt-12 mb-8">
                              <div className="h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="group font-mono">
                  <div className="flex items-start gap-3 p-3 rounded-md">
                    <span className="text-yellow-400 text-sm mt-0.5 select-none font-bold">
                      !
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-cyan-400 text-sm font-medium">
                          ~/posts/
                        </span>
                        <span className="text-foreground/60 text-sm">
                          No posts found
                        </span>
                      </div>
                      <p className="text-xs text-foreground/60 leading-relaxed">
                        Create your first post using the Keystatic admin at{" "}
                        <Link
                          href="/keystatic"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          /keystatic
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Social Dock */}
      <SocialDock />
    </div>
  );
}
