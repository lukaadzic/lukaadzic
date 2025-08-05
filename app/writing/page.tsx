"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SocialDock } from "@/components/social-dock";

type Tab = {
  id: string;
  name: string;
  content: "portfolio" | "writing";
};

export default function Writing() {
  const router = useRouter();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState("writing");

  // Load tabs from localStorage on mount
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
            height: "52px", // Fixed height to prevent layout shift
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
                    onClick={(e) => {
                      closeTab(tab.id, e);
                    }}
                  >
                    <path d="M6.225 4.811a1 1 0 00-1.414 1.414L10.586 12 4.81 17.775a1 1 0 101.414 1.414L12 13.414l5.775 5.775a1 1 0 001.414-1.414L13.414 12l5.775-5.775a1 1 0 00-1.414-1.414L12 10.586 6.225 4.81z" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Code Editor Content */}
        <div className="px-20 pb-24">
          {/* Writing Content */}
          <div className="py-8 min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Writing</h1>
            <div className="space-y-6">
              <p className="text-lg text-foreground/80">
                Welcome to my writing section. Here I share thoughts on finance,
                technology, and entrepreneurship.
              </p>
              <div className="space-y-4">
                <article className="border-l-2 border-foreground/20 pl-4">
                  <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                  <p className="text-foreground/70">
                    I&apos;m currently working on some exciting articles about
                    financial technology and market analysis. Stay tuned for
                    insights from my work at Wharton and in the maritime
                    industry.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SocialDock />
    </div>
  );
}
