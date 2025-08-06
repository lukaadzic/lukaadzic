"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SocialDock } from "@/components/social-dock";

// Live age component
const LiveAge = () => {
  const [age, setAge] = useState(0);

  useEffect(() => {
    const birthDate = new Date(2005, 11, 7); // December 7, 2005 (month is 0-indexed)

    const updateAge = () => {
      const now = new Date();
      const ageInMs = now.getTime() - birthDate.getTime();
      const ageInYears = ageInMs / (365.25 * 24 * 60 * 60 * 1000);
      setAge(ageInYears);
    };

    updateAge(); // Initial calculation
    const interval = setInterval(updateAge, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-[14px] text-foreground/60 mb-4">
      {age.toFixed(8)} years old
    </div>
  );
};

// Typewriter component for description
const DescriptionTypewriter = ({ speed = 1 }: { speed?: number }) => {
  const [displayedLines, setDisplayedLines] = useState<React.ReactElement[]>(
    []
  );
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  const lines = [
    {
      text: "Replacing your chief of staff with ",
      links: [{ text: "@ Cobpot", href: "https://cobpot.com" }],
      suffix: ".",
    },
    {
      text: "Studying finance ",
      links: [
        { text: "@ Wharton", href: "https://www.wharton.upenn.edu/" },
        { text: " & running a web agency ", href: null },
        { text: "@ Pingless", href: "https://pingless.dev" },
      ],
      suffix: ".",
    },
  ];

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
        const lineElement = (
          <div
            key={currentLineIndex}
            className={`text-[18px] text-foreground/80 ${
              currentLineIndex === 0 ? "pt-1" : "pt-4"
            }`}
          >
            {currentLine.text}
            {currentLine.links.map((link, linkIndex) =>
              link.href ? (
                <Link
                  key={linkIndex}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-foreground/80 transition-colors"
                >
                  {link.text}
                </Link>
              ) : (
                <span key={linkIndex}>{link.text}</span>
              )
            )}
            {currentLine.suffix}
          </div>
        );

        setDisplayedLines((prev) => [...prev, lineElement]);
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentCharIndex, currentLineIndex, speed]);

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
        Math.min(displayText.length, initialTextLength)
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
          Math.min(displayText.length, linkEnd)
        );

        if (link.href) {
          result.push(
            <Link
              key={`link-${linkIndex}`}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-foreground/80 transition-colors"
            >
              {linkPortion}
            </Link>
          );
        } else {
          result.push(<span key={`text-${linkIndex}`}>{linkPortion}</span>);
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
      {displayedLines}
      {!isComplete && (
        <div
          className={`text-[18px] text-foreground/80 ${
            currentLineIndex === 0 ? "pt-1" : "pt-4"
          }`}
        >
          {getCurrentDisplayText()}
          <span
            className={`${
              showCursor ? "opacity-100" : "opacity-0"
            } transition-opacity`}
          >
            |
          </span>
        </div>
      )}
    </div>
  );
};

type Tab = {
  id: string;
  name: string;
  content: "portfolio" | "journals";
};

export default function Home() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState("portfolio");

  // Load tabs from localStorage on mount
  useEffect(() => {
    const savedTabs = localStorage.getItem("portfolioTabs");
    let initialTabs: Tab[] = [
      { id: "portfolio", name: "lukaadzic.tsx", content: "portfolio" },
    ];

    if (savedTabs) {
      try {
        const parsedTabs = JSON.parse(savedTabs);
        // Filter to only keep valid tabs
        const validTabs = parsedTabs.filter(
          (tab: Tab) =>
            tab.content === "portfolio" || tab.content === "journals"
        );

        // Always ensure portfolio tab is present
        const hasPortfolio = validTabs.some(
          (tab: Tab) => tab.id === "portfolio"
        );
        if (!hasPortfolio) {
          validTabs.unshift({
            id: "portfolio",
            name: "lukaadzic.tsx",
            content: "portfolio",
          });
        }
        initialTabs = validTabs;
      } catch (error) {
        console.log("Error parsing saved tabs, using defaults");
      }
    }

    setTabs(initialTabs);
    setActiveTab("portfolio");
  }, []);

  // Save tabs to localStorage whenever tabs change
  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem("portfolioTabs", JSON.stringify(tabs));
    }
  }, [tabs]);

  const openJournalsTab = () => {
    const journalsTabExists = tabs.find((tab) => tab.content === "journals");
    if (!journalsTabExists) {
      const newTab = {
        id: "journals",
        name: "journals.tsx",
        content: "journals" as const,
      };
      setTabs([...tabs, newTab]);
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

  const switchTab = (tabId: string) => {
    // Update UI state immediately for fast visual feedback
    setActiveTab(tabId);
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
                  {tab.content === "journals" ? (
                    <Link
                      href="/journals"
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
                    </div>
                  )}
                  {tab.id === "journals" && (
                    <button
                      onClick={(e) => closeTab(tab.id, e)}
                      className="ml-1 px-1 py-1 hover:bg-foreground/10 transition-colors rounded-sm group"
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
                className="text-[16px] text-foreground hover:text-foreground/80 transition-colors"
                onClick={openJournalsTab}
              >
                Journals
              </Link>
            </header>

            {/* Conditional Content Based on Active Tab */}
            {activeTab === "portfolio" && (
              <div>
                {/* Profile Section */}
                <div
                  className=""
                  style={{
                    height: "80px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                  }} // Fixed height to prevent layout shift
                >
                  {/* Description */}
                  <DescriptionTypewriter speed={50} />
                </div>
                {/* Projects Section */}
                <div
                  className="mt-4 space-y-6"
                  style={{ paddingLeft: "16px", paddingRight: "16px" }}
                >
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
                      <div className="flex items-start gap-3 p-3 rounded-md transition-all duration-200 hover:bg-foreground/5 cursor-pointer">
                        <span className="text-green-400 text-sm mt-0.5 select-none font-bold">
                          ❯
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-cyan-400 text-sm font-medium">
                              ~/projects/
                            </span>
                            <h3 className="font-medium text-foreground text-sm truncate">
                              financial-bubble-detection-dashboard
                            </h3>
                            <span className="text-green-400 text-xs">●</span>
                          </div>
                          <p className="text-xs text-foreground/60 mb-2 leading-relaxed">
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
                          >
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
                      <div className="flex items-start gap-3 p-3 rounded-md transition-all duration-200 hover:bg-foreground/5 cursor-pointer">
                        <span className="text-green-400 text-sm mt-0.5 select-none font-bold">
                          ❯
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-cyan-400 text-sm font-medium">
                              ~/projects/
                            </span>
                            <h3 className="font-medium text-foreground text-sm truncate">
                              maritime-penn-web-app
                            </h3>
                            <span className="text-green-400 text-xs">●</span>
                          </div>
                          <p className="text-xs text-foreground/60 mb-2 leading-relaxed">
                            Building tomorrow's maritime leaders at UPenn &
                            Wharton
                          </p>
                        </div>
                        <div className="text-foreground/70 group-hover:text-foreground transition-colors p-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
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

      <SocialDock />
    </>
  );
}
