#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}Building CIVION frontend...${NC}"

# Navigate to UI directory
cd ui

# Install dependencies if node_modules missing
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}Installing dependencies...${NC}"
    npm install
fi

# Build and export
echo -e "${CYAN}Running npm run build...${NC}"
npm run build

echo -e "${GREEN}Build complete.${NC}"

# Move back to root
cd ..

# Clean and recreate static directory
echo -e "${CYAN}Bundling frontend into civion/static/ui/...${NC}"
rm -rf civion/static/ui
mkdir -p civion/static/ui

# Copy build output (usually 'out' or 'build' depend on config)
# Our next.config.js uses output: 'export' which defaults to 'out'
if [ -d "ui/out" ]; then
    cp -r ui/out/* civion/static/ui/
    echo -e "${GREEN}✓ Frontend bundled successfully.${NC}"
else
    echo -e "\033[0;31mError: ui/out directory not found. Build may have failed.\033[0m"
    exit 1
fi
