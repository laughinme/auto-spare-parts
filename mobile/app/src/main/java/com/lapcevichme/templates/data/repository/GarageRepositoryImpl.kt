package com.lapcevichme.templates.data.repository

import android.util.Log
import com.lapcevichme.templates.data.remote.ApiService
import com.lapcevichme.templates.data.remote.dto.toDomain
import com.lapcevichme.templates.data.remote.dto.toDto
import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.MakeModel
import com.lapcevichme.templates.domain.model.VehicleCreate
import com.lapcevichme.templates.domain.model.VehicleModel
import com.lapcevichme.templates.domain.model.VehicleModelInfo
import com.lapcevichme.templates.domain.model.VehiclePatch
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

    override fun getVehicle(vehicleId: String): Flow<Resource<VehicleModel>> = flow {
        Log.d(TAG, "getVehicle called with vehicleId: $vehicleId")
        emit(Resource.Loading())
        try {
            val response = apiService.getVehicleFromGarage(vehicleId = vehicleId) // Предполагаем, что этот метод есть в ApiService
            if (response.isSuccessful && response.body() != null) {
                Log.d(TAG, "getVehicle successful for vehicleId: $vehicleId")
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "getVehicle failed for vehicleId: $vehicleId. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(Resource.Error(errorBody ?: "Failed to get vehicle: ${response.code()}"))
            }
        } catch (e: HttpException) {
            Log.e(TAG, "getVehicle HttpException for vehicleId: $vehicleId. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "getVehicle IOException for vehicleId: $vehicleId. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun updateVehicle(vehicleId: String, vehiclePatch: VehiclePatch): Flow<Resource<VehicleModel>> = flow {
        Log.d(TAG, "updateVehicle called with vehicleId: $vehicleId, data: $vehiclePatch")
        emit(Resource.Loading())
        try {
            // Предполагаем, что VehiclePatch (domain) имеет toDto() для VehiclePatchDto
            val response = apiService.updateVehicleInGarage(vehicleId = vehicleId, vehiclePatchDto = vehiclePatch.toDto())
            if (response.isSuccessful && response.body() != null) {
                Log.d(TAG, "updateVehicle successful for vehicleId: $vehicleId")
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "updateVehicle failed for vehicleId: $vehicleId. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(Resource.Error(errorBody ?: "Failed to update vehicle: ${response.code()}"))
            }
        } catch (e: HttpException) {
            Log.e(TAG, "updateVehicle HttpException for vehicleId: $vehicleId. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "updateVehicle IOException for vehicleId: $vehicleId. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun deleteVehicle(vehicleId: String): Flow<Resource<Unit>> = flow {
        Log.d(TAG, "deleteVehicle called with vehicleId: $vehicleId")
        emit(Resource.Loading())
        try {
            val response = apiService.deleteVehicleFromGarage(vehicleId = vehicleId)
            if (response.isSuccessful) {
                Log.d(TAG, "deleteVehicle successful for vehicleId: $vehicleId")
                emit(Resource.Success(Unit))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "deleteVehicle failed for vehicleId: $vehicleId. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(Resource.Error(errorBody ?: "Failed to delete vehicle: ${response.code()}"))
            }
        } catch (e: HttpException) {
            Log.e(TAG, "deleteVehicle HttpException for vehicleId: $vehicleId. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "deleteVehicle IOException for vehicleId: $vehicleId. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override suspend fun getVehiclesMakes(query: String?): Flow<Resource<List<MakeModel>>> = flow {
        Log.d(TAG, "getVehiclesMakes called with query: $query")
        emit(Resource.Loading())
        try {
            val response = apiService.listMakes(search = query)
            if (response.isSuccessful && response.body() != null) {
                Log.d(TAG, "getVehiclesMakes successful. Count: ${response.body()!!.size}")
                emit(Resource.Success(response.body()!!.map { it.toDomain() }))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "getVehiclesMakes failed. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(Resource.Error(errorBody ?: "Failed to get vehicles makes: ${response.code()}"))
            }
        } catch (e: HttpException) {
            Log.e(TAG, "getVehiclesMakes HttpException. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "getVehiclesMakes IOException. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override suspend fun getVehiclesModels(makeId: Int, query: String?): Flow<Resource<List<VehicleModelInfo>>> = flow {
        Log.d(TAG, "getVehiclesModels called with makeId: $makeId, query: $query")
        emit(Resource.Loading())
        try {
            val response = apiService.listModels(makeId = makeId, search = query)
            if (response.isSuccessful && response.body() != null) {
                Log.d(TAG, "getVehiclesModels successful for makeId: $makeId. Count: ${response.body()!!.size}")
                emit(Resource.Success(response.body()!!.map { it.toDomain() }))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "getVehiclesModels failed for makeId: $makeId. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(Resource.Error(errorBody ?: "Failed to get vehicles models: ${response.code()}"))
            }
        } catch (e: HttpException) {
            Log.e(TAG, "getVehiclesModels HttpException for makeId: $makeId. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "getVehiclesModels IOException for makeId: $makeId. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override suspend fun getVehiclesYears(modelId: Int): Flow<Resource<List<Int>>> = flow {
        Log.d(TAG, "getVehiclesYears called with modelId: $modelId")
        emit(Resource.Loading())
        try {
            val response = apiService.listYears(modelId = modelId)
            if (response.isSuccessful && response.body() != null) {
                Log.d(TAG, "getVehiclesYears successful for modelId: $modelId. Count: ${response.body()!!.size}")
                emit(Resource.Success(response.body()!!))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "getVehiclesYears failed for modelId: $modelId. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(Resource.Error(errorBody ?: "Failed to get vehicles years: ${response.code()}"))
            }
        } catch (e: HttpException) {
            Log.e(TAG, "getVehiclesYears HttpException for modelId: $modelId. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "getVehiclesYears IOException for modelId: $modelId. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }
}
