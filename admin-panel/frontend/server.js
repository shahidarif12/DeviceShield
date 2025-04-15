// Enhanced Express server to serve files and proxy API requests
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Try to load http-proxy-middleware, but continue if not available
let createProxyMiddleware;
try {
  const proxyModule = require('http-proxy-middleware');
  createProxyMiddleware = proxyModule.createProxyMiddleware;
} catch (error) {
  console.warn('http-proxy-middleware not found. API proxying will be disabled.');
}

// Function to check if variable exists in environment
const getEnvVar = (name, defaultValue = null) => {
  const value = process.env[name];
  return value !== undefined ? value : defaultValue;
};

// Debug environment variables
console.log('Environment variables available:', {
  VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY ? '[SET]' : '[NOT SET]',
  VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID ? '[SET]' : '[NOT SET]',
  VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID ? '[SET]' : '[NOT SET]'
});

// Firebase environment variables for client-side
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY', ''),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', ''),
  appId: getEnvVar('VITE_FIREBASE_APP_ID', '')
};

// Looks like there might be a problem with the values - let's check and swap if needed
if (firebaseConfig.projectId && firebaseConfig.projectId.includes(':') && 
    firebaseConfig.appId && !firebaseConfig.appId.includes(':')) {
  console.log('Detected likely swapped projectId and appId, fixing...');
  const temp = firebaseConfig.projectId;
  firebaseConfig.projectId = firebaseConfig.appId;
  firebaseConfig.appId = temp;
}

// Check if we have necessary Firebase config
const hasFirebaseConfig = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;

// Debug the configuration
console.log('Firebase configuration:', {
  apiKey: firebaseConfig.apiKey ? '[SET]' : '[NOT SET]',
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId ? '[SET]' : '[NOT SET]',
  configured: hasFirebaseConfig
});

// Create dynamic firebase config script
app.get('/firebase-config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    // Dynamically generated Firebase configuration
    window.firebaseConfig = {
      apiKey: "${firebaseConfig.apiKey}",
      authDomain: "${firebaseConfig.projectId}.firebaseapp.com",
      projectId: "${firebaseConfig.projectId}",
      storageBucket: "${firebaseConfig.projectId}.appspot.com",
      appId: "${firebaseConfig.appId}",
      developmentMode: ${!hasFirebaseConfig}
    };
    console.log('Firebase config:', window.firebaseConfig);
    console.log('Firebase status:', window.firebaseConfig.projectId ? 'Configured' : 'Development Mode');
    
    // Display information about necessary Firebase console configuration
    console.warn('IMPORTANT: You need to add the Replit domain to Firebase authorized domains');
    console.warn('Please go to Firebase Console > Authentication > Settings > Authorized domains');
    console.warn('Add the current domain: ' + window.location.hostname);
  `);
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Optional: Proxy API requests to the backend
if (getEnvVar('PROXY_API', 'true') === 'true' && createProxyMiddleware) {
  try {
    app.use('/api', createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api' // rewrite path if needed
      }
    }));
    console.log('API proxying enabled to backend at http://localhost:8000');
  } catch (error) {
    console.error('Failed to setup API proxy:', error.message);
  }
} else {
  console.log('API proxying disabled');
}

// Create a simple health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Admin Panel Frontend is running' });
});

// Route for Firebase status
app.get('/firebase-status', (req, res) => {
  res.json({ 
    configured: hasFirebaseConfig,
    projectId: hasFirebaseConfig ? firebaseConfig.projectId : null
  });
});

// Catch-all route to serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Admin Panel Frontend server running on port ${PORT}`);
  console.log(`Firebase integration: ${hasFirebaseConfig ? 'ENABLED' : 'DISABLED (development mode)'}`);
  console.log(`Visit http://localhost:${PORT} to view the application`);
});