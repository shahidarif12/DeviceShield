package com.enterprise.devicemanagement

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import com.google.firebase.FirebaseApp

class DeviceManagementApp : Application() {
    
    companion object {
        const val CHANNEL_ID = "device_management_channel"
        const val LOCATION_CHANNEL_ID = "location_tracking_channel"
        const val NOTIFICATION_LISTENER_CHANNEL_ID = "notification_listener_channel"
        
        lateinit var instance: DeviceManagementApp
            private set
    }
    
    override fun onCreate() {
        super.onCreate()
        instance = this
        
        // Initialize Firebase
        FirebaseApp.initializeApp(this)
        
        // Create notification channels
        createNotificationChannels()
    }
    
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Main service channel
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "Device Management Service",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Used for the device management background service"
            }
            
            // Location service channel
            val locationChannel = NotificationChannel(
                LOCATION_CHANNEL_ID,
                "Location Tracking",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Used for tracking device location"
            }
            
            // Notification listener channel
            val notificationListenerChannel = NotificationChannel(
                NOTIFICATION_LISTENER_CHANNEL_ID,
                "Notification Monitoring",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Used for monitoring device notifications"
            }
            
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannels(
                listOf(serviceChannel, locationChannel, notificationListenerChannel)
            )
        }
    }
}
