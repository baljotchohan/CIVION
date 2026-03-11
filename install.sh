#!/bin/bash

# CIVION Universal Installer - Mac & Linux
# Works on: macOS (Intel & Apple Silicon), Ubuntu, Debian, Fedora, CentOS, Raspberry Pi

set -e  # Exit on any error

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if running on supported system
check_system() {
    SYSTEM=$(uname -s)
    ARCH=$(uname -m)
    
    log_info "System: $SYSTEM ($ARCH)"
    
    case $SYSTEM in
        Darwin|Linux)
            log_success "Supported system detected"
            ;;
        *)
            log_error "Unsupported system: $SYSTEM"
            log_info "This script works on macOS and Linux"
            exit 1
            ;;
    esac
}

# Check Python version
check_python() {
    log_info "Checking Python version..."
    
    # Try python3 first (recommended)
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
    else
        log_error "Python not found"
        log_info "Install Python from https://www.python.org/downloads/"
        exit 1
    fi
    
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
    log_success "Python $PYTHON_VERSION found"
    
    # Check version is 3.9+
    MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
    MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)
    
    if [ "$MAJOR" -lt 3 ] || ([ "$MAJOR" -eq 3 ] && [ "$MINOR" -lt 9 ]); then
        log_error "Python 3.9+ required, found $PYTHON_VERSION"
        exit 1
    fi
}

# Check pip
check_pip() {
    log_info "Checking pip..."
    
    if $PYTHON_CMD -m pip --version &> /dev/null; then
        log_success "pip is installed"
    else
        log_error "pip not found"
        log_info "Run: $PYTHON_CMD -m ensurepip --default-pip"
        exit 1
    fi
}

# Install system dependencies (Mac only)
install_mac_dependencies() {
    if [ "$SYSTEM" = "Darwin" ]; then
        log_info "Checking for Homebrew..."
        
        if ! command -v brew &> /dev/null; then
            log_warning "Homebrew not found"
            log_info "Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        else
            log_success "Homebrew found"
        fi
        
        log_info "Installing Python 3.11 via Homebrew..."
        brew install python@3.11
        PYTHON_CMD="python3.11"
    fi
}

# Install system dependencies (Linux)
install_linux_dependencies() {
    if [ "$SYSTEM" = "Linux" ]; then
        log_info "Detecting Linux distribution..."
        
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            OS=$ID
        else
            log_error "Cannot detect Linux distribution"
            exit 1
        fi
        
        case $OS in
            ubuntu|debian)
                log_info "Installing dependencies for Ubuntu/Debian..."
                sudo apt-get update
                sudo apt-get install -y python3.11 python3.11-venv python3.11-dev build-essential git curl
                PYTHON_CMD="python3.11"
                ;;
            fedora)
                log_info "Installing dependencies for Fedora..."
                sudo dnf install -y python3.11 python3.11-devel gcc git
                PYTHON_CMD="python3.11"
                ;;
            rhel|centos)
                log_info "Installing dependencies for RHEL/CentOS..."
                sudo yum install -y python3 python3-devel gcc git
                PYTHON_CMD="python3"
                ;;
            *)
                log_warning "Unknown Linux distribution: $OS"
                log_info "Try installing: python3.11, python3.11-venv, python3.11-dev, build-essential"
                ;;
        esac
    fi
}

# Create virtual environment
create_venv() {
    log_info "Creating virtual environment..."
    
    if [ -d "venv" ]; then
        log_warning "venv already exists, skipping"
        return
    fi
    
    $PYTHON_CMD -m venv venv
    
    if [ -d "venv" ]; then
        log_success "Virtual environment created"
    else
        log_error "Failed to create virtual environment"
        exit 1
    fi
}

# Activate venv
activate_venv() {
    log_info "Activating virtual environment..."
    source venv/bin/activate
    log_success "Virtual environment activated"
}

# Upgrade pip
upgrade_pip() {
    log_info "Upgrading pip, setuptools, wheel..."
    python -m pip install --upgrade pip setuptools wheel
    log_success "pip upgraded"
}

# Install dependencies
install_dependencies() {
    log_info "Installing CIVION dependencies (this may take 2-5 minutes)..."
    python -m pip install -e .
    log_success "Dependencies installed"
}

# Create .env file
create_env_file() {
    if [ -f ".env" ]; then
        log_warning ".env already exists, skipping"
        return
    fi
    
    log_info "Creating .env configuration file..."
    
    cat > .env << 'EOF'
# CIVION Configuration
# Get your API key from https://console.anthropic.com/

LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-v1-YOUR-API-KEY-HERE
API_HOST=0.0.0.0
API_PORT=8000
DATABASE_URL=sqlite:///./civion.db
LOG_LEVEL=INFO

# Optional - for full functionality
GITHUB_TOKEN=
NEWSAPI_KEY=
EOF
    
    log_success ".env file created"
    log_warning "EDIT .env WITH YOUR API KEY!"
}

# Verify installation
verify_installation() {
    log_info "Verifying installation..."
    
    checks=(
        "FastAPI:import fastapi"
        "httpx:import httpx"
        "Pydantic:import pydantic"
        "Typer:import typer"
        "CIVION:from civion.engine.reasoning_loop import reasoning_engine"
    )
    
    for check in "${checks[@]}"; do
        name=${check%%:*}
        import=${check##*:}
        
        if python -c "$import" 2>/dev/null; then
            log_success "$name"
        else
            log_error "$name not found"
        fi
    done
}

# Print next steps
print_next_steps() {
    echo ""
    echo "============================================================"
    echo -e "${GREEN}✓ CIVION INSTALLATION COMPLETE${NC}"
    echo "============================================================"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo ""
    echo "1. Edit .env file with your API key:"
    echo "   nano .env"
    echo ""
    echo "2. Activate virtual environment (if not already activated):"
    echo "   source venv/bin/activate"
    echo ""
    echo "3. Start the server:"
    echo "   python -m civion.api.server"
    echo ""
    echo "4. In another terminal, test the CLI:"
    echo "   source venv/bin/activate"
    echo "   civion goal create \"Test Question\""
    echo ""
    echo -e "${YELLOW}Documentation:${NC}"
    echo "   See CIVION_UNIVERSAL_INSTALLATION_GUIDE.md"
    echo ""
    echo "============================================================"
    echo ""
}

# Main installation flow
main() {
    echo ""
    echo "============================================================"
    echo -e "${BLUE}CIVION Universal Installer${NC}"
    echo "============================================================"
    echo ""
    
    check_system
    check_python
    check_pip
    install_mac_dependencies
    install_linux_dependencies
    
    create_venv
    activate_venv
    upgrade_pip
    install_dependencies
    create_env_file
    verify_installation
    
    print_next_steps
}

# Run main
main "$@"
