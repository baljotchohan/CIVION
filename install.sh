#!/bin/bash

set -e

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                     CIVION INSTALLATION                                ║"
echo "║                     Universal Setup Script                             ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Python version
echo -e "${BLUE}Checking Python version...${NC}"
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 9 ]); then
    echo -e "${YELLOW}✗ Python 3.9+ required (found: $PYTHON_VERSION)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python $PYTHON_VERSION found${NC}"
echo ""

# Create virtual environment
echo -e "${BLUE}Creating virtual environment...${NC}"
if [ -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment already exists${NC}"
else
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi
echo ""

# Activate virtual environment
echo -e "${BLUE}Activating virtual environment...${NC}"
source venv/bin/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}"
echo ""

# Upgrade pip
echo -e "${BLUE}Upgrading pip, setuptools, wheel...${NC}"
pip install --quiet --upgrade pip setuptools wheel
echo -e "${GREEN}✓ Pip upgraded${NC}"
echo ""

# Install from requirements.txt
echo -e "${BLUE}Installing dependencies from requirements.txt...${NC}"
if [ -f "requirements.txt" ]; then
    pip install -q -r requirements.txt
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${YELLOW}requirements.txt not found, installing from setup.py${NC}"
    pip install -e .
    echo -e "${GREEN}✓ CIVION installed${NC}"
fi
echo ""

# Optional: Ask about LLM providers
echo -e "${BLUE}Installing optional LLM providers...${NC}"
read -p "Install Anthropic Claude support? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pip install -q anthropic
    echo -e "${GREEN}✓ Anthropic installed${NC}"
fi

read -p "Install OpenAI GPT support? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pip install -q openai
    echo -e "${GREEN}✓ OpenAI installed${NC}"
fi

read -p "Install Google Gemini support? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pip install -q google-generativeai
    echo -e "${GREEN}✓ Gemini installed${NC}"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ CIVION installation complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}Next steps:${NC}"
echo "1. Activate environment: source venv/bin/activate"
echo "2. Configure CIVION: civion onboard"
echo "3. Start server: civion start"
echo "4. Open browser: http://localhost:8000"
echo ""
