#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# loop.sh — Alfred Email Loop Engineering
#
# Použití:
#   ./scripts/loop.sh                          # generuje/opravuje všechny emaily
#   ./scripts/loop.sh guest/05-reservation-cancel.html  # jen jeden email
#
# Co dělá:
#   1. Claude (proposer) opraví nebo dogeneruje email(y)
#   2. verify.mjs (verifier) zkontroluje výsledek — exit 0 nebo 1
#   3. Pokud PASS → git commit
#   4. Pokud FAIL → pošle Claudovi failure kontext a opakuje
#   5. Circuit breaker: max MAX_TURNS pokusů, pak abort
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MAX_TURNS=5
TARGET="${1:-}"          # volitelný: konkrétní email (relativní cesta od emails/)
LOG_FILE="$ROOT/.claude/loop.log"
mkdir -p "$ROOT/.claude"

# ── Barvy pro výstup ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

log() { echo -e "$1" | tee -a "$LOG_FILE"; }

# ── Sestavení goal promptu ────────────────────────────────────────────────────
if [ -n "$TARGET" ]; then
  SCOPE="emails/$TARGET"
  GOAL="Fix the Alfred email at $SCOPE so it passes all checks in verify.mjs.
Rules (from CLAUDE.md):
- table width=\"510\", font Inter, primary color #6F2F6A
- footer: 'Alfred powered by Previo'
- no PHP tags or \$variables — use [PLACEHOLDER] format
- no emoji, no external CSS
- Alfred speech bubble and avatar must be present
Read the current file, identify issues from the FAIL output below, fix them."
else
  SCOPE="all emails in emails/guest/ and emails/hotel/"
  GOAL="Review and fix all Alfred HTML emails so they pass verify.mjs.
Rules (from CLAUDE.md):
- table width=\"510\", font Inter, primary color #6F2F6A
- footer: 'Alfred powered by Previo'
- no PHP tags or \$variables — use [PLACEHOLDER] format
- no emoji, no external CSS
- Alfred speech bubble and avatar must be present in every email
Check each file and fix only what fails."
fi

# ── Loop ──────────────────────────────────────────────────────────────────────
TURN=0

log "\n$(date '+%Y-%m-%d %H:%M:%S') — Spouštím loop (max $MAX_TURNS kol)"
log "Scope: $SCOPE"

while [ $TURN -lt $MAX_TURNS ]; do
  TURN=$((TURN + 1))
  log "\n${YELLOW}═══ Kolo $TURN / $MAX_TURNS ═══${NC}"

  # ── Proposer: Claude opraví emaily ──
  log "→ Proposer (Claude)..."

  if [ $TURN -eq 1 ]; then
    PROMPT="$GOAL"
  else
    PROMPT="$GOAL

Předchozí pokus selhal. Výstup verify.mjs:
$FAIL_OUTPUT

Oprav jen soubory, které mají FAIL. Neměň to, co projde."
  fi

  if ! claude -p "$PROMPT" --dangerously-skip-permissions --output-format text 2>>"$LOG_FILE"; then
    log "${RED}Claude selhal. Zkouším znovu...${NC}"
    continue
  fi

  # ── Circuit breaker: stagnace ──
  if [ $TURN -gt 2 ]; then
    DIFF_LINES=$(git diff --stat HEAD 2>/dev/null | tail -1 || echo "")
    if echo "$DIFF_LINES" | grep -q "0 files changed\|nothing to commit"; then
      log "${RED}ABORT: Žádné změny po $TURN kolech — stagnace detekována.${NC}"
      log "Potřeba manuálního zásahu."
      exit 2
    fi
  fi

  # ── Verifier ──
  log "\n→ Verifier (verify.mjs)..."
  VERIFY_CMD="node scripts/verify.mjs"
  [ -n "$TARGET" ] && VERIFY_CMD="$VERIFY_CMD $TARGET"

  if FAIL_OUTPUT=$($VERIFY_CMD 2>&1); then
    # PASS
    echo "$FAIL_OUTPUT"
    log "\n${GREEN}PASS po $TURN kolech.${NC}"

    # git commit
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
      git add emails/
      git commit -m "loop: email fixes (turn $TURN)" --quiet
      log "${GREEN}Změny commitnuty.${NC}"
    else
      log "Žádné změny k commitnutí."
    fi

    log "Loop dokončen.\n"
    exit 0
  else
    # FAIL
    log "${RED}FAIL — spouštím kolo $((TURN + 1))...${NC}"
    echo "$FAIL_OUTPUT"
  fi
done

# ── Max turns dosaženo ────────────────────────────────────────────────────────
log "\n${RED}ABORT: Dosažen limit $MAX_TURNS kol bez úspěchu.${NC}"
log "Poslední chyby:\n$FAIL_OUTPUT"
log "Potřeba manuálního zásahu.\n"
exit 1
