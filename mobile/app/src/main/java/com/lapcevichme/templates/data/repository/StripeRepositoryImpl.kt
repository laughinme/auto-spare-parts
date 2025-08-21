package com.lapcevichme.templates.data.repository

import android.util.Log
import com.lapcevichme.templates.data.remote.ApiService
import com.lapcevichme.templates.data.remote.dto.StripeAccountSessionRequestDto
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.AppStripeRepository
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

private const val TAG = "AppStripeRepository"

class AppStripeRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : AppStripeRepository {

    override suspend fun getOnboardingClientSecret(): Resource<String> {
        Log.d(TAG, "getOnboardingClientSecret called")
        return try {
            // --- ШАГ 1: Создаем Stripe аккаунт ---
            Log.d(TAG, "Step 1: Creating Stripe account...")
            val accountResponse = apiService.createStripeAccount()

            if (!accountResponse.isSuccessful || accountResponse.body() == null) {
                val errorBody = accountResponse.errorBody()?.stringSafely()
                Log.e(
                    TAG,
                    "Failed to create Stripe account. Code: ${accountResponse.code()}, Message: ${accountResponse.message()}, ErrorBody: $errorBody"
                )
                return Resource.Error(
                    errorBody
                        ?: "Не удалось создать Stripe аккаунт: ${accountResponse.message()} (${accountResponse.code()})"
                )
            }

            val accountId = accountResponse.body()!!.account
            Log.d(TAG, "Stripe account created successfully. Account ID: $accountId")

            // --- ШАГ 2: Создаем сессию для этого аккаунта ---
            Log.d(TAG, "Step 2: Creating Stripe account session for account ID: $accountId")
            val sessionRequest = StripeAccountSessionRequestDto(account = accountId)
            val sessionResponse = apiService.createStripeAccountSession(sessionRequest)

            if (sessionResponse.isSuccessful && sessionResponse.body() != null) {
                val clientSecret = sessionResponse.body()!!.clientSecret
                Log.d(TAG, "Stripe account session created successfully. Client secret received.")
                Resource.Success(clientSecret)
            } else {
                val errorBody = sessionResponse.errorBody()?.stringSafely()
                Log.e(
                    TAG,
                    "Failed to create Stripe account session. Code: ${sessionResponse.code()}, Message: ${sessionResponse.message()}, ErrorBody: $errorBody"
                )
                Resource.Error(
                    errorBody
                        ?: "Не удалось получить сессию Stripe: ${sessionResponse.message()} (${sessionResponse.code()})"
                )
            }

        } catch (e: HttpException) {
            Log.e(TAG, "getOnboardingClientSecret HttpException. Message: ${e.localizedMessage}", e)
            Resource.Error(e.localizedMessage ?: "Ошибка сети")
        } catch (e: IOException) {
            Log.e(TAG, "getOnboardingClientSecret IOException. Message: ${e.message}", e)
            Resource.Error("Не удалось подключиться к серверу.")
        } catch (e: Exception) { // Общий Exception для непредвиденных ошибок
            Log.e(TAG, "getOnboardingClientSecret general exception. Message: ${e.message}", e)
            Resource.Error(e.message ?: "Неизвестная ошибка при получении секрета Stripe.")
        }
    }
}