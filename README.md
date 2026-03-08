# civion

**Personal AI intelligence system.** Watch multiple AI agents 
debate, reason, and build confidence scores in real time — 
all running locally on your machine.

[![PyPI](https://img.shields.io/pypi/v/civion)](https://pypi.org/project/civion/)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue)](https://python.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## Install

**Recommended — pipx (global install, no conflicts):**
```bash
pipx install civion
```

**Standard pip:**
```bash
pip install civion
```

**With all AI providers:**
```bash
pip install "civion[all-providers]"
```

> **Need pipx?**  
> macOS: `brew install pipx`  
> Ubuntu/Debian: `sudo apt install pipx`  
> Windows: `pip install pipx`

---

## Quick start
```bash
# 1. Set up your AI provider and profile (one time)
civion setup

# 2. Start the dashboard
civion start
```

Opens at **http://localhost:8000** — NICK greets you and 
walks you through everything.

---

## Commands

| Command | What it does |
|---|---|
| `civion setup` | Configure AI provider, API keys, your profile |
| `civion start` | Start dashboard + backend |
| `civion stop` | Stop running instance |
| `civion status` | Check what's running |
| `civion doctor` | Diagnose problems |
| `civion logs` | View logs |
| `civion logs -f` | Follow logs live |
| `civion update` | Update to latest version |
| `civion reset` | Clear configuration |
| `civion agent list` | List agents (server must be running) |
| `civion agent start <name>` | Start a specific agent |
| `civion config show` | Show current config |
| `civion config add-key <provider> <key>` | Add API key |

---

## AI Providers

civion works with 12 providers. One API key is all you need.

| Provider | Install | Free? |
|---|---|---|
| **Ollama** (local, private) | `pip install "civion[ollama]"` | ✅ Free |
| **Anthropic** (Claude) | `pip install "civion[anthropic]"` | No |
| **OpenAI** (GPT-4) | `pip install "civion[openai]"` | No |
| **Groq** (fast + cheap) | `pip install "civion[groq]"` | Free tier |
| **Google Gemini** | `pip install "civion[gemini]"` | Free tier |
| **Mistral** | `pip install "civion[mistral]"` | Free tier |
| All providers | `pip install "civion[all-providers]"` | — |

To use Ollama (no API key needed):
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2

# Select ollama during civion setup
civion setup
```

---

## What is civion?

**The problem:** Every AI tool is a black box. You ask, it answers. 
You have no idea why it said what it said.

**civion is a glass box.** You watch the AI think.

- 🤖 **Multiple agents** monitor GitHub, arXiv, markets, news 24/7
- ⚔️ **Live debates** — agents argue, challenge, and verify each other
- 📊 **Confidence scores** build visibly as evidence stacks up
- 🔮 **Predictions** generated when consensus reaches 70%+
- 🧠 **NICK** — a personal assistant who knows you and your goals
- 🔒 **Local-first** — all data stays on your machine
- 🌐 **P2P network** — share findings with other civion users

---

## Data & Privacy

All data lives in `~/.civion/`:
- `config.json` — your settings
- `.secrets` — API keys (chmod 600)
- `civion.db` — collected intelligence
- `vault/` — saved findings
- `nick_memory.json` — what NICK remembers about you
- `profile.json` — your profile

To export everything: **Data Vault → Export All** in the UI.  
To delete everything: `civion reset`

---

## Troubleshooting

**civion command not found after pip install:**
```bash
# Try pipx instead
pipx install civion

# Or check your PATH
python -m civion.cli.main --help
```

**Port 8000 already in use:**
```bash
civion start --port 8001
```

**API key not working:**
```bash
civion doctor
civion config add-key anthropic sk-ant-...
```

**Blank page at localhost:8000:**
```bash
civion doctor  # checks if frontend bundle is present
```

**Full diagnostics:**
```bash
civion doctor
civion logs
```

---

## Development
```bash
git clone https://github.com/baljotchohan/CIVION
cd CIVION

# Install in dev mode
pip install -e ".[dev]"

# Build frontend
./scripts/build_frontend.sh

# Run tests
pytest

# Release
./scripts/release.sh 2.0.1
```

---

## License

MIT — see [LICENSE](LICENSE)
