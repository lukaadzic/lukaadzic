"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SocialDock } from "@/components/social-dock";
import ReactMarkdown from "react-markdown";

type Tab = {
  id: string;
  name: string;
  content: "portfolio" | "writing";
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

interface WritingClientProps {
  posts: Post[];
}

export default function WritingClient({ posts }: WritingClientProps) {
  const router = useRouter();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState("writing");

  // Load tabs from localStorage
  useEffect(() => {
    const savedTabs = localStorage.getItem("portfolioTabs");
    let initialTabs: Tab[] = [
      { id: "portfolio", name: "lukaadzic.tsx", content: "portfolio" },
      { id: "writing", name: "writing.tsx", content: "writing" },
    ];

    if (savedTabs) {
      const parsedTabs = JSON.parse(savedTabs);
      // Always ensure both tabs are present
      const hasPortfolio = parsedTabs.some(
        (tab: Tab) => tab.id === "portfolio"
      );
      const hasWriting = parsedTabs.some((tab: Tab) => tab.id === "writing");

      if (!hasPortfolio) {
        parsedTabs.unshift({
          id: "portfolio",
          name: "lukaadzic.tsx",
          content: "portfolio",
        });
      }
      if (!hasWriting) {
        parsedTabs.push({
          id: "writing",
          name: "writing.tsx",
          content: "writing",
        });
      }
      initialTabs = parsedTabs;
    }

    setTabs(initialTabs);
  }, []);

  // Save tabs to localStorage whenever tabs change
  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem("portfolioTabs", JSON.stringify(tabs));
    }
  }, [tabs]);

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Don't allow closing the portfolio tab
    if (tabId === "portfolio") {
      return;
    }

    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);

    // If we're closing the writing tab and we're currently on it, go to portfolio
    if (activeTab === tabId && tabId === "writing") {
      router.push("/");
    }
  };

  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Function to convert crop values to CSS object-position
  const getObjectPosition = (crop: { x: number; y: number }) => {
    return `${crop.x}% ${crop.y}%`;
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
          No content available. Please add content in the "Content" field in
          Keystatic admin.
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
                // Lists with proper indentation
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 text-foreground/80 space-y-1 ml-4">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 text-foreground/80 space-y-1 ml-4">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-foreground/80 leading-relaxed">
                    {children}
                  </li>
                ),
                // Text formatting
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-foreground/90">{children}</em>
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
              href={`/writing/${slug}`}
              className="pointer-events-auto inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-cyan-400/60 hover:text-cyan-300 bg-foreground/5 hover:bg-foreground/8 border border-foreground/10 hover:border-cyan-400/30 rounded transition-all duration-200 whitespace-nowrap"
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
          maxWidth: "928px",
          borderColor: "oklch(0.4 0.1 240 / 0.3)",
          borderWidth: "1px",
        }}
      >
        {/* Code Editor Tab Bar */}
        <div
          className="flex items-end border-b border-dashed px-4 pt-2"
          style={{
            borderColor: "oklch(0.4 0.1 240 / 0.3)",
            backgroundColor: "oklch(0.12 0.1 240)",
            height: "52px",
          }}
        >
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="flex items-center gap-2 rounded-t-md text-sm border-t border-l border-r border-dashed mr-1"
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
                    <span>{tab.name}</span>
                  </Link>
                ) : (
                  <div
                    className="flex items-center gap-2 px-3 py-2 flex-1 cursor-pointer"
                    style={{
                      color:
                        activeTab === tab.id
                          ? "oklch(0.9 0.02 240)"
                          : "oklch(0.7 0.04 240)",
                    }}
                    onClick={() => switchTab(tab.id)}
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M1.5 6.375c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 17.625V6.375zM21 9.375A.375.375 0 0 0 20.625 9h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5zM10.875 18.75a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5zM3.375 15.375a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5zm0-3.75a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5z" />
                    </svg>
                    <span>{tab.name}</span>
                  </div>
                )}
                {tab.id === "writing" && (
                  <svg
                    className="w-3 h-3 opacity-60 hover:opacity-100 cursor-pointer mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    onClick={(e) => closeTab(tab.id, e)}
                  >
                    <path d="M6.225 4.811a1 1 0 00-1.414 1.414L10.586 12 4.81 17.775a1 1 0 101.414 1.414L12 13.414l5.775 5.775a1 1 0 001.414-1.414L13.414 12l5.775-5.775a1 1 0 00-1.414-1.414L12 10.586 6.225 4.81z" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Code Editor Content */}
        <div className="pb-24">
          {/* Writing Content */}
          <div
            className="py-8 min-h-screen"
            style={{ paddingLeft: "16px", paddingRight: "16px" }}
          >
            <div className="space-y-8">
              <p className="text-[18px] text-foreground/80 leading-7 font-mono">
                Posts & Takes:
              </p>

              {posts.length > 0 ? (
                <div className="space-y-12">
                  {posts.map((post, index) => (
                    <article key={post.slug} className="group font-mono">
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
                        </div>
                      </div>

                      {/* Featured Image - CLI Style */}
                      {post.featuredImage && (
                        <div className="ml-6 mb-6">
                          {/* Terminal-style image container */}
                          <div className="border border-dashed border-foreground/20 rounded-md overflow-hidden bg-foreground/5 max-w-lg">
                            {/* Terminal header bar */}
                            <div className="flex items-center gap-2 px-2 py-1.5 bg-foreground/10 border-b border-dashed border-foreground/20">
                              <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400/60"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/60"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400/60"></div>
                              </div>
                              <span className="text-xs font-mono text-foreground/50 ml-1.5 truncate">
                                {post.title.toLowerCase().replace(/\s+/g, "-")}
                                .jpg
                              </span>
                            </div>
                            {/* Image content */}
                            <div className="p-2">
                              <div className="w-full h-48 rounded border border-foreground/10 overflow-hidden bg-foreground/5">
                                <img
                                  src={post.featuredImage}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                  style={{
                                    objectPosition: getObjectPosition(
                                      post.featuredImageCrop || { x: 50, y: 50 }
                                    ),
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Post Content */}
                      <div className="ml-6 max-w-none">
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
      <SocialDock />
    </div>
  );
}
