# lukaadzic.dev

## What this is

Luka Adzic's personal portfolio. One page (`/`) plus a `/404`. The UI is a
faithful, interactive macOS Terminal window built around **prompt-driven
discovery**. The window is **fullscreen-only now** (edge-to-edge, square
corners, content capped to a readable ~900px column) — there's no floating
windowed mode anymore, so `data-mode="fullscreen"` on `.terminal-window-frame`
is a fixed literal, not state. The green traffic light used to zoom the
window down to a floating look; it now opens the **expanding universe**
easter egg instead (`universe-overlay.tsx`, opened/closed from
`terminal-window.tsx`): a full-viewport dark cosmos of his real life trajectory as a
clickable constellation, content in `lib/universe.ts` (luka-editable, marked
as seed placeholders). The window itself scales down slightly and fades,
then hides (`visibility: hidden`, never unmounted — state and any playing
music survive) while the cosmos is up; Esc closes an open star card first,
then exits the universe (crossfade back, focus returns to the green light).
The green glyph itself (outward triangles) no longer flips with a mode —
it's always outward now, read as "expand the universe." `/404` reuses this
exact same fullscreen chrome AND the exact same traffic-light behaviors as
the home page — `TerminalWindow` no longer branches on a page type at all;
red opens the same "don't leave." alert (DON'T LEAVE autoplay included),
yellow really minimizes to the same splash, green opens the same expanding
universe. `NotFoundTerminal` (the content `TerminalWindow` wraps on `/404`)
is a small self-contained typed sequence (no input engine, no registry): `cd
<requested-path>`, a `zsh: no such file` line, a beat, then goal art in the
`penalty` minigame's visual language — the ⚽ sailing in above the crossbar
(missed entirely) while 🧤 Livaković stands untroubled — followed by the
verdict lines and a single `cd ~` chip home.
Fullscreen is app-style, not a scrolling page: the title bar is a plain flex
row pinned to the top of a `100dvh` column and only the content area below it
scrolls internally (`overflow-y: auto`, `overscroll-behavior: contain`) when
output runs long (e.g. the penalty game) — the page itself
(`html`/`body`/`.terminal-stage`) is locked to `100dvh`/`overflow: hidden`,
scoped via `:has()` so it only applies when
`.terminal-window-frame[data-mode="fullscreen"]` is present (always true
now). On
load only a short `welcome` greeting types out at a pinned prompt line, then
that typed command line clears itself away (fade + collapse, the greeting
shifting up smoothly into its place) before the greeting content prints and
settles at the top, then the visitor reveals content by prompting — typing
commands or clicking the suggestion chips under the prompt (`about`,
`projects`, `github`, `socials`, `cv`, `pets`, `love` — the deliberately
subtle tab into Destiny's section — and `help`). There is deliberately no
"run everything" command; sections are explored one at a time. The kittens are named after Croatian football legends
(Modro ← Luka Modrić, Vida ← Domagoj Vida) — real fact, referenced in
`pets` captions and the `modric` output.
The chips act as a segmented tab bar: the chip for whatever command is
currently displayed reads as active/brighter, every other chip stays in a
clearly-clickable resting state — there is no "already run" dimming. The
prompt is `lukaadzic ~ %`. `about` renders as a neofetch-style key/value info
card (name, school, location, live age, focus, project count, contact,
socials — all sourced from `lib/site.ts` / `lib/projects.ts`), and `cv` opens
the résumé in a new tab. Supported commands include `help`, `whoami`,
`email`, `age`, `pwd`, `ls` (fake home dir; `ls ~/projects` lists project
slugs), `echo <text>`, `date` (client-evaluated, never SSR'd), `history`
(this session's commands), a `sudo` easter egg, `clear`, and command history
via arrow keys — plus Tab-completion of partial input against known
commands. Unknown commands occasionally get a sassier
`command not found` message (1-in-3). A handful of personality easter eggs
(`giveon`/`beloved`, `vatreni`, `modric`) hide as dotfiles discoverable via
`ls -la`; their content lives in `lib/easter-eggs.ts` and must stay verified
fact, never invented. `pets` (visible command, in `help`) renders pixel-art
portraits of Modro, Vida & Baby (`pets-output.tsx`) using the same colored-
cell-grid technique as the `vatreni` šahovnica — grids, palettes, and
captions live in `lib/easter-eggs.ts` as `PETS`. Luka's girlfriend Destiny has her own FIRST-CLASS
section: the `destiny` command (visible chip, in `help`)
renders her photo + card inline (`destiny-output.tsx`, photo path from
`DESTINY_PHOTO` in `lib/easter-eggs.ts`), with its own trigger chips below —
`cat /etc/loved-ones`, `git log`, and the konami chip (no `pets` chip here
anymore; `pets` is a main tab of its own now, so it stayed off this list).
`cat /etc/loved-ones` and `git log --oneline` still stagger their lines in
the same way, but no longer auto-open anything on their own — the classic
konami code (`↑↑↓↓←→←→ba`), typed anywhere or tapped as the chip in
`destiny`'s section, is the only door into the "classified" dossier reveal
(`destiny-easter-egg.tsx`, portaled to `document.body`). The dossier uses its
own photo, `DESTINY_CLASSIFIED_PHOTO` (`destiny-classified.jpg` — the Croatia
jersey, making a heart), distinct from `DESTINY_PHOTO` used everywhere else.
Two other site-styled reveal forms (a mini terminal window, a quiet
polaroid-style card) still live in the same file as the `terminal`/`card`
styles, dormant until something calls `openDestiny` with them again.
`#f0a6ca` (soft pink) is Destiny's color across every reveal — the one
deliberate named-color exception in the app, same idea as the green prompt.
Not listed in `help`, the suggestion chips, or `ls -la` — konami plus
curiosity are enough.
The red traffic light refuses to
close, on every page: a macOS-style "don't leave." alert opens over the
window with Giveon's DON'T LEAVE autoplaying inside it, and `leave anyway`
loses its nerve twice before conceding — all alert copy is original, never
verbatim lyrics. The yellow light
(`terminal-window.tsx` + `minimize-dock.tsx`) really
minimizes: the window shrinks toward its own center and hides
(`visibility: hidden`, never unmounted, so a playing Spotify embed and the
ticking live-age both survive), and a full-viewport centered "still
compiling" splash fades up in its place over a slow, dark `ShaderGradient`
backdrop (`@shadergradient/react`, tuned to the same deep blue/purple wash
as `.terminal-stage`'s own wallpaper gradient — never a bright preset) —
baby-Luka's photo icon (`public/images/luka-kid.jpg`, green-`L` fallback),
the name `luka_early_build.app`, and a fake terminal compile progress line
(`compiling ▓▓▓▓▓░░░░░ 47%`) that crawls, stalls near 99%, and drops back on
a loop that never finishes — it's v0.1, still compiling, that's the joke —
under a faint `click anywhere to restore` hint. The shader (and,
transitively, three.js/`@react-three/fiber`) is lazy-loaded from exactly one
place, `minimize-splash-shader.tsx`, reached only via
`next/dynamic(..., { ssr: false })` inside `minimize-dock.tsx` — the chunk
is fetched the first time someone actually minimizes, never on page load, so
`/`'s First Load JS is unaffected (verified against `next build` output). A
static CSS echo of the wallpaper (`.minimize-splash-backdrop`) is always the
base layer, so there's no flash while the chunk loads and a silent,
on-brand fallback for reduced motion, no WebGL, or a browser that never
finishes loading the chunk at all. Click anywhere on the splash (or
Enter/Space on the focused icon, or Esc from anywhere) restores — as a real
crossfade: the splash's own fade-out and the window's fade-in both start on
the same tick and run the same 200ms/easing (`MinimizeDock`'s `dismissing`
prop and `TerminalWindow`'s `restoring` state are the same boolean), so
there's never a sequential "splash gone, then window pops in" gap. The
window frame's page-load entrance class (`terminal-window-in`) is
permanently stripped once its animation first finishes (`hasEntered`) —
left in place, it silently became the winning `animation` declaration again
every time `restoring`'s class came back off, replaying the fade-in-from-
scratch on every single restore (a real, reproduced jostle) right after the
crossfade had already finished. So the
track starts
the instant the alert opens rather than after a script fetch,
`terminal-window.tsx` warms Spotify's iFrame API script during idle time
after mount and again on the first pointerover/focus of the traffic-light
group — `loadSpotifyIframeApi()` is a safe no-op once already loaded, and
warming never itself plays audio; `app/layout.tsx` also preconnects to
`open.spotify.com` and `embed-cdn.spotifycdn.com` so the embed boots fast
enough to land inside the gesture window when the browser allows it at all.
Mobile browsers (iOS especially) routinely block the autoplay outright — the
gesture doesn't carry across the cross-origin iframe boundary, and that
can't be worked around from the page side. `SpotifyPlayer` (shared by
`giveon` and the close alert) handles this gracefully instead: if
`playback_started` hasn't fired ~1.4s after `ready`, a small faint nudge
line fades in below the player (`tap ▶ to play — your phone wants the
honors.`), and fades back out if playback ends up starting late. It never
appears in the normal desktop case. The pinned
`welcome` block opens with
a block-letter ASCII banner of the FULL name (built from a tiny per-letter
glyph map in `welcome-output.tsx`, `aria-hidden` with an `sr-only` text
alternative); below 640px the banner stays block-letter but stacks
first/last name on two lines so it never wraps — Luka explicitly wants the
banner present at every screen size, never collapsed to plain text. There is deliberately no photo, and the GitHub
graph renders as a terminal-native block sparkline. The terminal aesthetic
and the reveal-by-prompting interaction ARE the product — preserve them in
every change; don't "improve" it into a generic component library look or
an auto-playing content dump.

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
                       renderers (commands.tsx), one output component per
                       command (about-output, whoami-output, projects-output,
                       socials-output, github-output, help-output, ...), the
                       minimize splash (minimize-dock.tsx) and the green
                       light's expanding-universe overlay
                       (universe-overlay.tsx)
  shared/              components reused across terminal outputs (e.g.
                       external-link.tsx)
lib/                   single source of truth for all content
  site.ts              identity, metadata, email, GitHub username, birth date,
                       school/location/focus
  projects.ts          project list
  socials.ts           social links
  github-contributions.ts   contribution-level + fallback-data helpers
  universe.ts          the expanding-universe constellation data (his real
                       trajectory as stars + links) — luka-editable
```

**Data flow:** `lib/*.ts` -> server-rendered `page.tsx` (window chrome + an
`sr-only` SEO content block) -> client `TerminalSession`, which drives the
welcome animation, suggestion chips, and interactive prompt.
`app/layout.tsx`'s metadata and JSON-LD are derived from `lib/site.ts` and
`lib/socials.ts`, never hand-duplicated.

**Key invariant:** all content (identity, projects, socials, GitHub logic)
lives in `lib/`. Components and UI code never hardcode copy — they import
it. The command registry in `commands.tsx` maps each command to a
`Renderer`; chips and typed input all resolve through
that same registry, so every path renders identical output.

## Principles

- **Server-first.** `"use client"` only where state or browser APIs are
  required. Actual client components today: `terminal-session.tsx` (typing
  state machine, input handling, chips), `terminal-window.tsx` (window
  chrome interactions), `not-found-terminal.tsx` (reads `usePathname`),
  `live-age.tsx` (ticking age display), `github-contributions.tsx` +
  `github-contributions-lazy.tsx` (client fetch, lazy-loaded with
  `next/dynamic` and `ssr: false`).
- **DRY outputs.** Anything rendered more than once (chip vs. typed command
  vs. any combined view) becomes a shared renderer/component — never
  copy a block just to tweak it.
- **Motion.** CSS transitions/keyframes plus small inline-style transitions
  driven by React state for the exact swap timings below (transform/opacity
  only, except the measured height transition described next), gated behind
  `prefers-reduced-motion`. IMPORTANT: reduced motion removes MOVEMENT, not
  ORDER — the entrance pieces (login, prompt, chips) use motionless 1ms
  opacity "appears" anchored to the same `[data-booted]` clock, never
  instant `opacity: 1` at paint (that painted chips before the JS-revealed
  content on slow-hydrating devices — a real reported bug). No JS
  animation libraries. One easing family — `cubic-bezier(0.16, 1, 0.3, 1)` —
  runs through the whole opening choreography below.
- **Opening choreography.** Page load is one deliberately staged sequence,
  strictly top to bottom like a real terminal boot — no beat renders below
  content that hasn't appeared yet above it — each beat starting while the
  previous is still finishing (~60-70% through it) rather than waiting, so
  it reads as continuous motion, not a slideshow — total time to interactive
  is ~2.3-2.6s:
  1. `0-280ms` — the window fades in. Fullscreen is the only mode now (both
     `/` and `/404`), so that's opacity + a small `translateY` only, since
     scaling a full-viewport element forces a whole-page repaint every
     frame.
  2. `~200ms` — the "Last login" line reveals (`last-login.tsx`). It's
     computed in a `useLayoutEffect` (not `useEffect`), so the real value is
     already in place before the browser paints the hydrated tree; combined
     with an always-on `opacity: 0` base (covering the pre-hydration SSR
     paint too), the bare "Last login:" placeholder is never visible — the
     line only ever reserves its own height until a fixed-delay CSS fade
     (`terminal-last-login-in`, 240ms) reveals it fully formed.
  3. `~350ms` — the PINNED welcome block's own prompt line fades in directly
     under login, with the block cursor (`terminal-active-prompt-in`,
     260ms) — plays once on mount, never replays mid-session.
  4. `~500ms` — `welcome` types into that pinned line, char by char
     (jittered ~55ms/char) — `bootTyped` state in `terminal-session.tsx`,
     kept separate from `inputValue` (which stays reserved for real user
     input). The bottom active prompt is not visible yet.
  5. On typing completion — the pinned prompt line goes static (cursor
     removed) and sits still for a brief ~250ms beat
     (`BOOT_COMMAND_LEAVE_BEAT_MS`), like a shell pausing right after a
     command runs.
  6. The command line then clears itself: it fades (opacity, 180ms) and
     collapses (`max-height`, 220ms, `.boot-command-line` /
     `-leaving` in `globals.css`) away in place, while — concurrently — the
     pinned block's OUTPUT (banner + greeting + hint) prints line by line
     via `.welcome-line` + `data-welcome-revealed` (unchanged mechanics:
     90/190/280ms per-line delay, 240ms fade each) right where the command
     line was, so the content visibly shifts up to fill the gap as the line
     shrinks away — an ordinary layout-reflow consequence, not a separate
     animated step. Once `.boot-command-line`'s transition ends,
     `terminal-session.tsx` stops rendering the line at all
     (`commandLineGone`) — the settled session has no
     `lukaadzic ~ % welcome` line left, as if it ran and cleared itself. The
     welcome OUTPUT block is mounted at `opacity: 0` from first paint so its
     final height never moves — zero layout shift across the whole
     sequence.
  7. Once the last welcome line has settled (280ms delay + 240ms fade + a
     100ms tail after the command line starts clearing) — the ACTIVE prompt
     fades in below everything, with the cursor now handed to it
     (`terminal-prompt-ready-in`, 260ms). This used to be the bottom
     prompt's very first beat, with `welcome` typing there directly — that
     read as the eye jumping bottom-to-top once the pinned block later
     appeared above it; it's now deliberately last.
  8. `~90ms` after the active prompt beat — the suggestion chips ripple in
     with a ~40ms stagger, and chips get a subtle `scale(0.97)` on press.

  Beats 3 and 8 are CSS `animation-delay`s off `[data-booted]` (fixed,
  hydration-anchored delays — 350ms for the pinned prompt, ~1600ms+ for
  chips). Beat 7 is different: because it depends on how long `welcome`
  actually took to type plus the real welcome-line stagger, it isn't a
  guessed fixed delay — `terminal-session.tsx` sets a second attribute,
  `data-prompt-ready`, on the session root only once that has actually
  finished (see `finishBoot`), and `[data-prompt-ready]
  .terminal-prompt-ready-in` in `globals.css` needs no further delay of its
  own. All of `data-booted`, `data-welcome-revealed`, and `data-prompt-ready`
  land in the same JS effect/clock, so a slow-hydrating device still gets
  every beat in the same relative order instead of CSS beats racing ahead of
  typing that hasn't started. Each of the `[data-booted]`-gated rules (and
  `.terminal-prompt-ready-in`) also keeps an ungated fallback copy with a
  long ~3s delay and a distinct `animation-name` (needed so the browser
  restarts the animation, delay included, once its gate starts matching) —
  an un-strandable guarantee that the pinned prompt/active prompt/chips
  still eventually appear even if JS never runs at all (this shipped broken
  once). Clicking/pressing Enter during boot fast-forwards straight to the
  final settled state (no `welcome` command line, all welcome content,
  active prompt + cursor) — chips still land on their own timing.
- **Session/command motion.** The session shows the `welcome` block plus
  exactly one command group below it — never a stacking log. Running a new
  command fades the currently displayed group out (~120ms), types the new
  command at the prompt, then fades its output up (~280ms,
  `cubic-bezier(0.16, 1, 0.3, 1)`); `clear` fades the current group out and
  leaves the welcome-only state. `terminal-session.tsx` also drives a
  measured FLIP-style height transition on `.terminal-group-container`
  whenever the displayed group changes: it measures the container's current
  pixel height, swaps the content, measures the new height on the next
  frame, and transitions `height` between the two (~240ms,
  `cubic-bezier(0.16, 1, 0.3, 1)`, `overflow: hidden` only for the
  transition's duration, released back to `height: auto` on
  `transitionend`) — this replaces relying on `interpolate-size`, which only
  ships in the newest Chrome.
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
- **No new dependencies without a strong reason.** Currently 9 runtime deps:
  `next`, `react`, `react-dom`, `@vercel/analytics`, plus
  `@shadergradient/react` + `@react-three/fiber` + `three` +
  `camera-controls` + `three-stdlib` (peer dep of shadergradient) for the
  minimize splash's shader backdrop (`minimize-splash-shader.tsx`) — the
  shader stack is lazy-loaded via `next/dynamic(..., { ssr: false })` from
  that one file, so it never ships in the main bundle. Justify any addition.

## Git & attribution

- Commits are authored by Luka only. Never add `Co-Authored-By` trailers,
  "Generated with" footers, robot emoji, or anything else that signals AI
  involvement — in commits, PR titles/descriptions, or issue text.
- Write commit subjects and PR descriptions in Luka's voice: short, direct,
  lowercase-casual is fine ("fix chip highlight", "rework github graph").
  One commit per logical change — he wants each change to count individually.
- Merges to `main` preserve individual commits (rebase merge, never squash).

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
- Manual pass of `/`: welcome types out, clears itself, and the greeting
  settles pinned at the top, suggestion chips
  execute their commands and show the active one as brighter (never
  dimmed), typed commands + history work, the github sparkline spans the full content
  width at desktop and ~390px with no horizontal scroll,
  `prefers-reduced-motion` disables typing animation and cursor blink; the
  green light opens the expanding universe (stars fade in, lines draw, a
  star card opens/closes, Esc closes the card then exits, music and
  LiveAge keep running underneath, focus returns to the green light).
- Manual pass of `/404`: same `TerminalWindow` chrome as `/`, so the same
  traffic-light checks apply — red opens the "don't leave." alert with
  DON'T LEAVE autoplay, yellow minimizes to the splash and restores back to
  the `cd <path>` / crossbar content intact, green opens the expanding
  universe and Esc returns.
- `curl` the API route: a valid username returns 200 with `Cache-Control`
  set; an invalid/mismatched username returns 400.
