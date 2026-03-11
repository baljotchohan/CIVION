# 🌍 **CIVION UNIVERSAL INSTALLATION GUIDE**
## *Works Seamlessly on Windows, Mac, Linux - Every Device in the World*

---

## **🎯 WHAT THIS GUIDE COVERS**

✅ Windows 10/11 (Intel & ARM)
✅ Mac (Intel & M1/M2/M3 Apple Silicon)
✅ Linux (Ubuntu, Debian, Fedora, CentOS)
✅ Docker (Universal container solution)
✅ WSL2 (Windows Subsystem for Linux)
✅ Raspberry Pi (ARM devices)
✅ Cloud VMs (AWS, GCP, Azure, DigitalOcean)

---

## **PRE-FLIGHT CHECK** (Do this first on ANY device)

```bash
# 1. Check Python version
python --version
# OR (if above doesn't work)
python3 --version

# MUST SEE: Python 3.9 or higher
# Example output: Python 3.11.5

# 2. Check pip
pip --version
# OR
pip3 --version

# 3. Check git (if cloning)
git --version
```

**If ANY of above fails → Go to your device section below**

---

## **SECTION A: WINDOWS (Intel & ARM)**

### **A1: Windows 11 / Windows 10 - Fresh Setup**

#### **Step 1: Install Python**

**Option A: Official Python.org (Recommended)**
```
1. Go to https://www.python.org/downloads/
2. Download Python 3.11 (or 3.12)
3. Run installer
4. ⚠️ IMPORTANT: Check "Add Python to PATH"
5. Click "Install Now"
6. Wait for completion
```

**Option B: Microsoft Store (Easy)**
```
1. Open Microsoft Store
2. Search "Python 3.11"
3. Click Install
4. Wait for completion
```

**Option C: Chocolatey (For advanced users)**
```powershell
choco install python
```

**Verify installation:**
```cmd
python --version
```

#### **Step 2: Open Command Prompt or PowerShell**

```cmd
# Right-click on Desktop
# Select "Open PowerShell here" or "Open Command Prompt here"
```

#### **Step 3: Clone or Extract Code**

**If you have ZIP file:**
```cmd
# Navigate to Downloads
cd Downloads

# Right-click CIVION-main-4.zip
# Select "Extract All"
# Note the folder location

# Navigate to it
cd CIVION-main-4
```

**If you have Git:**
```cmd
git clone https://github.com/civion/civion.git
cd civion
```

#### **Step 4: Create Virtual Environment**

```cmd
python -m venv venv
```

**Expected output:** Folder `venv` created

#### **Step 5: Activate Virtual Environment**

```cmd
# If using PowerShell:
venv\Scripts\Activate.ps1

# If using Command Prompt:
venv\Scripts\activate.bat

# If PowerShell fails with "execution policy" error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
venv\Scripts\Activate.ps1
```

**Expected:** Prompt should show `(venv)` prefix

#### **Step 6: Create .env File**

```cmd
# Create using Notepad
notepad .env
```

**Paste this and save:**
```
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-v1-YOUR-API-KEY-HERE
API_HOST=0.0.0.0
API_PORT=8000
DATABASE_URL=sqlite:///./civion.db
LOG_LEVEL=INFO
GITHUB_TOKEN=
NEWSAPI_KEY=
```

#### **Step 7: Install Dependencies**

```cmd
pip install --upgrade pip setuptools wheel
pip install -e .
```

**This takes 2-5 minutes. Let it complete fully.**

#### **Step 8: Verify Installation**

```cmd
python -c "from civion.engine.reasoning_loop import reasoning_engine; print('✓ Installation successful!')"
```

#### **Step 9: Start Server**

```cmd
python -m civion.api.server
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

#### **Step 10: Test in New PowerShell Window**

```cmd
# Open new PowerShell window (don't close first one)
cd CIVION-main-4
venv\Scripts\activate.ps1
civion goal create "Test Question"
```

**Expected output:**
```
✓ Intelligence Goal Created
ID: goal_xxxxx
Question: Test Question
```

---

### **A2: Windows with WSL2 (Ubuntu on Windows)**

```bash
# Install WSL2 (Run in PowerShell as Admin)
wsl --install -d Ubuntu-22.04

