#!/bin/bash

echo "Setting up React application with Vite..."

# Use React package.json
cp package-react.json package.json

# Clean up node_modules to ensure clean installation
rm -rf node_modules
rm -f package-lock.json

# Maximum retries for npm install
MAX_RETRIES=3
RETRY_COUNT=0
INSTALL_SUCCESS=false

echo "Installing dependencies (this may take a few minutes)..."
while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$INSTALL_SUCCESS" = "false" ]; do
  # Install dependencies with legacy peer deps to avoid dependency conflicts
  npm install --no-fund --no-audit --prefer-offline --legacy-peer-deps
  
  if [ $? -eq 0 ]; then
    INSTALL_SUCCESS=true
    echo "Dependencies installed successfully."
  else
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "Installation failed. Retrying ($RETRY_COUNT/$MAX_RETRIES)..."
      # Wait a moment before retrying
      sleep 2
    fi
  fi
done

# If installation still failed after retries, fall back to Express
if [ "$INSTALL_SUCCESS" = "false" ]; then
  echo "Dependency installation failed after $MAX_RETRIES attempts. Falling back to Express server."
  cp package-express.json package.json
  rm -rf node_modules
  rm -f package-lock.json
  npm install --no-fund --no-audit
  PORT=5000 node server.js
  exit 0
fi

echo "Starting Vite development server..."
# Start the Vite dev server with increased timeout
TIMEOUT=30
timeout $TIMEOUT npm run dev -- --host 0.0.0.0 --port 5000

# Check if Vite started successfully
if [ $? -ne 0 ]; then
  echo "Vite server failed to start or timed out after $TIMEOUT seconds. Falling back to Express server."
  cp package-express.json package.json
  rm -rf node_modules
  rm -f package-lock.json
  npm install --no-fund --no-audit
  PORT=5000 node server.js
fi