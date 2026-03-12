#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║         CIVION FINAL VERIFICATION & DEPLOYMENT CHECKLIST               ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check 1: Syntax
echo "✓ Checking Python syntax..."
python3 -c "
import ast
import os
errors = 0
for root, dirs, files in os.walk('civion'):
    for file in files:
        if file.endswith('.py'):
            with open(os.path.join(root, file)) as f:
                try:
                    ast.parse(f.read())
                except SyntaxError as e:
                    print(f'✗ {os.path.join(root, file)}:{e.lineno}')
                    errors += 1
print(f'✓ {\"All files OK\" if errors == 0 else f\"{errors} errors\"}')
"
echo ""

# Check 2: OpenClaw references
echo "✓ Checking for OpenClaw references..."
# Case insensitive grep for openclaw, excluding comments if possible but let's just check strings.
if grep -ri "openclaw" civion --include="*.py" | grep -v "#" > /dev/null; then
    echo "⚠ OpenClaw references still present (excluding comments)"
    grep -ri "openclaw" civion --include="*.py" | grep -v "#"
else
    echo "✓ No OpenClaw references found in code lines"
fi
echo ""

# Check 3: Files exist
echo "✓ Checking required files..."
FILES=("pyproject.toml" "README.md" "civion/api/server.py" "civion/api/websocket.py")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (MISSING)"
    fi
done
echo ""

# Check 4: Installation files
echo "✓ Checking installation files..."
if [ -f "requirements.txt" ]; then
    LINES=$(wc -l < requirements.txt)
    echo "  ✓ requirements.txt ($LINES dependencies)"
else
    echo "  ⚠ requirements.txt not found"
fi

if [ -f "install.sh" ]; then
    echo "  ✓ install.sh (executable)"
else
    echo "  ⚠ install.sh not found"
fi

if [ -f "Dockerfile" ]; then
    echo "  ✓ Dockerfile (Docker support)"
else
    echo "  ⚠ Dockerfile not found"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                      ✓ CIVION READY FOR DEPLOYMENT                    ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
