# Websites

Premium client website work. Skills in `.claude/skills/` load automatically.

## Layout

- `account-sync-skills/` — **the 33 canonical global skills.** Source of truth for the
  claude.ai account-sync upload. Provenance in `CREDITS.md` there, hashes in
  `CHECKSUMS.txt`. See `docs/ACCOUNT-SYNC-UPLOAD.md`.
- `starters/premium-site/` — Next.js + React + TypeScript + Tailwind starter with the
  full QA gate. Copy to `clients/<name>/` to begin a project. Never build in the starter.
- `scripts/bootstrap-claude-plugins.sh` — restores the 5 plugins in a fresh cloud container.
- `scripts/package-account-sync-skills.sh` — builds the reproducible upload package.
- `docs/` — `ROUTING.md`, `PLUGINS.md`, `ACCOUNT-SYNC-UPLOAD.md`, `OMNIROUTE.md`.
- `.claude/skills/` — only what is NOT account-synced: the Strix security set, Ponytail,
  and `00-design-references/` (shared data, embedded into its consumers for sync).

**The design skills are no longer duplicated here.** They live in `account-sync-skills/`
and reach every project through the account. Project skills override account-synced ones of
the same name, so keeping stale copies here would silently shadow the canonical versions.

---

## Skill routing — canonical copy in `docs/ROUTING.md`

These skills have overlapping descriptions and will all try to claim a design request.
**They are not peers.** Use this precedence. One skill drives; the rest are reference or
explicitly invoked.

### One driver per request

| The request | The skill that drives | Everything else |
|---|---|---|
| Build any new UI | `frontend-design-skill` | It is a *conductor* — it calls the others and holds an 8-item evidence gate. Let it orchestrate. |
| Build a landing / marketing page | `website` | Narrative structure, hero thesis, conversion arc. Still satisfy the gate. |
| Rebuild an existing site from a URL | `website-rebuild` | 14-phase pipeline. Owns the whole job end to end. |
| Change existing UI | `/impeccable <verb>` | **Plugin v4.1.3**, not a vendored skill. See below. |
| Motion graphics / video | `remotion-motion-graphics` | Unrelated to the web skills. No conflict. |
| Substantial website motion / interaction | `premium-motion-direction` | Art direction and choreography — *what* moves and *why*. Then the official `gsap-*` skills for implementation. |

### `impeccable` owns all refinement verbs

`impeccable` is the umbrella for 17 refinement modes. It is installed as the upstream
**plugin v4.1.3** (`impeccable@impeccable`), never vendored — the old 58-file copy here was
proven byte-identical to the taste-derived version and was removed. Modes live in the
plugin's `reference/`:

`adapt` `animate` `audit` `bolder` `clarify` `colorize` `critique` `delight` `distill`
`harden` `layout` `optimize` `overdrive` `polish` `quieter` `shape` `typeset`

Invoke as `impeccable polish`, `impeccable audit`, `impeccable shape`. These were removed
as standalone skills precisely so they stop competing with their own parent — do not
reinstall them.

### Never drivers — reference only

Read these for knowledge. They must not take over a request:

| Skill | Consulted for |
|---|---|
| `ui-ux-pro-max` | **Data lookup, via its scripts.** 84 styles, 192 palettes, 74 font pairings, 17 GSAP presets, 22 stacks. Run the script; never guess these values from memory. |
| `high-end-visual-design` | What makes a site read as expensive; the defaults that read as cheap. |
| `emil-design-eng` | Component craft and the invisible details. |
| `apple-design-hig` | 53 Apple HIG documents. Cite them; don't let them drive a web layout. |
| `tailwind-ui-rules` | Tailwind implementation correctness. Its own description claims it "must always be active" — treat that as *consult during implementation*, not as a licence to drive direction. |

### Explicitly invoked only — never self-trigger