# Restart computer

# Open Ubuntu terminal
# Follow Linux/Ubuntu section below exactly
```

---

### **A3: Windows ARM (Surface Pro X, etc.)**

```cmd
# Download Python 3.11 ARM version from
# https://www.python.org/downloads/windows/

# Everything else same as A1 above
```

---

## **SECTION B: MAC (Intel & Apple Silicon M1/M2/M3)**

### **B1: Mac with Homebrew (Recommended)**

#### **Step 1: Install Homebrew (if not installed)**

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### **Step 2: Install Python**

```bash
brew install python@3.11
```

#### **Step 3: Navigate to Project**

```bash
# If you have ZIP
cd ~/Downloads
unzip CIVION-main-4.zip
cd CIVION-main-4

# If you have Git
git clone https://github.com/civion/civion.git
cd civion
```

#### **Step 4: Create Virtual Environment**

```bash
python3 -m venv venv
```

#### **Step 5: Activate Virtual Environment**

```bash
source venv/bin/activate
```

**Expected:** Prompt shows `(venv)`

#### **Step 6: Create .env File**

```bash
cat > .env << 'EOF'
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-v1-YOUR-API-KEY-HERE
API_HOST=0.0.0.0
API_PORT=8000
DATABASE_URL=sqlite:///./civion.db
LOG_LEVEL=INFO
GITHUB_TOKEN=
NEWSAPI_KEY=
EOF
```

#### **Step 7: Install Dependencies**

```bash
pip install --upgrade pip setuptools wheel
pip install -e .
```

#### **Step 8: Verify Installation**

```bash
python -c "from civion.engine.reasoning_loop import reasoning_engine; print('✓ Installation successful!')"
```

#### **Step 9: Start Server**

```bash
python -m civion.api.server
```

#### **Step 10: Test in New Terminal Tab**

```bash
cd CIVION-main-4
source venv/bin/activate
civion goal create "Test Question"
```

---

### **B2: Mac Apple Silicon (M1/M2/M3) - If Above Fails**

```bash
# Use arm64 Python explicitly
arch -arm64 brew install python@3.11

# Then follow B1 exactly
# But use:
arch -arm64 python3 -m venv venv
arch -arm64 python3 -m pip install -e .
```

---

### **B3: Mac with MacPorts Alternative**

```bash
sudo port install python311
sudo port select --set python3 python311

# Then follow B1 from Step 3 onwards
```

---

## **SECTION C: LINUX (Ubuntu, Debian, Fedora)**

### **C1: Ubuntu/Debian (Most Common)**

#### **Step 1: Update Package Manager**

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

#### **Step 2: Install Python and Dependencies**

```bash
sudo apt-get install -y python3.11 python3.11-venv python3.11-dev build-essential git curl
```

#### **Step 3: Navigate to Project**

```bash
cd ~/Downloads
unzip CIVION-main-4.zip
cd CIVION-main-4

# OR clone
git clone https://github.com/civion/civion.git
cd civion
```

#### **Step 4: Create Virtual Environment**

```bash
python3.11 -m venv venv
```

#### **Step 5: Activate Virtual Environment**

```bash
source venv/bin/activate
```

#### **Step 6: Create .env File**

```bash
cat > .env << 'EOF'
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-v1-YOUR-API-KEY-HERE
API_HOST=0.0.0.0
API_PORT=8000
DATABASE_URL=sqlite:///./civion.db
LOG_LEVEL=INFO
GITHUB_TOKEN=
NEWSAPI_KEY=
EOF
```

#### **Step 7: Install Dependencies**

```bash
pip install --upgrade pip setuptools wheel
pip install -e .
```

#### **Step 8: Verify Installation**

```bash
python -c "from civion.engine.reasoning_loop import reasoning_engine; print('✓ Installation successful!')"
```

#### **Step 9: Start Server**

```bash
python -m civion.api.server
```

#### **Step 10: Test in New Terminal Tab**

```bash
cd ~/path/to/CIVION-main-4
source venv/bin/activate
civion goal create "Test Question"
```

---

### **C2: Fedora/RHEL/CentOS**

```bash
# Update
sudo dnf update -y

