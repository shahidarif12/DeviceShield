import os
import json
from typing import Dict, Any, Optional
import firebase_admin
from firebase_admin import credentials, auth, messaging

from app.core.config import settings

# Initialize Firebase Admin
try:
    # If FIREBASE_CREDENTIALS is a path to a file
    if settings.FIREBASE_CREDENTIALS and os.path.exists(settings.FIREBASE_CREDENTIALS):
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
        firebase_admin.initialize_app(cred)
    # If FIREBASE_CREDENTIALS is a JSON string
    elif settings.FIREBASE_CREDENTIALS:
        cred_dict = json.loads(settings.FIREBASE_CREDENTIALS)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
    else:
        # Initialize without credentials (for development/testing)
        firebase_admin.initialize_app()
except (ValueError, firebase_admin.exceptions.FirebaseError) as e:
    print(f"Firebase initialization error: {e}")
    # Create a dummy app for development if Firebase isn't configured
    firebase_admin.initialize_app()

async def verify_id_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify a Firebase ID token."""
    try:
        # Verify the ID token
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Error verifying Firebase token: {e}")
        return None

async def get_firebase_user(uid: str) -> Dict[str, Any]:
    """Get Firebase user information."""
    try:
        # Get user data from Firebase
        user = auth.get_user(uid)
        
        # Convert to dictionary
        user_dict = {
            "uid": user.uid,
            "email": user.email,
            "name": user.display_name,
            "photo_url": user.photo_url,
            "email_verified": user.email_verified,
            "phone_number": user.phone_number
        }
        
        return user_dict
    except Exception as e:
        print(f"Error getting Firebase user: {e}")
        raise

async def send_command_to_device(token: str, data: Dict[str, Any]) -> bool:
    """Send a command to a device via Firebase Cloud Messaging."""
    try:
        # Create message
        message = messaging.Message(
            data={
                "command": data["command"],
                "command_id": str(data["command_id"]),
                "params": json.dumps(data.get("params", {}))
            },
            token=token
        )
        
        # Send message
        response = messaging.send(message)
        print(f"Successfully sent message: {response}")
        return True
    except Exception as e:
        print(f"Error sending message: {e}")
        return False
