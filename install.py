#!/usr/bin/env python3
"""
CIVION Universal Installer
Works on: Windows, Mac, Linux, Docker, Cloud
Purpose: Automated installation and setup
"""

import os
import sys
import subprocess
import platform
import shutil
from pathlib import Path

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

class CivionInstaller:
    def __init__(self):
        self.system = platform.system()
        self.python_version = sys.version_info
        self.project_root = Path.cwd()
        self.venv_path = self.project_root / "venv"
        
    def log(self, message, level="info"):
        """Print colored log messages"""
        if level == "success":
            print(f"{GREEN}✓ {message}{RESET}")
        elif level == "error":
            print(f"{RED}✗ {message}{RESET}")
        elif level == "warning":
            print(f"{YELLOW}⚠ {message}{RESET}")
        elif level == "info":
            print(f"{BLUE}ℹ {message}{RESET}")
    
    def check_python_version(self):
        """Verify Python 3.9+"""
        self.log(f"Checking Python version: {platform.python_version()}")
        
        if self.python_version.major < 3 or (self.python_version.major == 3 and self.python_version.minor < 9):
            self.log("Python 3.9+ required. Please upgrade.", "error")
            self.log("Download from: https://www.python.org/downloads/", "info")
            return False
        
        self.log(f"Python {self.python_version.major}.{self.python_version.minor} detected ✓", "success")
        return True
    
    def check_pip(self):
        """Verify pip is installed"""
        self.log("Checking pip installation...")
        
        try:
            result = subprocess.run([sys.executable, "-m", "pip", "--version"], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                self.log(result.stdout.strip(), "success")
                return True
        except:
            pass
        
        self.log("pip not found or broken", "error")
        return False
    
    def create_venv(self):
        """Create Python virtual environment"""
        self.log(f"Creating virtual environment at {self.venv_path}...")
        
        try:
            subprocess.run([sys.executable, "-m", "venv", str(self.venv_path)], 
                         check=True)
            self.log("Virtual environment created", "success")
            return True
        except subprocess.CalledProcessError as e:
            self.log(f"Failed to create venv: {e}", "error")
            return False
    
    def get_venv_python(self):
        """Get path to Python in venv"""
        if self.system == "Windows":
            return self.venv_path / "Scripts" / "python.exe"
        else:
            return self.venv_path / "bin" / "python"
    
    def get_pip_cmd(self):
        """Get pip command for this system"""
        venv_python = self.get_venv_python()
        return [str(venv_python), "-m", "pip"]
    
    def upgrade_pip(self):
        """Upgrade pip to latest"""
        self.log("Upgrading pip...")
        
        cmd = self.get_pip_cmd() + ["install", "--upgrade", "pip", "setuptools", "wheel"]
        
        try:
            subprocess.run(cmd, check=True)
            self.log("pip upgraded", "success")
            return True
        except subprocess.CalledProcessError as e:
            self.log(f"Failed to upgrade pip: {e}", "error")
            return False
    
    def install_dependencies(self):
        """Install project dependencies"""
        self.log("Installing CIVION dependencies (this may take 2-5 minutes)...")
        
        cmd = self.get_pip_cmd() + ["install", "-e", "."]
        
        try:
            subprocess.run(cmd, check=True)
            self.log("Dependencies installed successfully", "success")
            return True
        except subprocess.CalledProcessError as e:
            self.log(f"Failed to install dependencies: {e}", "error")
            return False
    
    def create_env_file(self):
        """Create .env configuration file"""
        env_file = self.project_root / ".env"
        
        if env_file.exists():
            self.log(".env file already exists, skipping creation")
            return True
        
        self.log("Creating .env configuration file...")
        
        env_content = """# CIVION Configuration
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
"""
        
        try:
            env_file.write_text(env_content)
            self.log(".env file created - EDIT WITH YOUR API KEY!", "warning")
            self.log(f"Location: {env_file}", "info")
            return True
        except Exception as e:
            self.log(f"Failed to create .env: {e}", "error")
            return False
    
    def verify_installation(self):
        """Verify all installations worked"""
        self.log("Verifying installation...")
        
        venv_python = self.get_venv_python()
        
        checks = [
            ("FastAPI", "import fastapi"),
            ("httpx", "import httpx"),
            ("Pydantic", "import pydantic"),
            ("Typer", "import typer"),
            ("CIVION", "from civion.engine.reasoning_loop import reasoning_engine"),
        ]
        
        all_passed = True
        
        for name, import_cmd in checks:
            try:
                result = subprocess.run(
                    [str(venv_python), "-c", import_cmd],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                if result.returncode == 0:
                    self.log(f"{name}", "success")
                else:
                    self.log(f"{name}: {result.stderr}", "error")
                    all_passed = False
            except Exception as e:
                self.log(f"{name}: {e}", "error")
                all_passed = False
        
        return all_passed
    
    def print_next_steps(self):
        """Print next steps for user"""
        print("\n" + "="*60)
        print(f"{GREEN}✓ CIVION INSTALLATION COMPLETE{RESET}")
        print("="*60)
        
        if self.system == "Windows":
            activate_cmd = f"{self.venv_path}\\Scripts\\activate.bat"
        else:
            activate_cmd = f"source {self.venv_path}/bin/activate"
        
        print(f"\n{BLUE}Next Steps:{RESET}")
        print(f"\n1. Edit .env file with your API key:")
        print(f"   nano .env  # or use your favorite editor")
        print(f"\n2. Activate virtual environment:")
        print(f"   {activate_cmd}")
        print(f"\n3. Start the server:")
        print(f"   python -m civion.api.server")
        print(f"\n4. In another terminal, test the CLI:")
        print(f"   {activate_cmd}")
        print(f"   civion goal create \"Test Question\"")
        print(f"\n{YELLOW}Documentation:{RESET}")
        print(f"   See CIVION_UNIVERSAL_INSTALLATION_GUIDE.md for detailed instructions")
        print(f"\n{BLUE}Support:{RESET}")
        print(f"   If something fails, check the error messages above")
        print("\n" + "="*60 + "\n")
    
    def run(self):
        """Run full installation"""
        print(f"\n{BLUE}{'='*60}")
        print(f"CIVION Universal Installer")
        print(f"System: {self.system}")
        print(f"Python: {platform.python_version()}")
        print(f"{'='*60}{RESET}\n")
        
        steps = [
            ("Checking Python version", self.check_python_version),
            ("Checking pip", self.check_pip),
            ("Creating virtual environment", self.create_venv),
            ("Upgrading pip", self.upgrade_pip),
            ("Installing dependencies", self.install_dependencies),
            ("Creating .env file", self.create_env_file),
            ("Verifying installation", self.verify_installation),
        ]
        
        for step_name, step_func in steps:
            print(f"\n{BLUE}▶ {step_name}...{RESET}")
            if not step_func():
                self.log(f"Installation failed at: {step_name}", "error")
                return False
        
        self.print_next_steps()
        return True

def main():
    """Main entry point"""
    try:
        installer = CivionInstaller()
        success = installer.run()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Installation cancelled by user{RESET}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{RED}Unexpected error: {e}{RESET}")
        sys.exit(1)

if __name__ == "__main__":
    main()
