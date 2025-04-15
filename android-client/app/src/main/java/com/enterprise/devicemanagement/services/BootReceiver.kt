package com.enterprise.devicemanagement.services

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class BootReceiver : BroadcastReceiver() {
    
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED,
            "android.intent.action.QUICKBOOT_POWERON",
            "com.htc.intent.action.QUICKBOOT_POWERON",
            "com.enterprise.devicemanagement.RESTART_SERVICE" -> {
                
                // Check if user has given consent
                val sharedPrefs = context.getSharedPreferences("device_management_prefs", Context.MODE_PRIVATE)
                val hasConsent = sharedPrefs.getBoolean("user_consent", false)
                
                if (hasConsent) {
                    // Start the background service
                    val serviceIntent = Intent(context, BackgroundService::class.java)
                    
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        context.startForegroundService(serviceIntent)
                    } else {
                        context.startService(serviceIntent)
                    }
                }
            }
        }
    }
}
