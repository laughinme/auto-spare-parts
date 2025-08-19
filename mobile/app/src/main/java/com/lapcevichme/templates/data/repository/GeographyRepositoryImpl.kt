package com.lapcevichme.templates.data.repository

import com.lapcevichme.templates.data.remote.ApiService
import com.lapcevichme.templates.data.remote.dto.toDomain
import com.lapcevichme.templates.domain.model.City
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.GeographyRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class GeographyRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : GeographyRepository {
    override fun getCities(): Flow<Resource<List<City>>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.listCities()
            if (response.isSuccessful) {
                val cities = response.body()?.map { it.toDomain() } ?: emptyList()
                emit(Resource.Success(cities))
            } else {
                emit(Resource.Error("Ошибка загрузки городов: ${response.code()}"))
            }
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Неизвестная ошибка"))
        }
    }
}

