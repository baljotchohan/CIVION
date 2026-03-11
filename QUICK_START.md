# 🚀 **CIVION QUICK START - ONE COMMAND INSTALLATION**

---

## **Choose Your Platform & Run**

### **🪟 Windows 10/11**

```cmd
# 1. Open Command Prompt or PowerShell
# 2. Navigate to CIVION-main-4 folder
cd C:\Users\YourName\Downloads\CIVION-main-4

# 3. Run installer
python install.py

# OR

install.bat
```

**Expected output:** ✓ Installation complete in 3-5 minutes

---

### **🍎 Mac (Intel & Apple Silicon)**

```bash
# 1. Open Terminal
# 2. Navigate to CIVION-main-4
cd ~/Downloads/CIVION-main-4

# 3. Run installer
chmod +x install.sh
./install.sh

# OR use Python installer

python3 install.py
```

**Expected output:** ✓ Installation complete in 3-5 minutes

---

### **🐧 Linux (Ubuntu, Debian, Fedora, CentOS)**

```bash
# 1. Open Terminal
# 2. Navigate to CIVION-main-4
cd ~/Downloads/CIVION-main-4

# 3. Run installer
chmod +x install.sh
./install.sh

# OR

python3 install.py
```

**Expected output:** ✓ Installation complete in 3-5 minutes

---

### **🐳 Docker (Works Everywhere)**

```bash
# 1. Install Docker Desktop from https://www.docker.com/products/docker-desktop
# 2. Navigate to CIVION-main-4
cd ~/path/to/CIVION-main-4

# 3. Create Dockerfile
cat > Dockerfile << 'EOF'
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install -e .
EXPOSE 8000
CMD ["python", "-m", "civion.api.server"]
EOF

# 4. Build
docker build -t civion:latest .

# 5. Run
docker run -p 8000:8000 civion:latest
```

**Expected output:** ✓ Server running on http://localhost:8000

---

## **After Installation**

### **Get Your API Key (2 min)**

1. Go to https://console.anthropic.com/
2. Sign up (free)
3. Click "API Keys"
4. Create new key
5. Copy it

### **Edit .env File**

```bash
# Open .env
nano .env                    # Linux/Mac
# or
notepad .env                 # Windows
```

**Find this line and replace:**
```
ANTHROPIC_API_KEY=sk-ant-v1-YOUR-API-KEY-HERE
```

**With your actual key:**
```
ANTHROPIC_API_KEY=sk-ant-v1-xxxxxxxxxxxxx
```

### **Start Server**

```bash
# Terminal/PowerShell 1 (if venv not active)
source venv/bin/activate     # Mac/Linux
# or
venv\Scripts\activate        # Windows

# Run server
python -m civion.api.server
```

**Expected:** Server starts on http://0.0.0.0:8000

### **Test in New Terminal**

```bash
# Terminal/PowerShell 2
cd CIVION-main-4
source venv/bin/activate     # Mac/Linux
# or
venv\Scripts\activate        # Windows

# Create goal
civion goal create "Is AI trending?"

# See output
civion goal list

# Execute goal
civion goal execute GOAL_ID_FROM_ABOVE
```

**Expected:** Real agent analysis with confidence score

---

## **Verify It Works** (All 3 should succeed)

```bash
# 1. Server running?
curl http://localhost:8000/health

# 2. CLI working?
civion goal create "Test"

# 3. Real data?
civion goal list
```

✅ All three pass = Ready to use!

---

## **TROUBLESHOOTING QUICK FIXES**

| Problem | Fix |
|---------|-----|
| `python: command not found` | Install Python from python.org |
| `ModuleNotFoundError: civion` | Run `pip install -e .` again |
| `Port 8000 in use` | Kill process: `lsof -ti:8000 \| xargs kill -9` |
| `ANTHROPIC_API_KEY not set` | Edit .env with your key |
| Permission denied (Mac/Linux) | Run `chmod +x install.sh` first |
| `venv not activating` | Use full path: `source ./venv/bin/activate` |

---

## **What's Included**