| Skill | When |
|---|---|
| `visual-preview` | You want a client-facing HTML review artefact. |
| `web-design-guidelines` | A review pass against Vercel's Web Interface Guidelines. |
| `design-system` | Building or extending a token architecture. |
| `brand` | Brand voice, messaging, identity rules. |
| `brandkit` | Generating brand-guideline boards and identity imagery. |
| `imagegen-frontend-web` | Generating per-section reference imagery before building. |

### Account-synced skills

The 33 skills in `account-sync-skills/` are uploaded to claude.ai and enabled for the
account, so they load in **every** Claude Code cloud session automatically. That is the
only distribution channel that survives a container recycle.

Anthropic's own `frontend-design` is installed as a **plugin but disabled by default** —
enabling it puts a second automatic conductor alongside `frontend-design-skill`.
`frontend-design-skill` wins here: it has the evidence gate. Enable the Anthropic one
deliberately for a second opinion, then disable it again (`docs/PLUGINS.md`).

---

## Project flow

1. `/impeccable shape` — structured discovery. Never skip this on client work.
2. `ui-ux-pro-max` scripts — palette, type pairing, style direction:
   ```bash
   python3 "${CLAUDE_SKILL_DIR}/scripts/search.py" "luxury architecture studio" --domain style
   python3 "${CLAUDE_SKILL_DIR}/scripts/search.py" "wellness spa" --design-system --project-name "Serenity"
   python3 "${CLAUDE_SKILL_DIR}/scripts/search.py" "scroll reveal" --domain gsap
   ```
3. `frontend-design-skill` or `website` — the build.
4. `impeccable critique` / `impeccable audit` / `web-design-guidelines` — review.
5. `pnpm verify` — the full gate. Or `pnpm test:a11y`, `pnpm test:visual`, `pnpm lighthouse`.
6. `visual-preview` — the client review artefact.

## Conventions

- pnpm. App Router, `src/`, `@/*` alias.
- Run `pnpm build` before calling UI work finished — it typechecks and catches RSC errors.
- Run `pnpm test:a11y` before showing a client anything. WCAG AA is a floor, not a goal.

## Motion

`motion` (React), `gsap` (scroll narrative), `lenis` (smooth scroll) are in the starter.
`ui-ux-pro-max` ships 17 GSAP presets — search them rather than inventing timings.
Always honour `prefers-reduced-motion`; `impeccable animate` covers the craft rules.

## Hard bans carried by these skills

No emoji as icons or decoration — SVG only. Not Inter + Roboto as the display/body pair.
No `slate-*` as a palette. No purple-to-blue gradients. No lorem ipsum or grey placeholders
in anything presented as finished. One heroic effect per screen.

## Environment

- Brad works through the Claude Desktop app (locally) and claude.ai/code (cloud), never a
  terminal. Don't ask him to type slash commands (`/plugin`, `/mcp`...) or `claude ...` into a
  shell — run the step yourself, and say when a new session is needed for a newly installed
  plugin, skill or MCP server to load.
- Claude Code cloud sessions are ephemeral: `~/.claude` is wiped when a container is
  recycled, so only committed work and account-synced skills survive. Never hand-install
  skills into `~/.claude/skills/` — put reusable ones in `account-sync-skills/` and upload
  them to the account; keep project-only ones in the project's `.claude/skills/`.
- Plugins do not sync. Run `bash scripts/bootstrap-claude-plugins.sh` once per fresh
  container; it is idempotent and no-ops when everything is present.
- Playwright and Chromium are preinstalled system-wide (`/opt/pw-browsers`).
  **Never run `playwright install`** in a web session. `playwright.config.ts` already points
  at the system binary via `PLAYWRIGHT_BROWSERS_PATH`.
- `remotion-motion-graphics` needs `remotion @remotion/cli react react-dom` per project.

---

## Engineering layer — non-design tools

These are **not** design skills and must never drive art direction. Each fills one gap.

