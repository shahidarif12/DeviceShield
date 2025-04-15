package com.enterprise.devicemanagement

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.enterprise.devicemanagement.services.BackgroundService
import com.enterprise.devicemanagement.ui.screens.ConsentScreen
import com.enterprise.devicemanagement.ui.screens.MainScreen
import com.enterprise.devicemanagement.ui.theme.DeviceManagementTheme
import com.enterprise.devicemanagement.utils.PermissionUtils
import com.google.firebase.FirebaseApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Firebase
        FirebaseApp.initializeApp(this)
        
        setContent {
            DeviceManagementTheme {
                var hasConsent by remember { mutableStateOf(false) }
                var permissionsGranted by remember { mutableStateOf(false) }
                
                // Check if the user has already consented
                LaunchedEffect(key1 = Unit) {
                    val sharedPrefs = getSharedPreferences("device_management_prefs", MODE_PRIVATE)
                    hasConsent = sharedPrefs.getBoolean("user_consent", false)
                    
                    // Check permissions
                    permissionsGranted = PermissionUtils.checkAllPermissions(this@MainActivity)
                }
                
                if (!hasConsent) {
                    ConsentScreen(
                        onConsent = { 
                            val sharedPrefs = getSharedPreferences("device_management_prefs", MODE_PRIVATE)
                            sharedPrefs.edit().putBoolean("user_consent", true).apply()
                            hasConsent = true
                        }
                    )
                } else if (!permissionsGranted) {
                    // Request permissions
                    LaunchedEffect(key1 = Unit) {
                        PermissionUtils.requestAllPermissions(this@MainActivity)
                    }
                    
                    MainScreen(
                        permissionsGranted = false,
                        onRequestPermissions = {
                            PermissionUtils.requestAllPermissions(this@MainActivity)
                        }
                    )
                } else {
                    // Start the background service
                    LaunchedEffect(key1 = Unit) {
                        startBackgroundService()
                    }
                    
                    MainScreen(
                        permissionsGranted = true,
                        onRequestPermissions = {}
                    )
                }
            }
        }
    }
    
    private fun startBackgroundService() {
        val serviceIntent = Intent(this, BackgroundService::class.java)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        val permissionsGranted = PermissionUtils.checkAllPermissions(this)
        if (permissionsGranted) {
            startBackgroundService()
        }
    }
}
