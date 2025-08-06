export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
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
          className="border-b border-dashed px-4 tab-scroll-container"
          style={{
            borderColor: "oklch(0.4 0.1 240 / 0.3)",
            height: "40px",
          }}
        >
          <div className="flex items-end h-full" style={{ minWidth: "max-content" }}>
            {/* Loading skeleton tabs */}
            <div
              className="tab-item flex items-center gap-2 rounded-t-md text-sm border-t border-l border-r border-dashed mr-1 animate-pulse"
              style={{
                backgroundColor: "oklch(0.16 0.06 240)",
                borderColor: "oklch(0.4 0.1 240 / 0.3)",
                marginBottom: "-1px",
                opacity: 0.8,
                minWidth: "140px",
                height: "32px",
              }}
            />
            <div
              className="tab-item flex items-center gap-2 rounded-t-md text-sm border-t border-l border-r border-dashed mr-1 animate-pulse"
              style={{
                backgroundColor: "oklch(0.16 0.06 240)",
                borderColor: "oklch(0.4 0.1 240 / 0.3)",
                marginBottom: "-1px",
                opacity: 0.8,
                minWidth: "140px",
                height: "32px",
              }}
            />
            <div
              className="tab-item flex items-center gap-2 rounded-t-md text-sm border-t border-l border-r border-dashed mr-1 animate-pulse"
              style={{
                backgroundColor: "oklch(0.2 0.08 240)",
                borderColor: "oklch(0.4 0.1 240 / 0.3)",
                marginBottom: "-1px",
                opacity: 1,
                minWidth: "140px",
                height: "32px",
              }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-10 bg-foreground/10 rounded mb-4 w-2/3"></div>
            <div className="h-4 bg-foreground/10 rounded mb-6 w-1/4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-foreground/10 rounded w-full"></div>
              <div className="h-4 bg-foreground/10 rounded w-5/6"></div>
              <div className="h-4 bg-foreground/10 rounded w-4/6"></div>
              <div className="h-4 bg-foreground/10 rounded w-full"></div>
              <div className="h-4 bg-foreground/10 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