✅ Real agents (GitHub, arXiv, NewsAPI)
✅ Reasoning engine
✅ REST API
✅ CLI tool
✅ WebSocket real-time events
✅ SQLite database
✅ Configuration system
✅ Error handling
✅ Test suite

---

## **Files You Have**

```
CIVION-main-4/
├── install.py           ← Use this (all platforms)
├── install.sh           ← Use this (Mac/Linux)
├── install.bat          ← Use this (Windows)
├── .env                 ← Edit with API key
├── civion/              ← Main code
│   ├── agents/          ← Real agents
│   ├── api/             ← REST routes
│   ├── engine/          ← Reasoning
│   └── cli/             ← Command line
├── tests/               ← Test suite
└── pyproject.toml       ← Dependencies
```

---

## **Environment Variables (Optional but Useful)**

```
LLM_PROVIDER=anthropic           # AI provider
ANTHROPIC_API_KEY=sk-ant-...     # API key (REQUIRED)
API_HOST=0.0.0.0                 # Server host
API_PORT=8000                    # Server port
DATABASE_URL=sqlite:///civion.db  # Database
LOG_LEVEL=INFO                   # Log level
GITHUB_TOKEN=                    # Optional
NEWSAPI_KEY=                     # Optional
```

---

## **Common Commands**

```bash
# Activate environment
source venv/bin/activate      # Mac/Linux
venv\Scripts\activate         # Windows

# Start server
python -m civion.api.server

# Create goal
civion goal create "Your question"

# List goals
civion goal list

# Execute goal
civion goal execute GOAL_ID

# View logs
tail -50 civion.log           # Mac/Linux
type civion.log | tail -50    # Windows

# Run tests
pytest tests/ -v

# Deactivate venv
deactivate
```

---

## **Platform Notes**

### **Windows**
- Use `venv\Scripts\activate.bat` (Command Prompt)
- Or `venv\Scripts\Activate.ps1` (PowerShell)
- If PowerShell fails: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force`

### **Mac**
- Intel: Works as-is
- Apple Silicon (M1/M2/M3): Works as-is (auto-detected)

### **Linux**
- Ubuntu/Debian: Full support
- Fedora/CentOS: Full support
- Raspberry Pi: Works (slower, 30 min install)

### **Docker**
- Works on any OS with Docker
- No Python install needed
- Slower startup but guaranteed to work

---

## **INSTALLATION SUMMARY**

| Step | Time | What It Does |
|------|------|--------------|
| Download | 1 min | Get code |
| Run installer | 5 min | Install dependencies |
| Edit .env | 2 min | Add API key |
| Start server | 1 min | Run API |
| Test CLI | 1 min | Verify working |
| **TOTAL** | **10 min** | **Ready to use** |

---

## **Need Help?**

### **If installer fails:**

1. Check Python version: `python --version`
2. Copy the error message
3. Search in CIVION_UNIVERSAL_INSTALLATION_GUIDE.md

### **If running fails:**

1. Check server is running (Terminal 1)
2. Check venv is activated (Terminal 2)
3. Check .env has API key
4. Run: `python -c "from civion.engine.reasoning_loop import reasoning_engine; print('OK')"`

### **If CLI doesn't work:**

```bash
# Make sure you're in the right folder
pwd  # or cd on Windows

# Make sure venv is activated
which python  # Should show venv path

# Make sure server is running
curl http://localhost:8000/health
```

---

## **NEXT STEPS AFTER INSTALLATION**

✅ Create intelligence goals
✅ Watch AI agents analyze
✅ See real-time confidence growth
✅ Deploy to production
✅ Scale globally

---

## **You're Ready! 🚀**

```bash
# Last step:
source venv/bin/activate
python -m civion.api.server

# In another terminal:
civion goal create "Is quantum computing changing AI?"
```

**Everything works seamlessly on your device.** ✓

---

**Installation Time:** 10 minutes
**Supported Devices:** Windows, Mac, Linux, Docker, Cloud
**Support:** All instructions in CIVION_UNIVERSAL_INSTALLATION_GUIDE.md
