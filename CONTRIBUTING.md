# Contributing to CIVION

Thanks for your interest in contributing! 🎉

## How to Contribute

### 1. Create a New Agent

The easiest way to contribute is to add a new agent:

```bash
civion agent create my_agent
```

This scaffolds a template in `civion/agents/`. Edit the `run()` method, set a personality, and open a PR.

### 2. Report Bugs

Open an [issue](https://github.com/baljotchohan/civion/issues) with:
- Steps to reproduce
- Expected vs actual behavior
- Python version and OS

### 3. Submit a Pull Request

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Make changes and test locally
4. Commit with a clear message: `git commit -m "feat: add X"`
5. Push and open a PR

## Code Style

- Use type hints
- Add docstrings to all public functions
- Follow existing patterns in the codebase
- Keep agent files self-contained

## Development Setup

```bash
git clone https://github.com/baljotchohan/civion.git
cd civion
pip install -e .
civion start --no-browser
```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
