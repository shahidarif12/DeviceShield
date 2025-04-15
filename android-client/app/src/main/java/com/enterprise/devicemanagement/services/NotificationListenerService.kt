package com.enterprise.devicemanagement.services

import android.app.Notification
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import androidx.core.app.NotificationCompat
import com.enterprise.devicemanagement.DeviceManagementApp
import com.enterprise.devicemanagement.MainActivity
import com.enterprise.devicemanagement.R
import com.enterprise.devicemanagement.api.ApiService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class MonitorNotificationListenerService : NotificationListenerService() {
    
    private val serviceScope = CoroutineScope(Dispatchers.IO + Job())
    private lateinit var apiService: ApiService
    private var deviceId: String = ""
    private var monitoredPackages = setOf(
        "com.whatsapp",
        "com.facebook.orca",
        "com.google.android.gm",
        "com.microsoft.office.outlook",
        "com.slack"
    )
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize Retrofit for API communication
        val retrofit = Retrofit.Builder()
            .baseUrl("https://your-backend-url.com/api/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        apiService = retrofit.create(ApiService::class.java)
        
        // Get device ID
        val sharedPrefs = getSharedPreferences("device_management_prefs", MODE_PRIVATE)
        deviceId = sharedPrefs.getString("device_id", "") ?: ""
        
        // Get the monitored packages from shared preferences
        val monitoredPackagesStr = sharedPrefs.getString("monitored_packages", null)
        if (monitoredPackagesStr != null) {
            monitoredPackages = monitoredPackagesStr.split(",").toSet()
        }
        
        // Show foreground notification
        val notification = createForegroundNotification()
        startForeground(NOTIFICATION_ID, notification)
    }
    
    override fun onNotificationPosted(sbn: StatusBarNotification) {
        // Check if the notification is from a monitored package
        if (sbn.packageName in monitoredPackages) {
            val notification = sbn.notification
            val extras = notification.extras
            
            // Extract notification data
            val title = extras.getString(Notification.EXTRA_TITLE) ?: ""
            val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
            val appName = sbn.packageName
            val timestamp = sbn.postTime
            
            // Send notification data to server
            sendNotificationToServer(appName, title, text, timestamp)
        }
    }
    
    private fun sendNotificationToServer(
        appName: String,
        title: String,
        text: String,
        timestamp: Long
    ) {
        serviceScope.launch {
            try {
                val notificationData = mapOf(
                    "deviceId" to deviceId,
                    "appName" to appName,
                    "title" to title,
                    "text" to text,
                    "timestamp" to timestamp
                )
                
                apiService.sendNotification(notificationData)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
    
    private fun createForegroundNotification(): Notification {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }
        )
        
        return NotificationCompat.Builder(this, DeviceManagementApp.NOTIFICATION_LISTENER_CHANNEL_ID)
            .setContentTitle("Notification Monitoring")
            .setContentText("Monitoring app notifications")
            .setSmallIcon(R.drawable.ic_notification_listener)
            .setContentIntent(pendingIntent)
            .build()
    }
    
    override fun onDestroy() {
        super.onDestroy()
        
        // Restart service if it gets destroyed
        val broadcastIntent = Intent("com.enterprise.devicemanagement.RESTART_SERVICE")
        sendBroadcast(broadcastIntent)
    }
    
    companion object {
        private const val NOTIFICATION_ID = 3
    }
}
