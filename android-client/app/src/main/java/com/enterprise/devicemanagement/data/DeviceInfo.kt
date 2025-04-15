package com.enterprise.devicemanagement.data

data class DeviceInfo(
    val id: String,
    val manufacturer: String,
    val model: String,
    val osVersion: String,
    val firebaseToken: String? = null,
    val lastSeen: Long,
    val batteryLevel: Int? = null,
    val isCharging: Boolean? = null,
    val networkType: String? = null,
    val availableStorage: Long? = null,
    val totalStorage: Long? = null
)
