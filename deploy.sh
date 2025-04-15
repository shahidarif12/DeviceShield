#!/bin/bash

echo "🚀 Starting Device Management Admin Panel Deployment"

# Step 1: Install dependencies for backend
echo "📦 Installing backend dependencies..."
cd admin-panel/backend
pip install -r requirements.txt

# Step 2: Install dependencies for frontend
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Step 3: Build frontend
echo "🔨 Building frontend assets..."
cd ../frontend
./run-express.sh &
FRONTEND_PID=$!

# Step 4: Start backend server
echo "🚀 Starting backend server..."
cd ../backend
python main.py &
BACKEND_PID=$!

echo "✅ Deployment complete!"
echo "🔗 Frontend: http://localhost:5000"
echo "🔗 Backend API: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "To stop the services, run: kill $FRONTEND_PID $BACKEND_PID"

# Keep script running
wait