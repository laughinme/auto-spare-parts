package com.lapcevichme.templates.domain.repository

import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.garage.VehicleCreate
import com.lapcevichme.templates.domain.model.garage.VehicleModel
import kotlinx.coroutines.flow.Flow

interface GarageRepository {

    fun addVehicleToGarage(
        vehicleData: VehicleCreate
    ): Flow<Resource<VehicleModel>>

    fun getGarageVehicles(
        limit: Int = 20,
        cursor: String? = null,
        search: String? = null,
        makeId: Int? = null,
        modelId: Int? = null
    ): Flow<Resource<CursorPage<VehicleModel>>>
}
