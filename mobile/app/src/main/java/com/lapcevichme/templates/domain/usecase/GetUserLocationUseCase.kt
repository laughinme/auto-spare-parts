package com.lapcevichme.templates.domain.usecase

import android.location.Location
import com.example.hackathon.domain.location.LocationTracker
import com.lapcevichme.templates.domain.model.Resource
import javax.inject.Inject

class GetUserLocationUseCase @Inject constructor(
    private val locationTracker: LocationTracker
) {
    suspend operator fun invoke(): Resource<Location> {
        return locationTracker.getCurrentLocation()
    }
}