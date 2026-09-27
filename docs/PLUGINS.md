# Plugin layer

Six capabilities cannot travel through account sync and must be plugins.

Two of them contain **no skill at all**, which is the reason the split exists:

| Plugin | Skills | Agents | Hooks | MCP |
|---|---:|---:|---:|---:|
| `impeccable` 4.1.3 | 1 | 4 | 2 | 0 |
| `chrome-devtools-mcp` 1.8.0 | 7 | 0 | 0 | 1 |
| `feature-dev` 1.0.0 | 0 | 3 | 0 | 0 |
| `security-guidance` 2.0.0 | 0 | 0 | 4 | 0 |
| `frontend-design` 1.1.0 | 1 | 0 | 0 | 0 |
| `21st` 0.4.1 | 7 | 0 | 0 | 1 |

`feature-dev` ships agents and a command; `security-guidance` ships only hooks.
Account sync distributes *skills*, so neither could ever be delivered that way.

## Install

```bash
bash scripts/bootstrap-claude-plugins.sh            # install what is missing
bash scripts/bootstrap-claude-plugins.sh --check    # report only, change nothing
```

Idempotent: verified across four consecutive runs. Runs 2–4 reported
`0 problems, exit 0` and made no changes. It never duplicates a marketplace,
plugin or MCP registration.

## Marketplaces and identifiers

| Marketplace | Source | Plugins |
|---|---|---|
| `claude-code-plugins` | `anthropics/claude-code` | `security-guidance`, `feature-dev`, `frontend-design` |
| `chrome-devtools-plugins` | `ChromeDevTools/chrome-devtools-mcp` | `chrome-devtools-mcp` |
| `impeccable` | `pbakaus/impeccable` | `impeccable` |
| `21st` | `21st-dev/claude-code-plugin` | `21st` |

```
security-guidance@claude-code-plugins
feature-dev@claude-code-plugins
frontend-design@claude-code-plugins
chrome-devtools-mcp@chrome-devtools-plugins
impeccable@impeccable
21st@21st
```

`21st` also needs the `21st` CLI (the bootstrap installs it from npm) and an
`API_KEY_21ST` variable in the cloud environment settings, plus network access
to `21st.dev`. The bootstrap reports a missing key as a problem rather than
failing silently.

## Default state — and why

| Plugin | Default | Reason |
|---|---|---|
| `impeccable` | **enabled** | The live driver for existing-UI work |
| `chrome-devtools-mcp` | **enabled** | Debugging/inspection layer |
| `feature-dev` | **enabled** | Engineering architecture; cheap |
| `21st` | **enabled** | Real components/themes via the 21st MCP + seven 21st skills |
| `security-guidance` | **disabled** | Its `Stop` hook runs an LLM diff review on every stop |
| `frontend-design` | **disabled** | A second automatic frontend conductor would compete with `frontend-design-skill` |

The bootstrap enforces these two disabled states on every run, so a later
`/plugin` session that enables one does not silently persist into new work.

### Enabling Anthropic `frontend-design`

Kept installed and inert. Enable deliberately when you want to compare its
approach:

```bash
claude plugin enable frontend-design@claude-code-plugins
# ... use it, then put the environment back:
claude plugin disable frontend-design@claude-code-plugins
```

While enabled, **two conductors are live**. `frontend-design-skill` remains the
primary owner for new frontend work; treat the Anthropic skill as a
second opinion, not a replacement.

## security-guidance — cost tiers

Its four hooks (`SessionStart`, `UserPromptSubmit`, `PostToolUse`, `Stop`) are
harness-only and add ~0 tokens to context, but the `Stop` hook invokes an LLM
diff review. On a site where most commits are CSS, that is spend for nothing.

| Tier | Work | Command | Cost |
|---|---|---|---|
| 1 | Normal visual/CSS | leave disabled (default) | none |
| 2 | Security-sensitive feature — auth, APIs, forms, DB, uploads, payments, webhooks, secrets, env vars, user input | `claude plugin enable security-guidance@claude-code-plugins` | per-diff LLM |
| 3 | Pre-production | enable, then `/security-review` | full agentic review |

Return to tier 1 afterwards:
```bash
claude plugin disable security-guidance@claude-code-plugins
```

## Impeccable hooks — opt-in per project

Impeccable's detector hook is **not** enabled by installing the plugin. Upstream
gates it per project behind an explicit command that writes `.impeccable/config.json`
and records consent:

```bash
/impeccable hooks status    # current state
/impeccable hooks on        # enable for THIS project
/impeccable hooks off       # disable
```

So Impeccable's skill and 23 commands are live by default while its hooks stay
off until you opt in — the posture we want, achieved by upstream design rather
than by us disabling anything.

## Chrome DevTools — known environment failure and its fallback

`claude plugin marketplace add ChromeDevTools/chrome-devtools-mcp` **fails in
managed cloud containers.** Diagnosed, not guessed:

```
Submodule 'devtools-frontend' registered for path 'third_party/devtools-frontend'
fatal: unable to access 'https://chromium.googlesource.com/chromium/src/build/':
       CONNECT tunnel failed, response 403
Failed to add marketplace: Failed to clone marketplace repository
```

The repository carries git submodules that recurse into `chromium.googlesource.com`,
which the agent proxy blocks. The clone dies, so the marketplace is never added.

The bootstrap detects **this specific condition** — matching `submodule`,
`googlesource` or `CONNECT tunnel failed` in the error — and only then falls
back to a submodule-free shallow clone added as a local path:

```bash
git clone --depth 1 --recurse-submodules=no --shallow-submodules \
  https://github.com/ChromeDevTools/chrome-devtools-mcp "$HOME/.claude-plugin-src/chrome-devtools-plugins"
claude plugin marketplace add "$HOME/.claude-plugin-src/chrome-devtools-plugins"
```

Any other error is **reported, not worked around** — a blanket fallback would
mask a typo or a removed repository.

Verified: this path installed `chrome-devtools-mcp@chrome-devtools-plugins`
v1.8.0 with all 7 skills, and the MCP guard confirmed a single registration.

### Exactly one MCP registration

Chrome DevTools' MCP server comes **from the plugin**. Never add it again by
hand. The bootstrap fails loudly if `chrome-devtools` appears more than once, or
if a project `.mcp.json` also registers it.

### Not yet verified: MCP registration in a fresh session

**Plugin installation and bootstrap behaviour are verified. MCP registration is
not.** Two honest reasons:

1. The session that installed the plugin predated its registration, so MCP
   servers were already resolved for that session.
2. On the following turn the server was reported as
   `plugin:chrome-devtools-mcp:chrome-devtools (CONNECT_TIMEOUT)` — it timed out
   after 30s rather than connecting.

`claude plugin details chrome-devtools-mcp` also reports `MCP servers (0)` even
though the plugin's `plugin.json` declares one.

**This must be re-tested in a fresh Claude Code cloud session.** Do not treat
Chrome DevTools MCP as confirmed working until `list_pages` or `navigate_page`
succeeds there. The 7 skills install correctly either way.

## Not installed on purpose

- **No code-simplifier plugin.** Claude Code's built-in `/simplify` is the
  supported route. Workflow: implement → test → visual QA → `/simplify` →
  test again → visual regression → security review.
- **No bare Chrome DevTools MCP entry.** The plugin owns it.
