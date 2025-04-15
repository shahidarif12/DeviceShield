package com.enterprise.devicemanagement.services

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.enterprise.devicemanagement.DeviceManagementApp
import com.enterprise.devicemanagement.MainActivity
import com.enterprise.devicemanagement.R
import com.enterprise.devicemanagement.api.ApiService
import com.enterprise.devicemanagement.data.DeviceInfo
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.UUID

class BackgroundService : Service() {
    
    private val serviceScope = CoroutineScope(Dispatchers.IO + Job())
    private lateinit var apiService: ApiService
    private var deviceId: String = ""
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize Retrofit for API communication
        val retrofit = Retrofit.Builder()
            .baseUrl("https://your-backend-url.com/api/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        apiService = retrofit.create(ApiService::class.java)
        
        // Get or generate device ID
        val sharedPrefs = getSharedPreferences("device_management_prefs", MODE_PRIVATE)
        deviceId = sharedPrefs.getString("device_id", "") ?: ""
        
        if (deviceId.isEmpty()) {
            deviceId = UUID.randomUUID().toString()
            sharedPrefs.edit().putString("device_id", deviceId).apply()
        }
        
        // Get Firebase token
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val token = task.result
                serviceScope.launch {
                    registerDevice(token)
                }
            }
        }
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Create and show foreground notification
        val notification = createForegroundNotification()
        startForeground(NOTIFICATION_ID, notification)
        
        // Start heartbeat ping
        startHeartbeatPing()
        
        // Start the location service
        val locationIntent = Intent(this, LocationService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(locationIntent)
        } else {
            startService(locationIntent)
        }
        
        return START_STICKY
    }
    
    private fun startHeartbeatPing() {
        serviceScope.launch {
            while (true) {
                try {
                    // Send heartbeat ping to server
                    val deviceInfo = DeviceInfo(
                        id = deviceId,
                        manufacturer = Build.MANUFACTURER,
                        model = Build.MODEL,
                        osVersion = Build.VERSION.RELEASE,
                        lastSeen = System.currentTimeMillis()
                    )
                    
                    apiService.sendHeartbeat(deviceInfo)
                } catch (e: Exception) {
                    // Log error but continue
                    e.printStackTrace()
                }
                
                // Wait for 15 minutes before next ping
                delay(15 * 60 * 1000)
            }
        }
    }
    
    private suspend fun registerDevice(firebaseToken: String) {
        try {
            val deviceInfo = DeviceInfo(
                id = deviceId,
                manufacturer = Build.MANUFACTURER,
                model = Build.MODEL,
                osVersion = Build.VERSION.RELEASE,
                firebaseToken = firebaseToken,
                lastSeen = System.currentTimeMillis()
            )
            
            apiService.registerDevice(deviceInfo)
        } catch (e: Exception) {
            e.printStackTrace()
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
        
        return NotificationCompat.Builder(this, DeviceManagementApp.CHANNEL_ID)
            .setContentTitle("Device Management")
            .setContentText("Service is running")
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pendingIntent)
            .build()
    }
    
    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
    
    override fun onDestroy() {
        super.onDestroy()
        
        // Restart service if it gets destroyed
        val broadcastIntent = Intent("com.enterprise.devicemanagement.RESTART_SERVICE")
        sendBroadcast(broadcastIntent)
    }
    
    companion object {
        private const val NOTIFICATION_ID = 1
    }
}
