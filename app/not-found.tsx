import Link from "next/link";
import { SocialDock } from "@/components/social-dock";

export default function NotFound() {
  return (
    <>
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
          {/* Tab Bar */}
          <div
            className="border-b border-dashed px-4 pt-2"
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
              <div
                className="flex items-center gap-2 rounded-t-md text-sm border-t border-l border-r border-dashed mr-1"
                style={{
                  backgroundColor: "oklch(0.2 0.08 240)",
                  borderColor: "oklch(0.4 0.1 240 / 0.3)",
                  marginBottom: "-1px",
                  minWidth: "160px",
                  color: "oklch(0.9 0.02 240)",
                }}
              >
                <div className="flex items-center gap-2 px-3 py-2">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
                    <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                  </svg>
                  <span>404.tsx</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-14 pb-28 min-h-[calc(100vh-52px)] flex items-center justify-center">
            <div className="w-full max-w-2xl mx-auto text-center space-y-6">
              <div className="font-mono">
                <pre
                  className="text-[20px] leading-7 text-foreground/90 whitespace-pre-wrap"
                  aria-label="404 terminal"
                >
                  {`$ cat 404.tsx
// 404 Not Found
// This page doesn’t exist.`}
                </pre>
              </div>

              <div className="flex justify-center">
                <Link
                  href="/"
                  className="px-3 py-2 rounded-md border border-dashed transition-colors"
                  style={{
                    borderColor: "oklch(0.4 0.1 240 / 0.3)",
                    backgroundColor: "oklch(0.16 0.06 240)",
                    color: "oklch(0.9 0.02 240)",
                  }}
                >
                  ← Back to home
                </Link>
              </div>

              {/* Separator */}
              <div className="my-6">
                <div className="h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
              </div>

              <div className="font-mono text-sm text-foreground/70 flex items-center justify-center gap-2">
                <span className="text-green-400">❯</span>
                <span className="text-cyan-400">~</span>
                <span className="text-foreground/60">/404</span>
                <span className="text-green-400 ml-1">●</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SocialDock />
    </>
  );
}
