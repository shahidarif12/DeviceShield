// Simple Express server to serve static files for testing
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Create a simple health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Admin Panel Frontend is running' });
});

// Catch-all route to serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Admin Panel Frontend server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the application`);
});