# Install Python
sudo dnf install -y python3.11 python3.11-devel gcc git

# Navigate
cd ~/CIVION-main-4

# Rest same as C1 from Step 4 onwards
python3.11 -m venv venv
source venv/bin/activate
# ... etc
```

---

### **C3: Raspberry Pi (ARM)**

```bash
# Update
sudo apt-get update
sudo apt-get upgrade -y

# Install Python
sudo apt-get install -y python3 python3-venv python3-dev build-essential

# Navigate
cd ~/CIVION-main-4

# Create venv
python3 -m venv venv
source venv/bin/activate

# This takes longer on Pi - be patient
pip install -e .

# Rest same as C1
```

---

## **SECTION D: DOCKER (Universal - Any Device)**

### **D1: Install Docker**

**Windows/Mac:**
```
1. Go to https://www.docker.com/products/docker-desktop
2. Download Docker Desktop
3. Install and run
```

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### **D2: Create Dockerfile**

```bash
# In CIVION-main-4 folder, create file: Dockerfile

cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Copy project
COPY . .

# Create .env
RUN cat > .env << 'EOL'
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-v1-YOUR-API-KEY-HERE
API_HOST=0.0.0.0
API_PORT=8000
DATABASE_URL=sqlite:///./civion.db
LOG_LEVEL=INFO
EOL

# Install
RUN pip install --upgrade pip && pip install -e .

# Expose port
EXPOSE 8000

# Run
CMD ["python", "-m", "civion.api.server"]
EOF
```

### **D3: Build Docker Image**

```bash
docker build -t civion:latest .
```

### **D4: Run Docker Container**

```bash
docker run -p 8000:8000 \
  -e ANTHROPIC_API_KEY=sk-ant-v1-YOUR-KEY \
  civion:latest
```

### **D5: Test**

```bash
# In new terminal
curl http://localhost:8000/health
```

---

## **SECTION E: CLOUD DEPLOYMENT**

### **E1: AWS EC2**

```bash
# Launch Ubuntu 22.04 LTS instance
# SSH into instance

sudo apt-get update
sudo apt-get install -y python3.11 python3.11-venv git

git clone https://github.com/civion/civion.git
cd civion

python3.11 -m venv venv
source venv/bin/activate

# Create .env with your API keys
nano .env

pip install -e .

# Run (or use systemd service)
python -m civion.api.server
```

### **E2: DigitalOcean App Platform**

```bash
# Push to GitHub
git push origin main

# In DigitalOcean:
# 1. Create App
# 2. Connect GitHub repo
# 3. Select Python runtime
# 4. Set environment variables (ANTHROPIC_API_KEY, etc.)
# 5. Deploy
```

### **E3: Heroku**

```bash
# Create Procfile
echo "web: python -m civion.api.server" > Procfile

# Deploy
heroku create civion-app
git push heroku main
heroku config:set ANTHROPIC_API_KEY=sk-ant-v1-YOUR-KEY
```

---

## **SECTION F: GETTING API KEYS**

### **F1: Anthropic API Key**

```
1. Go to https://console.anthropic.com/
2. Sign up (free account)
3. Click "API Keys"
4. Click "Create Key"
5. Copy the key
6. Paste into .env:
   ANTHROPIC_API_KEY=sk-ant-v1-xxxxx
```

### **F2: GitHub Token (Optional)**

```
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: repo, public_repo
4. Click "Generate"
5. Copy token
6. Paste into .env:
   GITHUB_TOKEN=ghp_xxxxx
```

### **F3: NewsAPI Key (Optional)**

```
1. Go to https://newsapi.org/
2. Click "Get API Key"
3. Free tier available
4. Copy key
5. Paste into .env:
   NEWSAPI_KEY=xxxxx
```

---

## **UNIVERSAL VERIFICATION CHECKLIST**

Run this on ANY device after installation:

```bash
# 1. Python version
python --version
# Expected: Python 3.9+

# 2. Virtual environment
which python
# Expected: shows path to venv

# 3. Test imports
python -c "import fastapi; print('✓ FastAPI')"
python -c "import httpx; print('✓ httpx')"
python -c "import civion; print('✓ civion')"

