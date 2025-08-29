package com.lapcevichme.templates.domain.repository

import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.MakeModel
import com.lapcevichme.templates.domain.model.VehicleCreate
import com.lapcevichme.templates.domain.model.VehicleModel
import com.lapcevichme.templates.domain.model.VehicleModelInfo
import com.lapcevichme.templates.domain.model.VehiclePatch
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

    fun getVehicle(
        vehicleId: String
    ): Flow<Resource<VehicleModel>>

    fun updateVehicle(
        vehicleId: String,
        vehiclePatch: VehiclePatch
    ): Flow<Resource<VehicleModel>>

    fun deleteVehicle(
        vehicleId: String
    ): Flow<Resource<Unit>>

    suspend fun getVehiclesMakes(query: String? = null): Flow<Resource<List<MakeModel>>>

    suspend fun getVehiclesModels(
        makeId: Int,
        query: String? = null
    ): Flow<Resource<List<VehicleModelInfo>>>

    suspend fun getVehiclesYears(
        modelId: Int
    ): Flow<Resource<List<Int>>>
}
