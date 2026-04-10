#!/bin/bash
# install_dependencies.sh - Sample script for Jenkins (Node.js/Playwright)

set -e

# Install Node.js dependencies
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

# Optionally install Playwright browsers (if not in Docker)
# npx playwright install

echo "Dependencies installed successfully."
