# CIVION
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![PyPI version](https://badge.fury.io/py/civion.svg)](https://badge.fury.io/py/civion)

CIVION is an AI Intelligence Command Center focused on transparent machine reasoning, enabling specialized agents to debate, synthesize, and predict outcomes in real-time.

![CIVION Dashboard](assets/dashboard_preview.png)

## Quick Start
```bash
# 1. Install CIVION
pip install civion

# 2. Run the interactive setup wizard
civion setup

# 3. Start the dashboard
civion start
```
Then visit `http://localhost:8000` in your web browser.

---

## What is CIVION?
CIVION sits between a simple chatbot and an entirely autonomous company. It comprises five core features:
1. **Multi-Agent Execution**: Specialized agents constantly scour different parts of the internet (GitHub, arXiv, news) for data.
2. **Reasoning Loop**: Agents debate each other. Proposers introduce evidence, Challengers find flaws, Verifiers cross-check, and Synthesizers summarize.
3. **Confidence Tracking**: You can watch as the system algorithmically adjusts its conviction on a topic round-by-round.
4. **Probabilistic Predictions**: If confidence exceeds 70%, the system generates a prediction indicating what is likely to happen next.
5. **Peer-To-Peer Networking**: Connect with other CIVION users directly to share findings securely without a centralized coordinator.

---

## AI Providers
CIVION supports 12 different foundational models, ranging from premium hosted APIs to fully local private runs.

| Provider | Best Models | Cost Est. | Best For | Free Tier |
|----------|-------------|-----------|----------|-----------|
| Anthropic | Claude 3.5 Sonnet | $$$ | Top-tier intelligence | None |
| OpenAI | GPT-4o | $$$ | General reasoning | None |
| Gemini | Gemini 1.5 Pro | 🆓 Free | Fast throughput | Generous free tier |
| Groq | Llama 3 70B | 🆓 Free | Instant response | Generous free tier |
| Ollama | Llama 3 | 🆓 Free | Privacy / local execution | Fully Free |
| Mistral | Mistral Large | $$ | Complex reasoning | None |
| Cohere | Command R+ | $$ | Semantic search | Limited |
| Together | Mixtral 8x7B | $ | Balancing cost and perf | Trial |
| Perplexity| Sonar Large | $$ | Search integration | None |
| Azure | OAI GPT-4 | $$$ | Enterprise security | None |
| Bedrock | Claude 3 | $$$ | AWS ecosystem | None |
| HF | Open Source | $ | Custom workflows | None |

---

## Command Line Interface (CLI)
| Command | Description |
|---------|-------------|
| `civion setup` | Run interactive setup wizard |
| `civion start` | Start CIVION (backend + frontend) |
| `civion doctor` | Check system health and find port conflicts |
| `civion agent list`| List available AI agents |
| `civion agent start <id>` | Start a specific agent in the background |
| `civion config list` | Show current settings |
| `civion config add-key <x>`| Add provider API key securely |
| `civion config test-key <x>`| Validate API credentials |
| `civion reset` | Clear configuration and reset parameters |

---

## Configuration & Getting API Keys
CIVION automatically stores API keys in a local, encrypted `~/.civion/.secrets` store.

### Using Ollama (FREE, 100% Private Run)
1. Download Ollama from [ollama.ai](https://ollama.ai).
2. Start Ollama and run: `ollama run llama3`.
3. In CIVION, run `civion setup` and select Ollama as your provider.

### Using Google Gemini (Generous Free API Tier)
1. Get a key from Google AI Studio.
2. In CIVION: `civion config add-key gemini` 

---

## Architecture Overview
```text
┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │
│  Data Sources   │ ◄───► │   AI Agents     │
│                 │       │                 │
└─────────────────┘       └────────┬────────┘
                                   │
                           ┌───────▼────────┐
                           │ Reasoning Loop │ (Debate Engine)
                           └───────┬────────┘
                                   │
┌─────────────────┐       ┌────────▼────────┐
│  CIVION UI      │ ◄───► │ Engine/Backend  │
└─────────────────┘       └─────────────────┘
```

---

## Development Setup
If you want to contribute or run from source:
```bash
# Clone the repo
git clone https://github.com/civion/civion
cd civion

# Install in developer mode with test deps
pip install -e ".[dev]"

# Terminal 1: Run the backend API
python -m civion.api.server

# Terminal 2: Run the frontend
cd ui
npm install
npm run dev

# Terminal 3: Run the unit test suite
pytest tests/ -v
```

---

## Troubleshooting
**Q: Port already in use when I run `civion start`**
Run `civion doctor` to identify the hanging process, and kill it with `lsof -ti:8000 | xargs kill`.

**Q: Agents show offline/grey immediately**
You must configure an AI API Key. Open the dashboard and navigate to Settings to input a key.

**Q: I get "Invalid logic loop" error**
The model returned corrupted structural output. High-parameter models generally eliminate this.

**Q: Where is data stored?**
All states, database files and config are situated exactly at `~/.civion/`.

---

## License & Contributing
Licensed under the [MIT License](LICENSE).
Contributions are completely open! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
