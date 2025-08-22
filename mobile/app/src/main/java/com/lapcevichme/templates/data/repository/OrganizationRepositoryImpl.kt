package com.lapcevichme.templates.data.repository

import com.lapcevichme.templates.data.remote.ApiService
import com.lapcevichme.templates.data.remote.dto.toDomain
import com.lapcevichme.templates.domain.model.OrganizationModel
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.OrganizationRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class OrganizationRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : OrganizationRepository {

    override suspend fun getMyOrganizations(): Flow<Resource<List<OrganizationModel>>> = flow {
        // 1. Сообщаем UI, что загрузка началась
        emit(Resource.Loading())

        try {
            // 2. Выполняем сетевой запрос
            val organizationsDto = apiService.getMyOrganizations()

            // 3. Преобразуем DTO в доменные модели и отправляем в UI
            emit(Resource.Success(organizationsDto.map { it.toDomain() }))

        } catch (e: HttpException) {
            // Ошибка HTTP (например, 404 Not Found, 500 Server Error)
            emit(Resource.Error(
                message = "Ошибка при загрузке: ${e.message()}",
                // можно также передать e.code()
            ))
        } catch (e: IOException) {
            // Ошибка ввода-вывода (например, нет подключения к интернету)
            emit(Resource.Error(
                message = "Не удалось подключиться к серверу. Проверьте интернет-соединение."
            ))
        } catch (e: Exception) {
            // Любая другая непредвиденная ошибка
            emit(Resource.Error(
                message = e.localizedMessage ?: "Произошла неизвестная ошибка"
            ))
        }
    }

    override suspend fun getOrganizationById(id: String): Flow<Resource<OrganizationModel>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.getOrganizationById(id) // Получаем Response<OrganizationDto>
            if (response.isSuccessful) {
                response.body()?.let { organizationDto ->
                    emit(Resource.Success(organizationDto.toDomain())) // Вызываем toDomain() на OrganizationDto
                } ?: emit(Resource.Error("Тело ответа пустое")) // Обработка случая, когда тело null
            } else {
                // Обработка неуспешного HTTP ответа (хотя HttpException обычно это делает)
                emit(Resource.Error(
                    message = "Ошибка при загрузке: ${response.message()}",
                ))
            }
        } catch (e: HttpException) {
            emit(Resource.Error(
                message = "Ошибка при загрузке: ${e.message()}",
            ))
        } catch (e: IOException) {
            emit(Resource.Error(
                message = "Не удалось подключиться к серверу. Проверьте интернет-соединение."
            ))
        } catch (e: Exception) {
            emit(Resource.Error(
                message = e.localizedMessage ?: "Произошла неизвестная ошибка"
            ))
        }
    }
}
