#!/bin/sh
set -e

# CIVION Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/baljotchohan/CIVION/main/install.sh | sh

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "${CYAN}  ██████╗ ██╗ ██╗   ██╗ ██╗  ██████╗  ███╗  ██╗${NC}"
echo "${CYAN} ██╔════╝ ██║ ██║   ██║ ██║ ██╔═══██╗ ████╗ ██║${NC}"
echo "${CYAN} ██║      ██║ ╚██╗ ██╔╝ ██║ ██║   ██║ ██╔██╗██║${NC}"
echo "${CYAN} ╚██████╗ ██║  ╚██╔╝    ██║ ╚██████╔╝ ██║ ╚███║${NC}"
echo "${CYAN}  ╚═════╝ ╚═╝   ╚═╝     ╚═╝  ╚═════╝  ╚═╝  ╚══╝${NC}"
echo ""
echo "${CYAN}Personal AI Intelligence System${NC}"
echo ""

# Check Python version
PYTHON=$(command -v python3 || command -v python || echo "")
if [ -z "$PYTHON" ]; then
  echo "${RED}Error: Python 3.10+ is required but not found.${NC}"
  echo "Install Python: https://python.org/downloads"
  exit 1
fi

PY_VERSION=$($PYTHON -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
PY_MAJOR=$($PYTHON -c "import sys; print(sys.version_info.major)")
PY_MINOR=$($PYTHON -c "import sys; print(sys.version_info.minor)")

if [ "$PY_MAJOR" -lt 3 ] || ([ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 10 ]); then
  echo "${RED}Error: Python 3.10+ required. You have $PY_VERSION${NC}"
  exit 1
fi

echo "  ${GREEN}✓${NC} Python $PY_VERSION found"

# Try pipx first (preferred)
if command -v pipx > /dev/null 2>&1; then
  echo "  ${GREEN}✓${NC} pipx found — installing civion globally"
  pipx install civion
  INSTALLED_VIA="pipx"
else
  echo "  ${YELLOW}ℹ${NC}  pipx not found — trying pip install --user"
  $PYTHON -m pip install --user civion 2>/dev/null || \
    $PYTHON -m pip install civion --break-system-packages 2>/dev/null || \
    (echo "${RED}Error: pip install failed.${NC}" && \
     echo "Try: pipx install civion" && \
     echo "Get pipx: https://pipx.pypa.io" && exit 1)
  INSTALLED_VIA="pip"
fi

echo ""
echo "${GREEN}  ✓ civion installed successfully!${NC}"
echo ""
echo "  Next steps:"
echo ""
echo "    ${CYAN}civion setup${NC}    ← Configure your AI provider (2 min)"
echo "    ${CYAN}civion start${NC}    ← Launch the dashboard"
echo ""

if [ "$INSTALLED_VIA" = "pip" ]; then
  echo "  ${YELLOW}Note: If 'civion' command not found, add to PATH:${NC}"
  echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
  echo ""
fi

echo "  ${GREEN}Happy intelligence gathering! 🚀${NC}"
echo ""
