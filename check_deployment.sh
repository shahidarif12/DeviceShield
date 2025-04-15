#!/bin/bash

echo "🔍 Checking Enterprise Android Device Management System deployment..."
echo "====================================================================="

# Check if backend is running
echo -n "Backend API server: "
if curl -s http://localhost:8000/health > /dev/null; then
  echo "✅ Running ($(curl -s http://localhost:8000/health))"
else
  echo "❌ Not running"
fi

# Check if frontend is running
echo -n "Frontend server: "
if curl -s http://localhost:5000/health > /dev/null; then
  echo "✅ Running ($(curl -s http://localhost:5000/health))"
else
  echo "❌ Not running"
fi

# Check if API docs are accessible
echo -n "API documentation: "
if curl -s http://localhost:8000/docs > /dev/null; then
  echo "✅ Available at http://localhost:8000/docs"
else
  echo "❌ Not accessible"
fi

# Check for Firebase configuration
echo -n "Firebase configuration: "
if curl -s http://localhost:5000/firebase-status | grep -q "configured"; then
  echo "✅ Configured"
  FIREBASE_PROJECT=$(curl -s http://localhost:5000/firebase-status | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
  echo "   Project ID: $FIREBASE_PROJECT"
else
  echo "❌ Not configured"
fi

# Check for environment variables
echo -n "Required environment variables: "
if [ -n "$DATABASE_URL" ] && [ -n "$VITE_FIREBASE_API_KEY" ] && [ -n "$VITE_FIREBASE_PROJECT_ID" ] && [ -n "$VITE_FIREBASE_APP_ID" ]; then
  echo "✅ All required variables are set"
else
  echo "❌ Some required variables are missing"
  [ -z "$DATABASE_URL" ] && echo "   - DATABASE_URL is not set"
  [ -z "$VITE_FIREBASE_API_KEY" ] && echo "   - VITE_FIREBASE_API_KEY is not set"
  [ -z "$VITE_FIREBASE_PROJECT_ID" ] && echo "   - VITE_FIREBASE_PROJECT_ID is not set"
  [ -z "$VITE_FIREBASE_APP_ID" ] && echo "   - VITE_FIREBASE_APP_ID is not set"
fi

echo ""
echo "===================================================================="
echo "✅ System deployment check complete"
echo "📱 For the Android client, please deploy using Android Studio"
echo "🌐 For the admin panel, visit: http://localhost:5000"
echo "⚙️  For API documentation, visit: http://localhost:8000/docs"
echo "===================================================================="