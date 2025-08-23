package com.lapcevichme.templates.data.repository

import android.util.Log
import com.lapcevichme.templates.data.remote.ApiService
import com.lapcevichme.templates.data.remote.dto.toDomain
import com.lapcevichme.templates.domain.model.City
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.GeographyRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

private const val TAG = "GeographyRepositoryImpl"

class GeographyRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : GeographyRepository {
    override fun getCities(): Flow<Resource<List<City>>> = flow {
        Log.d(TAG, "getCities called")
        emit(Resource.Loading())
        try {
            val response = apiService.listCities()
            if (response.isSuccessful) {
                val cities = response.body()?.map { it.toDomain() } ?: emptyList()
                Log.d(TAG, "getCities successful. Loaded ${cities.size} cities.")
                emit(Resource.Success(cities))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "getCities failed. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(Resource.Error(errorBody ?: "Ошибка загрузки городов: ${response.code()}"))
            }
        } catch (e: HttpException) {
            Log.e(TAG, "getCities HttpException. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Ошибка сети при загрузке городов"))
        } catch (e: IOException) {
            Log.e(TAG, "getCities IOException. Message: ${e.message}", e)
            emit(Resource.Error("Не удалось подключиться к серверу для загрузки городов."))
        } catch (e: Exception) {
            Log.e(TAG, "getCities general exception. Message: ${e.message}", e)
            emit(Resource.Error(e.message ?: "Неизвестная ошибка при загрузке городов"))
        }
    }
}