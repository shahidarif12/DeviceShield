package com.enterprise.devicemanagement.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ConsentScreen(onConsent: () -> Unit) {
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Enterprise Device Management",
                style = MaterialTheme.typography.headlineMedium,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Text(
                text = "Consent Agreement",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "Please read this consent form carefully before agreeing to the monitoring " +
                        "and management of this device.",
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            ConsentSection(
                title = "Device Location Monitoring",
                description = "The app will track and report the device's location periodically " +
                        "while the app is running. Location data will be sent to the organization's " +
                        "management system."
            )
            
            ConsentSection(
                title = "SMS and Call Log Access",
                description = "The app will collect information about SMS messages and phone calls " +
                        "made from this device, including phone numbers, contact names, and timestamps."
            )
            
            ConsentSection(
                title = "Notification Monitoring",
                description = "The app will monitor notifications from specific applications for " +
                        "enterprise management purposes."
            )
            
            ConsentSection(
                title = "Camera and Microphone Access",
                description = "With additional specific consent, administrators may request access " +
                        "to the camera or microphone for support or security purposes. You will be " +
                        "notified when this happens."
            )
            
            ConsentSection(
                title = "File Storage Access",
                description = "The app will have read-only access to file storage for audit and " +
                        "management purposes."
            )
            
            ConsentSection(
                title = "Remote Management",
                description = "Administrators may send remote commands to this device for management " +
                        "purposes, such as requesting location updates or system information."
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Text(
                text = "By clicking \"I Agree\" below, you consent to the monitoring and management " +
                        "of this device as described above. This device should only be used in " +
                        "accordance with your organization's acceptable use policy.",
                textAlign = TextAlign.Center,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Button(
                onClick = onConsent,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("I Agree")
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            TextButton(
                onClick = {
                    // Exit the app if the user doesn't consent
                    android.os.Process.killProcess(android.os.Process.myPid())
                }
            ) {
                Text("I Do Not Agree")
            }
            
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun ConsentSection(title: String, description: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Text(
            text = title,
            fontWeight = FontWeight.Bold,
            fontSize = 18.sp
        )
        
        Spacer(modifier = Modifier.height(4.dp))
        
        Text(
            text = description,
            fontSize = 16.sp
        )
        
        Spacer(modifier = Modifier.height(12.dp))
    }
}
