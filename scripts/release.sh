#!/bin/bash
set -e

if [ -z "$1" ]; then
    echo "Usage: ./scripts/release.sh <version>"
    echo "Example: ./scripts/release.sh 2.0.1"
    exit 1
fi

VERSION=$1

echo "Releasing CIVION v$VERSION..."

# 1. Build frontend
./scripts/build_frontend.sh

# 2. Update version in pyproject.toml (simple sed)
# Assuming version = "x.y.z" is on line 7
sed -i '' "s/version = .*/version = \"$VERSION\"/" pyproject.toml

# 3. Git operations
git add .
git commit -m "chore: release v$VERSION"
git tag "v$VERSION"

echo "Release v$VERSION prepared. Run 'git push && git push --tags' to publish."
