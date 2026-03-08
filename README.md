# CIVION v2 — AI Intelligence Command Center

> Watch AI think in real-time. 
> Multi-agent reasoning. Confidence cascades. Predictions.

## ⚡ Quick Start (30 seconds)

```bash
pip install civion
civion setup
civion start
```

That's it. CIVION opens in your browser automatically.

## 🤖 Supported AI Providers

| Provider | Models | Cost | Notes |
|---|---|---|---|
| Anthropic | Claude 3.5, Claude 3 | Medium | Best reasoning |
| OpenAI | GPT-4o, GPT-3.5 | Medium | General purpose |
| Google | Gemini 1.5 Pro/Flash | Low | Long context |
| Mistral | Large, Medium, Small | Low | EU data |
| Groq | Llama 3.1, Mixtral | Very Low | Ultra fast |
| Cohere | Command R+ | Low | Enterprise |
| Together AI | 50+ open models | Very Low | Open source |
| Perplexity | Sonar models | Low | Web search |
| **Ollama** | **Any local model** | **FREE** | **100% private** |
| Azure OpenAI | GPT-4 deployments | Enterprise | Azure |
| AWS Bedrock | Claude, Llama | Pay/use | AWS |
| HuggingFace | Any HF model | Free tier | Research |

## 🛠 CLI Commands

```bash
civion setup          # Configure CIVION (run first)
civion start          # Start the system
civion status         # Check what's running
civion guide          # Interactive user guide
civion doctor         # Diagnose and fix issues
civion update         # Update to latest version
civion agent start --all  # Start all agents
civion config add-key openai  # Add API key
```

## 📖 What is CIVION?

CIVION is an AI intelligence platform where you watch AI 
agents reason in real-time:

- **Multi-Agent Debates** — Agents propose, challenge, verify
- **Confidence Cascades** — Watch confidence grow from 55% to 92%  
- **Predictions** — Probabilistic forecasts with evidence
- **Custom Personas** — Analyze through any lens
- **Global Network** — Share findings with researchers worldwide
- **ARIA Assistant** — Built-in AI that knows your entire system

## 📋 Requirements

- Python 3.10+
- At least ONE LLM API key (or Ollama for free local AI)
- 500MB disk space
- Internet connection (or Ollama for offline use)

## 🔑 Getting API Keys

### Free Options
- **Ollama**: https://ollama.ai (runs locally, no key needed)
- **Groq**: https://console.groq.com (generous free tier)
- **HuggingFace**: https://huggingface.co/settings/tokens

### Paid Options  
- **Anthropic**: https://console.anthropic.com ($5 free credits)
- **OpenAI**: https://platform.openai.com/api-keys ($5 free)
- **Google**: https://aistudio.google.com/app/apikey (free tier)

## 🐛 Troubleshooting

```bash
civion doctor    # auto-diagnose and fix
civion logs      # view logs
civion reset     # start fresh
```

Common issues:
- **Port in use**: civion doctor will offer to kill it
- **Invalid API key**: civion config test-key anthropic
- **Agents not starting**: check civion status
