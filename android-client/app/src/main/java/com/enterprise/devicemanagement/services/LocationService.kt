package com.enterprise.devicemanagement.services

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.location.Location
import android.os.Build
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.enterprise.devicemanagement.DeviceManagementApp
import com.enterprise.devicemanagement.MainActivity
import com.enterprise.devicemanagement.R
import com.enterprise.devicemanagement.api.ApiService
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class LocationService : Service() {
    
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private val serviceScope = CoroutineScope(Dispatchers.IO + Job())
    private lateinit var apiService: ApiService
    private var deviceId: String = ""
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize location client
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        
        // Initialize Retrofit for API communication
        val retrofit = Retrofit.Builder()
            .baseUrl("https://your-backend-url.com/api/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        apiService = retrofit.create(ApiService::class.java)
        
        // Get device ID
        val sharedPrefs = getSharedPreferences("device_management_prefs", MODE_PRIVATE)
        deviceId = sharedPrefs.getString("device_id", "") ?: ""
        
        // Create location callback
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                locationResult.lastLocation?.let { location ->
                    // Send location to server
                    sendLocationToServer(location)
                }
            }
        }
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Create and show foreground notification
        val notification = createForegroundNotification()
        startForeground(NOTIFICATION_ID, notification)
        
        // Start location updates
        startLocationUpdates()
        
        return START_STICKY
    }
    
    private fun startLocationUpdates() {
        try {
            // Create location request
            val locationRequest = LocationRequest.Builder(
                Priority.PRIORITY_BALANCED_POWER_ACCURACY,
                15 * 60 * 1000 // 15 minutes interval
            ).apply {
                setMinUpdateDistanceMeters(100f) // 100 meters
                setWaitForAccurateLocation(false)
            }.build()
            
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
        } catch (e: SecurityException) {
            // Handle permission not granted
            e.printStackTrace()
        }
    }
    
    private fun sendLocationToServer(location: Location) {
        serviceScope.launch {
            try {
                val locationData = mapOf(
                    "deviceId" to deviceId,
                    "latitude" to location.latitude,
                    "longitude" to location.longitude,
                    "accuracy" to location.accuracy,
                    "timestamp" to location.time
                )
                
                apiService.sendLocation(locationData)
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
        
        return NotificationCompat.Builder(this, DeviceManagementApp.LOCATION_CHANNEL_ID)
            .setContentTitle("Location Tracking")
            .setContentText("Your location is being monitored")
            .setSmallIcon(R.drawable.ic_location)
            .setContentIntent(pendingIntent)
            .build()
    }
    
    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
    
    override fun onDestroy() {
        super.onDestroy()
        
        // Stop location updates
        fusedLocationClient.removeLocationUpdates(locationCallback)
        
        // Restart service if it gets destroyed
        val broadcastIntent = Intent("com.enterprise.devicemanagement.RESTART_SERVICE")
        sendBroadcast(broadcastIntent)
    }
    
    companion object {
        private const val NOTIFICATION_ID = 2
    }
}
