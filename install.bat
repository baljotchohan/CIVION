@echo off
REM CIVION Universal Installer - Windows
REM Purpose: Automated installation and setup

echo ============================================================
echo CIVION Universal Installer (Windows)
echo ============================================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.9+ from python.org
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

REM Run the main Python installer
python install.py

if %errorlevel% neq 0 (
    echo [ERROR] Installation failed.
    pause
    exit /b 1
)

pause
