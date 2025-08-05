"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

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
const DescriptionTypewriter = ({ speed = 50 }: { speed?: number }) => {
  const [displayedLines, setDisplayedLines] = useState<React.ReactElement[]>(
    []
  );
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  const lines = [
    {
      text: "Replacing your Chief of Staff with ",
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
  content: "portfolio" | "writing";
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
      const parsedTabs = JSON.parse(savedTabs);
      // Always ensure portfolio tab is present
      const hasPortfolio = parsedTabs.some(
        (tab: Tab) => tab.id === "portfolio"
      );
      if (!hasPortfolio) {
        parsedTabs.unshift({
          id: "portfolio",
          name: "lukaadzic.tsx",
          content: "portfolio",
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

  const openWritingTab = () => {
    const writingTabExists = tabs.find((tab) => tab.content === "writing");
    if (!writingTabExists) {
      const newTab = {
        id: "writing",
        name: "writing.tsx",
        content: "writing" as const,
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

    // If we're closing the writing tab and we're currently on it, go to portfolio
    if (activeTab === tabId && tabId === "writing") {
      // Stay on current page (portfolio) since we're closing writing tab
      setActiveTab("portfolio");
    }
  };

  const switchTab = (tabId: string) => {
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
                  {tab.content === "writing" ? (
                    <Link
                      href="/writing"
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
          <div className="px-20">
            <header className="flex justify-between items-start pt-8">
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
                href="/writing"
                className="text-[16px] text-foreground hover:text-foreground/80 transition-colors"
                onClick={openWritingTab}
              >
                Writing
              </Link>
            </header>

            {/* Conditional Content Based on Active Tab */}
            {activeTab === "portfolio" && (
              <div>
                {/* Profile Section */}
                <div
                  className=""
                  style={{ height: "80px" }} // Fixed height to prevent layout shift
                >
                  {/* Description */}
                  <DescriptionTypewriter speed={50} />
                </div>
                {/* Projects Section */}
                <div className="mt-12 space-y-6">
                  <p className="text-[18px] text-foreground/80 leading-7">
                    Some Shit I&apos;ve Built:
                  </p>
                  <h2 className="text-xl font-bold">PROJECTS</h2>

                  <div className="space-y-4">
                    {/* Project 1 - Financial Bubble Detection Dashboard */}
                    <div className="group p-4 rounded-lg border border-foreground/10 hover:border-foreground/20 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">
                            Financial Bubble Detection Dashboard
                          </h3>
                          <p className="text-sm text-foreground/60">
                            Real-time financial bubble detection using options
                            data
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href="https://github.com/lukaadzic/financial-bubble-detection-dashboard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground/60 hover:text-foreground transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          </Link>
                          <Link
                            href="https://financial-bubble.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground/60 hover:text-foreground transition-colors"
                          >
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
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Project 2 - Maritime@Penn Web App */}
                    <div className="group p-4 rounded-lg border border-foreground/10 hover:border-foreground/20 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">
                            Maritime@Penn Web App
                          </h3>
                          <p className="text-sm text-foreground/60">
                            Building tomorrow&apos;s maritime leaders at UPenn &
                            Wharton
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href="https://github.com/lukaadzic/PennMaritime"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground/60 hover:text-foreground transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          </Link>
                          <Link
                            href="https://pennmaritime.club/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground/60 hover:text-foreground transition-colors"
                          >
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
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Project 3 */}
                    <div className="group p-4 rounded-lg border border-foreground/10 hover:border-foreground/20 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">
                            An advanced food ordering
                          </h3>
                          <p className="text-sm text-foreground/60">Pingless</p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href="https://github.com/yourusername/pingless"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground/60 hover:text-foreground transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          </Link>
                          <Link
                            href="https://pingless.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground/60 hover:text-foreground transition-colors"
                          >
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
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Project 4 */}
                    <div className="group p-4 rounded-lg border border-foreground/10 hover:border-foreground/20 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">
                            A simple portfolio website
                          </h3>
                          <p className="text-sm text-foreground/60">ADZIC.IO</p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href="https://github.com/yourusername/portfolio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground/60 hover:text-foreground transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          </Link>
                          <Link
                            href="https://adzic.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground/60 hover:text-foreground transition-colors"
                          >
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
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Social Links */}
                <div className="mt-12 pt-8 border-t border-foreground/10">
                  <div className="flex justify-center gap-4">
                    <Link
                      href="https://twitter.com/yourusername"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/60 hover:text-foreground transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </Link>
                    <Link
                      href="https://github.com/yourusername"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/60 hover:text-foreground transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </Link>
                    <Link
                      href="https://linkedin.com/in/yourusername"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/60 hover:text-foreground transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </Link>
                    <Link
                      href="mailto:your.email@example.com"
                      className="text-foreground/60 hover:text-foreground transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </Link>
                    <Link
                      href="https://instagram.com/yourusername"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/60 hover:text-foreground transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
