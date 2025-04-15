#!/bin/bash

# Copy the express package.json
cp package-express.json package.json

# Clean up node_modules
rm -rf node_modules
rm -f package-lock.json

# Install only express
npm install --no-fund --no-audit

# Run the express server
PORT=5000 node server.js