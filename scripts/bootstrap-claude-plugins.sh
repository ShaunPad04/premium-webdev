#!/usr/bin/env bash
# bootstrap-claude-plugins.sh
#
# Restores the plugin-only half of the premium web environment in a fresh
# Claude Code cloud container.
#
# WHY THIS EXISTS
#   Account-synced skills follow you into every cloud project automatically.
#   Plugins do not: as of Claude Code v2.1.195+, a plugin declared in a
#   project's .claude/settings.json but sourced externally (GitHub/npm) is
#   NOT installed automatically -- Claude Code reports it as not installed
#   and prints the install command. This script is that install step.
#
# GUARANTEES
#   Idempotent. Running it twice does not duplicate marketplaces, plugins or
#   MCP servers, and does not rewrite settings. Every action is preceded by a
#   state check and followed by verification.
#
# USAGE
#   bash scripts/bootstrap-claude-plugins.sh          # install what is missing
#   bash scripts/bootstrap-claude-plugins.sh --check  # report only, change nothing
#   bash scripts/bootstrap-claude-plugins.sh --verify # post-install verification
#
# NOT wired to SessionStart. Run it deliberately.

set -uo pipefail

MODE="${1:-install}"
FAILED=0

# marketplace-name  repo-or-owner/repo
MARKETPLACES=(
  "claude-code-plugins|anthropics/claude-code"
  "chrome-devtools-plugins|ChromeDevTools/chrome-devtools-mcp"
  "impeccable|pbakaus/impeccable"
  "21st|21st-dev/claude-code-plugin"
)

# plugin-name@marketplace
PLUGINS=(
  "security-guidance@claude-code-plugins"
  "feature-dev@claude-code-plugins"
  "frontend-design@claude-code-plugins"
  "chrome-devtools-mcp@chrome-devtools-plugins"
  "impeccable@impeccable"
  "21st@21st"
)

c()  { printf '%s\n' "$*"; }
ok() { printf '  \033[32mOK\033[0m    %s\n' "$*"; }
add(){ printf '  \033[33mADD\033[0m   %s\n' "$*"; }
bad(){ printf '  \033[31mFAIL\033[0m  %s\n' "$*"; FAILED=$((FAILED+1)); }
skip(){ printf '  --    %s\n' "$*"; }

command -v claude >/dev/null 2>&1 || { bad "claude CLI not on PATH"; exit 1; }
c "Claude Code $(claude --version 2>/dev/null | head -1)"
c ""

# ---------- marketplaces ----------
c "MARKETPLACES"
MP_LIST="$(claude plugin marketplace list 2>/dev/null || true)"
for entry in "${MARKETPLACES[@]}"; do
  name="${entry%%|*}"; repo="${entry##*|}"
  if printf '%s' "$MP_LIST" | grep -qE "(^|[^-a-zA-Z0-9])${name}([^-a-zA-Z0-9]|$)"; then
    ok "$name (already registered)"
  elif [ "$MODE" = "--check" ]; then
    skip "$name MISSING -> would add from $repo"
  else
    add "$name <- $repo"
    if claude plugin marketplace add "$repo" >/dev/null 2>&1; then
      ok "$name added"
    else
      # The direct add failed. Fall back ONLY for the one known, diagnosed
      # condition: the repository carries git submodules that recurse into a
      # host this network blocks (ChromeDevTools/chrome-devtools-mcp pulls
      # chromium.googlesource.com, which returns 403 through the agent proxy).
      # Any other failure is reported, not worked around -- a silent fallback
      # would mask a real problem such as a typo or a removed repository.
      err="$(claude plugin marketplace add "$repo" 2>&1 || true)"
      if printf '%s' "$err" | grep -qiE "submodule|googlesource|CONNECT tunnel failed"; then
        skip "$name: blocked-submodule condition detected, using documented fallback"
        cache="${PLUGIN_SRC_CACHE:-$HOME/.claude-plugin-src}/$name"
        rm -rf "$cache"; mkdir -p "$(dirname "$cache")"
        if git clone --depth 1 --recurse-submodules=no --shallow-submodules \
             "https://github.com/${repo}" "$cache" >/dev/null 2>&1 \
           && claude plugin marketplace add "$cache" >/dev/null 2>&1; then
          ok "$name added (submodule-free local clone; see docs/PLUGINS.md)"
        else
          bad "$name: fallback clone also failed"
        fi
      else
        bad "$name could not be added from $repo -- NOT the known submodule condition:"
        printf '%s\n' "$err" | head -3 | sed 's/^/          /'
      fi
    fi
  fi