| Tool | Job | Invoke |
|---|---|---|
| **GSAP AI Skills** (8) | Specialist motion engineering. Correct current GSAP API. | Auto-triggers on motion work: `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-react`, `gsap-frameworks`, `gsap-utils`, `gsap-performance` |
| **Strix skills** (9) | Authorised security testing only. Never automatic. | `penetration-testing-with-strix`, `owasp-top-10-testing`, `api-security-testing`, `fix-security-vulnerabilities-with-strix`, `ci-security-scanning-with-strix`, + 4 more |
| **Graphify** | Architectural awareness before large changes. | `/graphify` skill is vendored. Building a graph needs the CLI on demand: `uv tool install graphifyy`, then `graphify query/path/explain` |
| **Ponytail** | Implementation discipline. | `/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`, `/ponytail-gain`, `/ponytail-help` — vendored skills, no runtime modes (see below) |
| **CodeBurn** | Claude-environment diagnostics. | On demand only: `npx --yes codeburn@latest optimize`. Never `--apply` |
| **OmniRoute** | Model/token routing. **Not installed, not bootstrapped.** | Audited: needs a local gateway on port 20128, cannot persist in a managed container, and routing client briefs to third-party providers carries confidentiality and compression risk. Use native `/model` selection instead — see `docs/OMNIROUTE.md` |

### Motion philosophy — GSAP is not a licence to animate everything

Motion serves hierarchy, storytelling and brand. One heroic effect per screen (already a hard
ban above). Prefer confident entrances, elegant reveals, image transitions, typography
choreography, subtle parallax, polished nav transitions. Avoid constant movement, animation on
every heading, scroll hijacking, gratuitous pinning, and anything that delays navigation or
hurts conversion. Always honour `prefers-reduced-motion` — use `gsap.matchMedia()`.

### Implementation discipline — the Lite-equivalent rule

Ponytail's plugin runtime (lifecycle hooks, `/ponytail lite|full|ultra`, `PONYTAIL_DEFAULT_MODE`)
**does not exist in this hosted environment** — only the vendored skills do. There is therefore no
mode to "set". **Lite is not technically active; this rule is the durable equivalent**, and it is
the one that governs:

- Prefer the smallest robust implementation that fully does the job.
- Avoid unnecessary abstractions, providers for trivial state, wrapper components, duplicate
  helpers, file proliferation, and dependencies for things the platform already does well.
- When a genuinely simpler or lazier alternative exists, say so — once, then build what was asked.
- **This is not a minimalism mandate and must never make a site look basic.** It governs
  *implementation plumbing*, never art direction, visual ambition, or craft.

### Ponytail must not flatten art direction

Ponytail cuts *unnecessary* abstraction — providers for trivial state, wrapper components,
duplicate helpers, libraries for things CSS already does. It does **not** cut intentional
craft. GSAP, ScrollTrigger, SplitText, Flip, Three.js, R3F, WebGL, shaders, Lenis, custom
cursors, page transitions and cinematic interaction are legitimate when the design justifies
them. Lite is the default for creative and normal work; Full only for deliberate refactors.

### Approved per-project toolbox — never global

Pick the smallest stack the art direction justifies. Motion: `gsap`, `motion`, `lenis`.
Components: React Bits, Motion Primitives, shadcn/ui. 3D: `three`, `@react-three/fiber`,
`@react-three/drei`, `r3f-scroll-rig`. Brand motion: Rive.
Automotive and real-estate can justify 3D/WebGL with performance safeguards; beauty, coffee
and landscaping usually should not. Never install one because it exists.

### QA baseline for client work

Playwright (widths 375/390/768/1024/1440/1920, baselines for nav, hero, key routes, mobile,
forms, footers, booking flows), axe-core accessibility, Lighthouse CI, and Strix against an
**authorised** target only. Install these per project, not globally. Optimise intelligently —
do not destroy intentional design to chase a synthetic score.

### Security boundaries — Strix

Only your own repos, your own local apps, and explicitly authorised staging. Never third-party
or client production without written authorisation. Strix never runs automatically.
