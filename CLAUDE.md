# lukaadzic.dev

## What this is

Luka Adzic's personal portfolio. One page (`/`) plus a `/404`. The UI is a
faithful, interactive macOS Terminal window built around **prompt-driven
discovery**: on load only a short `welcome` greeting types out, then the
visitor reveals content by prompting — typing commands or clicking the
suggestion chips under the prompt (`about`, `projects`, `github`, `socials`,
`cv`, and an accented `./everything.sh` that replays the full tour). The
prompt is `lukaadzic ~ %`. `about` renders as a neofetch-style key/value info
card (name, school, location, live age, focus, project count, contact,
socials — all sourced from `lib/site.ts` / `lib/projects.ts`), and `cv` opens
the résumé in a new tab. Supported commands include `help`, `whoami`,
`email`, `age`, `pwd`, a `sudo` easter egg, `clear`, and command history via
arrow keys. Re-running a command already in the session replaces its
previous prompt+output block in place rather than stacking a duplicate
(`clear` still wipes everything). There is deliberately no photo, and the
GitHub graph renders as a terminal-native block sparkline. The terminal
aesthetic and the reveal-by-prompting interaction ARE the product — preserve
them in every change; don't "improve" it into a generic component library
look or an auto-playing content dump.

## Stack & commands

Next.js 16 (App Router), React 19, Tailwind v4, TypeScript (strict), Biome
as the only linter/formatter. **Bun only** — never introduce npm/yarn
lockfiles or ESLint.

```
bun install
bun dev              # next dev --turbopack
bun run build
bun run lint         # biome check .
bun run lint:fix      # biome check . --write
bun run typecheck    # tsc --noEmit
```

## Architecture

```
app/
  layout.tsx          metadata + JSON-LD Person schema (derived from lib/)
  page.tsx            renders TerminalWindow > TerminalSession
  not-found.tsx        404 page (NotFoundTerminal)
  api/github-contributions/route.ts   GitHub GraphQL proxy
components/
  terminal/           window chrome (terminal-window.tsx), the typing/session
                       engine (terminal-session.tsx), the command registry +
                       renderers (commands.tsx), and one output component per
                       command (about-output, whoami-output, projects-output,
                       socials-output, github-output, help-output, ...)
  shared/              components reused across terminal outputs (e.g.
                       external-link.tsx)
lib/                   single source of truth for all content
  site.ts              identity, metadata, email, GitHub username, birth date,
                       school/location/focus
  projects.ts          project list
  socials.ts           social links
  github-contributions.ts   contribution-level + fallback-data helpers
```

**Data flow:** `lib/*.ts` -> server-rendered `page.tsx` (window chrome + an
`sr-only` SEO content block) -> client `TerminalSession`, which drives the
welcome animation, suggestion chips, and interactive prompt.
`app/layout.tsx`'s metadata and JSON-LD are derived from `lib/site.ts` and
`lib/socials.ts`, never hand-duplicated.

**Key invariant:** all content (identity, projects, socials, GitHub logic)
lives in `lib/`. Components and UI code never hardcode copy — they import
it. The command registry in `commands.tsx` maps each command to a
`Renderer`; the chips and `./everything.sh` tour reuse the *same* renderers
as typed commands, so every path renders identical output.

## Principles

- **Server-first.** `"use client"` only where state or browser APIs are
  required. Actual client components today: `terminal-session.tsx` (typing
  state machine, input handling, chips), `terminal-window.tsx` (window
  chrome interactions), `not-found-terminal.tsx` (reads `usePathname`),
  `live-age.tsx` (ticking age display), `github-contributions.tsx` +
  `github-contributions-lazy.tsx` (client fetch, lazy-loaded with
  `next/dynamic` and `ssr: false`).
- **DRY outputs.** Anything rendered more than once (chip vs. typed command
  vs. `./everything.sh` tour) becomes a shared renderer/component — never
  copy a block just to tweak it.
- **Motion.** CSS-only, and gated behind `prefers-reduced-motion`. No JS
  animation libraries. Command groups animate in as a single opacity+transform
  block (no layout-affecting properties), and re-running a command replaces
  its existing block instead of appending a duplicate.
- **System font, no webfonts.** `--font-mono` / `--font-sans` in
  `app/globals.css` are OS font stacks (`ui-monospace`, `SF Mono`, etc.) —
  no `next/font`, no bundled font files. On Apple devices this renders the
  actual Terminal.app font.
- **No `!important`.**
- **SSR-first SEO.** The visible terminal starts nearly empty, so
  `page.tsx` also renders `components/terminal/seo-content.tsx` — an
  `sr-only` server-rendered block with the full content (name, about,
  project links, social links, email, resume) derived from `lib/`. Keep it
  in sync when adding content sections.
- **No new dependencies without a strong reason.** Currently 4 runtime deps
  (`next`, `react`, `react-dom`, `@vercel/analytics`). Justify any addition.

## Security practices

- The `/api/github-contributions` route serves **only** the allowlisted
  username (`SITE.githubUsername`) — any other value, or one failing the
  GitHub username regex, is rejected with 400.
- Errors are always sanitized: on any upstream failure the route returns
  fallback data with `isFallback: true`, never the raw upstream error text.
- Successful responses are CDN-cached for 1h
  (`s-maxage=3600, stale-while-revalidate=86400`) under a single cache key —
  that caching *is* the rate limiting. Don't add a serverless in-memory
  limiter; it resets per invocation and does nothing.
- Security headers + CSP live in `next.config.ts`. When adding any
  third-party script or API call, update `script-src` / `connect-src` in the
  CSP there — don't relax it globally.
- Secrets live only in `.env` (local) or the Vercel dashboard (prod), never
  as `NEXT_PUBLIC_*`, and `.env` is gitignored — never commit it. See
  `.env.example` for the required keys.

## Verification checklist

- `bun run lint`, `bun run typecheck`, `bun run build` all clean.
- Manual pass of `/`: welcome types out, suggestion chips execute their
  commands (and dim once run), `./everything.sh` replays the full tour,
  typed commands + history work, the github sparkline spans the full content
  width at desktop and ~390px with no horizontal scroll,
  `prefers-reduced-motion` disables typing animation and cursor blink.
- Manual pass of `/404`.
- `curl` the API route: a valid username returns 200 with `Cache-Control`
  set; an invalid/mismatched username returns 400.
