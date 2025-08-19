package com.example.hackathon.domain.location

import android.Manifest
import android.app.Application
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import android.util.Log
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.lapcevichme.templates.domain.model.Resource
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.suspendCancellableCoroutine
import javax.inject.Inject

interface LocationTracker {
    suspend fun getCurrentLocation(): Resource<Location>
}

class LocationTrackerImpl @Inject constructor(
    private val locationClient: FusedLocationProviderClient,
    private val application: Application
) : LocationTracker {

    @OptIn(ExperimentalCoroutinesApi::class)
    override suspend fun getCurrentLocation(): Resource<Location> {
        // Проверяем, есть ли у нас разрешения
        val hasAccessFineLocationPermission = ContextCompat.checkSelfPermission(
            application,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val hasAccessCoarseLocationPermission = ContextCompat.checkSelfPermission(
            application,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        // Проверяем, включен ли GPS на устройстве
        val locationManager = application.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        val isGpsEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER) ||
                locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)

        if (!hasAccessCoarseLocationPermission || !hasAccessFineLocationPermission) {
            return Resource.Error("Разрешение на геолокацию не предоставлено")
        }
        if(!isGpsEnabled) {
            return Resource.Error("Пожалуйста, включите GPS")
        }

        // Используем suspendCancellableCoroutine для преобразования callback-API в suspend-функцию
        return suspendCancellableCoroutine { cont ->
            locationClient.lastLocation.apply {
                if (isComplete) {
                    if (isSuccessful) {
                        cont.resume(Resource.Success(result), null)
                    } else {
                        cont.resume(Resource.Error("Не удалось получить геолокацию"), null)
                    }
                    return@suspendCancellableCoroutine
                }
                addOnSuccessListener {
                    cont.resume(Resource.Success(it), null)
                    Log.d("LocationTracker", "Получена геолокация: $it")
                }
                addOnFailureListener {
                    cont.resume(Resource.Error("Не удалось получить геолокацию: ${it.message}"), null)
                }
                addOnCanceledListener {
                    cont.cancel()
                }
            }
        }
    }
}