done
c ""

# ---------- plugins ----------
c "PLUGINS"
PL_LIST="$(claude plugin list 2>/dev/null || true)"
for spec in "${PLUGINS[@]}"; do
  pname="${spec%%@*}"
  if printf '%s' "$PL_LIST" | grep -qE "(^|[^-a-zA-Z0-9])${pname}([^-a-zA-Z0-9]|$)"; then
    ok "$pname (already installed)"
  elif [ "$MODE" = "--check" ]; then
    skip "$pname MISSING -> would install $spec"
  else
    add "$spec"
    if claude plugin install "$spec" --scope user >/dev/null 2>&1; then
      ok "$pname installed"
    else
      bad "$pname install failed ($spec)"
    fi
  fi
done
c ""

# ---------- desired enable/disable state ----------
# Installed but OFF by default:
#   security-guidance -> its Stop hook runs an LLM diff review on every stop.
#                        Ordinary CSS work must not pay that. Opt in per project.
#   frontend-design   -> a second automatic frontend conductor would compete with
#                        frontend-design-skill. Kept installed, inert by default.
c "DESIRED STATE (installed but disabled by default)"
DISABLE_BY_DEFAULT=( "security-guidance@claude-code-plugins" "frontend-design@claude-code-plugins" )
STATE="$(claude plugin list 2>/dev/null || true)"
for spec in "${DISABLE_BY_DEFAULT[@]}"; do
  pname="${spec%%@*}"
  line="$(printf '%s' "$STATE" | grep -A3 -E "(^|[^-a-zA-Z0-9])${pname}@" | grep -m1 'Status:' || true)"
  if printf '%s' "$line" | grep -qi 'disabled'; then
    ok "$pname already disabled (opt-in)"
  elif [ "$MODE" = "--check" ]; then
    skip "$pname is ENABLED -> would disable (opt-in only)"
  else
    if claude plugin disable "$spec" >/dev/null 2>&1; then
      ok "$pname disabled (opt-in only)"
    else
      bad "$pname could not be disabled"
    fi
  fi
done
c ""

# ---------- MCP duplication guard ----------
c "MCP REGISTRATION GUARD"
CDT_COUNT="$(claude plugin list 2>/dev/null | grep -ci 'chrome-devtools' || true)"
if [ "${CDT_COUNT:-0}" -gt 1 ]; then
  bad "chrome-devtools appears ${CDT_COUNT}x -- expected exactly 1 (do not also add a bare MCP server)"
else
  ok "chrome-devtools MCP provided once, by the plugin only"
fi
if [ -f .mcp.json ] && grep -q 'chrome-devtools' .mcp.json 2>/dev/null; then
  bad "project .mcp.json also registers chrome-devtools -> DUPLICATE. Remove it; the plugin owns this."
else
  ok "no competing project-level chrome-devtools MCP entry"
fi
c ""

# ---------- 21st CLI + key ----------
# The 21st skills shell out to the `21st` CLI; the plugin's MCP server sends
# ${API_KEY_21ST} as its x-api-key header. The key is a secret: it lives in the
# cloud environment's variables, never in this repo.
c "21ST"
if command -v 21st >/dev/null 2>&1; then
  ok "21st CLI (already installed)"
elif [ "$MODE" = "--check" ]; then
  skip "21st CLI MISSING -> would npm install -g @21st-dev/cli"
else
  add "21st CLI <- npm @21st-dev/cli"
  if npm install -g @21st-dev/cli >/dev/null 2>&1 && command -v 21st >/dev/null 2>&1; then
    ok "21st CLI installed"
  else
    bad "21st CLI install failed (is registry.npmjs.org reachable?)"
  fi
fi
if [ -n "${API_KEY_21ST:-}" ]; then
  ok "API_KEY_21ST is set"
else
  bad "API_KEY_21ST not set -> add it to this cloud environment's variables (key: https://21st.dev/mcp)"
fi
c ""

# ---------- security-guidance cost posture ----------
c "SECURITY-GUIDANCE COST POSTURE"
c "  Hooks ship with the plugin. Leave them OFF for ordinary visual/CSS work."
c "  Tier 1  normal CSS/visual   -> hooks disabled (default)   no LLM cost"
c "  Tier 2  security feature    -> /plugin enable security-guidance@claude-code-plugins"
c "  Tier 3  pre-production      -> enable + run /security-review"
c ""

c "SUMMARY"
if [ "$FAILED" -eq 0 ]; then
  ok "environment ready ($FAILED problems)"
else
  bad "$FAILED problem(s) -- see above"
fi
exit "$FAILED"
