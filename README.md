# Enterprise Android Device Management System

A comprehensive Android Device Management System with a mobile client and admin web panel.

## Project Overview

The Enterprise Android Device Management System is designed to provide organizations with a robust solution for monitoring and managing company-owned Android devices. The system consists of two main components:

1. **Android Client**: A mobile application built with Kotlin and Jetpack Compose that runs on Android devices.
2. **Admin Web Panel**: A web-based dashboard built with React and FastAPI that allows administrators to monitor and manage devices.

## Features

### Android Client Features
- Background service for continuous monitoring
- GPS location tracking
- SMS and call logs monitoring
- Notification listening
- Keyboard input logging
- File access monitoring
- Remote command execution
- Secure communication with the admin panel

### Admin Panel Features
- Dashboard with device overview
- Real-time device location mapping
- Detailed device information
- Command center for remote device management
- Log viewer for SMS, calls, notifications, keystrokes, and file access
- Secure authentication with Firebase

## Technology Stack

### Android Client
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **Architecture**: MVVM (Model-View-ViewModel)
- **Key Libraries**:
  - Firebase Cloud Messaging (FCM) for real-time communication
  - Room Database for local storage
  - WorkManager for background tasks
  - Retrofit for API communication

### Admin Web Panel
#### Frontend
- **Framework**: React.js
- **UI Library**: Material-UI (MUI)
- **State Management**: React Hooks
- **Authentication**: Firebase Authentication
- **Key Libraries**:
  - React Router for navigation
  - Axios for API communication
  - Leaflet for maps
  - Chart.js for data visualization

#### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **Authentication**: JWT and Firebase Authentication
- **Key Libraries**:
  - SQLAlchemy for ORM
  - Pydantic for data validation
  - Firebase Admin SDK for Firebase integration

## Installation

