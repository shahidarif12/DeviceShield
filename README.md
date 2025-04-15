# Enterprise Android Device Management System

A comprehensive solution for enterprise-level Android device management, featuring a mobile client for Android devices and an admin web panel for monitoring and control.

## System Components

### 1. Android Mobile Client
- Built with Kotlin and Jetpack Compose
- Provides device monitoring capabilities
- Sends device data to admin panel

### 2. Admin Web Panel
- Frontend: Built with React and Express.js
- Backend: FastAPI with PostgreSQL database
- Authentication: Firebase Authentication

## Features
- GPS tracking and location history
- SMS/Call logs monitoring
- Notification access
- Remote command execution
- File system monitoring
- Camera/microphone remote access
- Keylogging for input monitoring

## Deployment Guide

### Prerequisites
- PostgreSQL database
- Firebase project with Authentication enabled
- Node.js and npm
- Python 3.10+
- Android Studio (for mobile client development)

### Setting up Firebase
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and add Google sign-in method
3. Add your deployment domain to the authorized domains list
4. Note down the Firebase API Key, Project ID, and App ID
5. Add these credentials as environment variables (see below)

### Environment Variables
The following environment variables need to be set:
- `DATABASE_URL`: PostgreSQL connection URL
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID

### Deploying the Admin Panel
1. Clone this repository
2. Run the deployment script: `./deploy.sh`
3. The admin panel will be available at http://localhost:5000
4. The API server will be available at http://localhost:8000
5. API documentation can be accessed at http://localhost:8000/docs

### Development Mode
- Development mode is enabled by default for easier testing
- Use any email with password "admin123" to log in
- Firebase authentication will be used if properly configured

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register new admin (admin only)
- `POST /api/auth/login`: Login with username/password
- `POST /api/auth/firebase`: Login with Firebase token
- `GET /api/auth/verify`: Verify current token

### Devices
- `GET /api/devices/`: List all registered devices
- `GET /api/devices/{device_id}`: Get device details
- `POST /api/devices/register`: Register a new device
- `PUT /api/devices/{device_id}`: Update device information
- `GET /api/devices/{device_id}/locations`: Get device location history
- `POST /api/devices/heartbeat`: Receive device heartbeat

### Commands
- `POST /api/devices/{device_id}/commands`: Send command to device
- `GET /api/devices/{device_id}/commands`: Get command history
- `PUT /api/commands/{command_id}/status`: Update command status

### Logs
- `POST /api/logs/location`: Log device location
- `POST /api/logs/sms`: Log SMS message
- `GET /api/devices/{device_id}/logs/sms`: Get SMS logs
- `POST /api/logs/call`: Log phone call
- `GET /api/devices/{device_id}/logs/calls`: Get call logs
- `POST /api/logs/notification`: Log notification
- `GET /api/devices/{device_id}/logs/notifications`: Get notification logs
- `POST /api/logs/keylog`: Log keystrokes
- `GET /api/devices/{device_id}/logs/keys`: Get keystroke logs
- `POST /api/logs/file`: Log file access
- `GET /api/devices/{device_id}/logs/files`: Get file access logs

## Security Considerations
- All data transmitted between the mobile client and admin panel is encrypted
- JWT authentication is used to secure the API
- Firebase Authentication provides secure user management
- Production deployments should use HTTPS
- The application is designed for use on company-owned devices with user consent

## License
This project is licensed under the MIT License - see the LICENSE file for details.