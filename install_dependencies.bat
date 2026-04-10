@echo off
REM install_dependencies.bat - Sample script for Jenkins (Node.js/Playwright on Windows)

REM Install Node.js dependencies
IF EXIST package-lock.json (
    npm ci
) ELSE (
    npm install
)

REM Optionally install Playwright browsers (if not in Docker)
REM npx playwright install

echo Dependencies installed successfully.