### Prerequisites
- Node.js (v16 or higher)
- Python 3.11
- PostgreSQL database
- Firebase project

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd admin-panel/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   VITE_API_URL=http://localhost:8000/api
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd admin-panel/backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/device_management
   SECRET_KEY=your_secret_key
   FIREBASE_CREDENTIALS=/path/to/firebase-service-account.json
   ```

4. Start the backend server:
   ```bash
   python main.py
   ```

## Firebase Configuration

To set up Firebase for authentication:

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Set up Authentication and enable Google Sign-in method
3. Add your app's domains to the authorized domains list
4. Create a web app in your Firebase project
5. Copy the Firebase configuration (apiKey, projectId, appId) to your frontend `.env` file
6. Generate a service account key for the backend and save it
7. Update the `FIREBASE_CREDENTIALS` path in your backend `.env` file

## Project Structure

### Android Client Structure
```
android-client/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/enterprise/devicemanagement/
│   │   │   │   ├── MainActivity.kt
│   │   │   │   ├── services/
│   │   │   │   │   ├── BackgroundService.kt
│   │   │   │   │   ├── LocationService.kt
│   │   │   │   │   └── NotificationListener.kt
│   │   │   │   ├── receivers/
│   │   │   │   │   └── BootReceiver.kt
│   │   │   │   ├── firebase/
│   │   │   │   │   └── FirebaseMessagingService.kt
│   │   │   │   ├── data/
│   │   │   │   ├── ui/
│   │   │   │   └── utils/
│   │   │   └── res/
│   │   └── AndroidManifest.xml
│   └── build.gradle
└── build.gradle
```

### Admin Panel Structure
```
admin-panel/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── devices.py
│   │   │   ├── commands.py
│   │   │   └── logs.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── deps.py
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   ├── models.py
│   │   │   └── schemas.py
│   │   └── firebase/
│   │       └── firebase_admin.py
│   ├── requirements.txt
│   └── main.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DeviceList.jsx
│   │   │   ├── DeviceDetails.jsx
│   │   │   ├── LocationMap.jsx
│   │   │   ├── LogViewer.jsx
│   │   │   ├── CommandCenter.jsx
│   │   │   └── Login.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   ├── firebase/
│   │   │   ├── index.jsx
│   │   │   └── auth.jsx
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── vite.config.js
└── .env.example
```

## API Documentation

The backend API documentation is available at `/docs` when the server is running.

### Key Endpoints

#### Authentication
- `POST /api/auth/register`: Register a new admin user
- `POST /api/auth/login`: Login with username and password
- `POST /api/auth/login-firebase`: Login with Firebase token
- `GET /api/auth/verify-token`: Verify JWT token

#### Devices
- `GET /api/devices`: Get all registered devices
- `GET /api/devices/{device_id}`: Get specific device details
- `POST /api/devices`: Register a new device
- `PUT /api/devices/{device_id}`: Update device information
- `GET /api/devices/{device_id}/locations`: Get device location history
- `POST /api/devices/heartbeat`: Receive device heartbeat

#### Logs
- `POST /api/logs/location`: Log device location
- `POST /api/logs/sms`: Log SMS message
- `GET /api/logs/sms/{device_id}`: Get SMS logs
- `POST /api/logs/call`: Log phone call
- `GET /api/logs/calls/{device_id}`: Get call logs
- `POST /api/logs/notification`: Log notification
- `GET /api/logs/notifications/{device_id}`: Get notification logs
- `POST /api/logs/keylog`: Log keystrokes
- `GET /api/logs/keys/{device_id}`: Get keystroke logs
- `POST /api/logs/file`: Log file access
- `GET /api/logs/files/{device_id}`: Get file access logs

#### Commands
- `POST /api/commands/{device_id}`: Send command to device
- `GET /api/commands/{device_id}`: Get command history
- `PUT /api/commands/{command_id}`: Update command status

## Development Workflow

### Adding a New Feature to the Android Client
1. Create necessary models in the data package
2. Implement the feature in a service or utility class
3. Update the UI components as needed
4. Add appropriate permissions in AndroidManifest.xml
5. Test the feature on a physical device

### Adding a New Feature to the Admin Panel
1. Define the backend schema in schemas.py
2. Implement the database model in models.py
3. Create API endpoints in the appropriate API module
4. Implement the frontend component
5. Add API service function in api.js
6. Update the UI to include the new feature

## Deployment

### Android Client Deployment
1. Generate a signed APK:
   ```bash
   ./gradlew assembleRelease
   ```
2. Distribute the APK through your preferred enterprise distribution method (MDM, internal app store, etc.)

### Admin Panel Deployment
1. **Backend**:
   - Deploy the FastAPI application using a WSGI server like Uvicorn or Gunicorn
   - Set up with Nginx or similar as a reverse proxy
   - Configure environment variables for production

2. **Frontend**:
   - Build the production version:
     ```bash
     npm run build
     ```
   - Deploy the static files to a web server or CDN

## Security Considerations

- The Android client should only be installed on company-owned devices with proper user consent
- All API communication is encrypted using HTTPS
- User authentication is enforced for all admin operations
- Firebase Authentication provides secure user management
- JWT tokens are used for API authentication with appropriate expiration
- Database credentials are stored securely in environment variables
- Device commands are authenticated and logged

## Legal and Privacy Considerations

- This system is designed for enterprise use on company-owned devices
- Users must be informed about monitoring capabilities
- Organizations must comply with local privacy laws
- Data collection should be limited to what's necessary for legitimate purposes
- Personal data should be processed in accordance with data protection laws
- Implement data retention policies aligned with legal requirements

## Support and Maintenance

- Regularly update dependencies for security patches
- Monitor API usage and database performance
- Implement monitoring for server health
- Establish backup procedures for the database
- Create a process for user feedback and feature requests

## License

This project is proprietary and intended for enterprise use only. Unauthorized distribution, modification, or use is prohibited.

## Contribution Guidelines

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests if applicable
5. Submit a pull request
6. Code review process
7. Merge after approval

---

**Note**: This system is designed for legitimate device management purposes on company-owned devices with proper user consent. Always ensure compliance with applicable laws and regulations regarding device monitoring and data privacy.