package com.lapcevichme.templates.data.repository

import android.util.Log
import com.lapcevichme.templates.data.remote.ApiService
import com.lapcevichme.templates.data.remote.dto.toDomain
import com.lapcevichme.templates.data.remote.dto.toDto
import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.garage.VehicleCreate
import com.lapcevichme.templates.domain.model.garage.VehicleModel
import com.lapcevichme.templates.domain.repository.GarageRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GarageRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : GarageRepository {

    companion object {
        private const val TAG = "GarageRepositoryImpl"
    }

    override fun addVehicleToGarage(vehicleCreate: VehicleCreate): Flow<Resource<VehicleModel>> = flow {
        Log.d(TAG, "addVehicleToGarage called with makeId: ${vehicleCreate.makeId}, modelId: ${vehicleCreate.modelId}, year: ${vehicleCreate.year}")
        emit(Resource.Loading())
        try {
            // Assuming VehicleCreate (domain) has a toDto() method to convert to VehicleCreateDto
            val response = apiService.addVehicleToGarage(vehicleCreate.toDto())
            if (response.isSuccessful && response.body() != null) {
                Log.d(TAG, "addVehicleToGarage successful for makeId: ${vehicleCreate.makeId}, modelId: ${vehicleCreate.modelId}")
                // Assuming VehilceModelDto (data) has a toDomain() method
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "addVehicleToGarage failed for makeId: ${vehicleCreate.makeId}. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(Resource.Error(errorBody ?: "Failed to add vehicle: ${response.code()}"))
            }
        } catch (e: HttpException) {
            Log.e(TAG, "addVehicleToGarage HttpException for makeId: ${vehicleCreate.makeId}. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "addVehicleToGarage IOException for makeId: ${vehicleCreate.makeId}. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun getGarageVehicles(
        limit: Int,
        cursor: String?,
        search: String?,
        makeId: Int?,
        modelId: Int?
    ): Flow<Resource<CursorPage<VehicleModel>>> = flow {
        Log.d(TAG, "getGarageVehicles called with limit: $limit, cursor: $cursor, search: $search, makeId: $makeId, modelId: $modelId")
        emit(Resource.Loading())
        try {
            val response = apiService.listVehiclesInGarage(
                limit = limit,
                cursor = cursor,
                search = search,
                makeId = makeId,
                modelId = modelId
            )
            if (response.isSuccessful && response.body() != null) {
                Log.d(TAG, "getGarageVehicles successful. Items count: ${response.body()!!.items.size}")
                // Assuming CursorPageDto<VehilceModelDto> (data) has a toDomain() method
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "getGarageVehicles failed. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(Resource.Error(errorBody ?: "Failed to get garage vehicles: ${response.code()}"))
            }
        } catch (e: HttpException) {
            Log.e(TAG, "getGarageVehicles HttpException. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "getGarageVehicles IOException. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }
}
