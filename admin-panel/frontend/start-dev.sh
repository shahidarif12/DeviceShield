#!/bin/bash

# Remove node_modules completely
rm -rf node_modules
rm -f package-lock.json

# Install dependencies
npm install --no-package-lock

# Start the development server
npm run dev