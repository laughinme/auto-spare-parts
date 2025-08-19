package com.lapcevichme.templates.data.repository

import com.lapcevichme.templates.data.remote.ApiService
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.AppStripeRepository
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class AppStripeRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : AppStripeRepository {

    override suspend fun getOnboardingClientSecret(): Resource<String> {
        // Здесь не нужен flow { ... }, так как это одноразовый запрос
        return try {
            val response = apiService.createStripeAccountSession()
            if (response.isSuccessful && response.body() != null) {
                Resource.Success(response.body()!!.clientSecret)
            } else {
                Resource.Error(response.message() ?: "Не удалось получить сессию Stripe")
            }
        } catch (e: HttpException) {
            Resource.Error(e.localizedMessage ?: "Ошибка сети")
        } catch (e: IOException) {
            Resource.Error("Не удалось подключиться к серверу.")
        }
    }
}
