package com.lapcevichme.templates.data.repository

import com.lapcevichme.templates.data.remote.ApiService
import com.lapcevichme.templates.data.remote.dto.StripeAccountSessionRequestDto
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.AppStripeRepository
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class AppStripeRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : AppStripeRepository {

    override suspend fun getOnboardingClientSecret(): Resource<String> {
        return try {
            // --- ШАГ 1: Создаем Stripe аккаунт ---
            val accountResponse = apiService.createStripeAccount()
            if (!accountResponse.isSuccessful || accountResponse.body() == null) {
                return Resource.Error("Не удалось создать Stripe аккаунт: ${accountResponse.message()}")
            }

            val accountId = accountResponse.body()!!.account

            // --- ШАГ 2: Создаем сессию для этого аккаунта ---
            val sessionRequest = StripeAccountSessionRequestDto(account = accountId)
            val sessionResponse = apiService.createStripeAccountSession(sessionRequest)

            if (sessionResponse.isSuccessful && sessionResponse.body() != null) {
                Resource.Success(sessionResponse.body()!!.clientSecret)
            } else {
                Resource.Error("Не удалось получить сессию Stripe: ${sessionResponse.message()}")
            }

        } catch (e: HttpException) {
            Resource.Error(e.localizedMessage ?: "Ошибка сети")
        } catch (e: IOException) {
            Resource.Error("Не удалось подключиться к серверу.")
        }
    }
}

