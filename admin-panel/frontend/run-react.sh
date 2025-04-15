#!/bin/bash

# Clean up node_modules
rm -rf node_modules
rm -f package-lock.json

# Install dependencies with legacy peer deps to avoid dependency conflicts
npm install --no-fund --no-audit --prefer-offline --legacy-peer-deps

# Start the Vite dev server
PORT=5000 npm run dev -- --host 0.0.0.0 --port 5000