package com.enterprise.devicemanagement.utils

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

object PermissionUtils {
    
    private val REQUIRED_PERMISSIONS = arrayOf(
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.READ_CALL_LOG,
        Manifest.permission.READ_SMS,
        Manifest.permission.READ_EXTERNAL_STORAGE
    )
    
    private val REQUIRED_PERMISSIONS_API_33 = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.READ_CALL_LOG,
            Manifest.permission.READ_SMS,
            Manifest.permission.READ_MEDIA_IMAGES,
            Manifest.permission.READ_MEDIA_VIDEO,
            Manifest.permission.READ_MEDIA_AUDIO,
            Manifest.permission.POST_NOTIFICATIONS
        )
    } else {
        REQUIRED_PERMISSIONS
    }
    
    private const val PERMISSIONS_REQUEST_CODE = 10
    
    fun checkAllPermissions(context: Context): Boolean {
        val permissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            REQUIRED_PERMISSIONS_API_33
        } else {
            REQUIRED_PERMISSIONS
        }
        
        for (permission in permissions) {
            if (ContextCompat.checkSelfPermission(context, permission) != PackageManager.PERMISSION_GRANTED) {
                return false
            }
        }
        
        // Check for notification listener permission
        val enabledNotificationListeners = Settings.Secure.getString(
            context.contentResolver,
            "enabled_notification_listeners"
        )
        
        val packageName = context.packageName
        return enabledNotificationListeners?.contains(packageName) == true
    }
    
    fun requestAllPermissions(activity: Activity) {
        val permissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            REQUIRED_PERMISSIONS_API_33
        } else {
            REQUIRED_PERMISSIONS
        }
        
        ActivityCompat.requestPermissions(
            activity,
            permissions,
            PERMISSIONS_REQUEST_CODE
        )
        
        // For notification listener permission, we need to open settings
        val enabledNotificationListeners = Settings.Secure.getString(
            activity.contentResolver,
            "enabled_notification_listeners"
        )
        
        val packageName = activity.packageName
        if (enabledNotificationListeners?.contains(packageName) != true) {
            // Open notification listener settings
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
            activity.startActivity(intent)
        }
    }
    
    fun openAppSettings(context: Context) {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
        val uri = Uri.fromParts("package", context.packageName, null)
        intent.data = uri
        context.startActivity(intent)
    }
}