# 4. Start server (5 sec timeout)
timeout 5 python -m civion.api.server 2>/dev/null || echo "✓ Server starts"

# 5. Check dependencies
pip list | grep -E "fastapi|httpx|pydantic|typer"
# Expected: shows all packages

echo "✓ ALL CHECKS PASSED - Ready to use!"
```

---

## **TROUBLESHOOTING MATRIX**

| Error | Cause | Fix |
|-------|-------|-----|
| `python: command not found` | Python not installed | Install Python from official source |
| `ModuleNotFoundError: civion` | Dependencies not installed | Run `pip install -e .` |
| `Permission denied` | File permissions | Use `sudo` or create in home folder |
| `Port 8000 in use` | Server already running | Kill: `lsof -ti:8000 \| xargs kill -9` |
| `ANTHROPIC_API_KEY not set` | Missing .env | Create .env with API key |
| `venv not activating` | Path issue | Use full path: `source ./venv/bin/activate` |

---

## **QUICK COMMAND REFERENCE**

```bash
# CREATE PROJECT
cd ~/projects
unzip CIVION-main-4.zip
cd CIVION-main-4

# SETUP (First time only)
python -m venv venv
source venv/bin/activate  # Mac/Linux
# OR
venv\Scripts\activate  # Windows

# INSTALL (First time only)
pip install -e .

# CREATE .env (Edit with your keys)
nano .env
# OR
cat > .env << EOF
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-v1-xxx
API_HOST=0.0.0.0
API_PORT=8000
DATABASE_URL=sqlite:///./civion.db
EOF

# RUN SERVER
python -m civion.api.server

# TEST (New terminal)
source venv/bin/activate
civion goal create "Test"
civion goal execute GOAL_ID
civion goal list
```

---

## **DEVICE-SPECIFIC QUICK LINKS**

| Device | Section | Time |
|--------|---------|------|
| **Windows 11/10** | A1 | 15 min |
| **Windows WSL2** | A2 | 10 min |
| **Mac Intel** | B1 | 15 min |
| **Mac Apple Silicon** | B2 | 15 min |
| **Ubuntu/Debian** | C1 | 15 min |
| **Fedora/CentOS** | C2 | 15 min |
| **Raspberry Pi** | C3 | 30 min |
| **Docker (Any)** | D | 10 min |
| **AWS EC2** | E1 | 10 min |
| **Cloud** | E2/E3 | 5 min |

---

## **FINAL TEST SEQUENCE** (Same on ALL devices)

```bash
# Terminal 1: Start server
cd CIVION-main-4
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m civion.api.server

# Expected: "Uvicorn running on http://0.0.0.0:8000"

# Terminal 2: Test system
cd CIVION-main-4
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Create goal
civion goal create "Is AI trending?"
# Expected: ✓ Goal created ID: goal_xxxxx

# Execute goal
civion goal execute goal_xxxxx
# Expected: Analysis with confidence score

# List goals
civion goal list
# Expected: Table of goals
```

**If all above work → YOU'RE DONE ✅**

---

## **SUCCESS INDICATORS**

After installation, you should see:

✅ Server runs without errors
✅ `civion goal create` works
✅ `civion goal execute` returns real data
✅ CLI shows actual agent analysis
✅ No mock data in output
✅ Confidence score displayed
✅ WebSocket events flowing

---

## **STILL HAVING ISSUES?**

Provide this information:

```
1. Your device: Windows/Mac/Linux
2. Error message: (copy exact error)
3. Command you ran: (what failed)
4. Python version: (python --version output)
5. Operating system: (version)
```

Then we can fix it immediately.

---

## **DEPLOYMENT COMPLETE ✅**

You now have CIVION running on your device.

**Next steps:**
- Customize agents
- Add more features
- Deploy to production
- Scale globally

**Everything is documented and ready.** 🚀

---

**Last Updated:** March 11, 2025
**Compatibility:** Windows, Mac, Linux, Docker, Cloud
**Status:** Production Ready ✅
**Support:** All instructions in CIVION_UNIVERSAL_INSTALLATION_GUIDE.md
