package com.lapcevichme.templates.data.repository

import android.util.Log
import com.lapcevichme.templates.data.remote.ApiService
import com.lapcevichme.templates.data.remote.TokenManager
import com.lapcevichme.templates.data.remote.dto.UserLoginRequest
import com.lapcevichme.templates.data.remote.dto.UserRegisterRequest
import com.lapcevichme.templates.data.remote.dto.toDomain
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.TokenPair
import com.lapcevichme.templates.domain.repository.AuthRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

private const val TAG = "AuthRepositoryImpl"

class AuthRepositoryImpl @Inject constructor(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) : AuthRepository {

    override fun login(request: UserLoginRequest): Flow<Resource<TokenPair>> = flow {
        Log.d(TAG, "login called with email: ${request.email}")
        emit(Resource.Loading())
        try {
            val response = apiService.login(request = request)
            if (response.isSuccessful && response.body() != null) {
                val tokenDto = response.body()!!
                tokenManager.saveTokens(tokenDto.accessToken, tokenDto.refreshToken)
                Log.d(TAG, "Login successful for email: ${request.email}, tokens saved.")
                emit(Resource.Success(tokenDto.toDomain()))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "Login failed for email: ${request.email}. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(Resource.Error(errorBody ?: "Ошибка входа. Код: ${response.code()}"))
            }
        } catch (e: HttpException) {
            Log.e(TAG, "Login HttpException for email: ${request.email}. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Ошибка сети"))
        } catch (e: IOException) {
            Log.e(TAG, "Login IOException for email: ${request.email}. Message: ${e.message}", e)
            emit(Resource.Error("Не удалось подключиться к серверу. Проверьте интернет-соединение."))
        }
    }

    override fun register(request: UserRegisterRequest): Flow<Resource<TokenPair>> = flow {
        Log.d(TAG, "register called with email: ${request.email}")
        emit(Resource.Loading())
        try {
            val response = apiService.register(request = request)
            if (response.isSuccessful && response.body() != null) {
                val tokenDto = response.body()!!
                tokenManager.saveTokens(tokenDto.accessToken, tokenDto.refreshToken)
                Log.d(TAG, "Registration successful for email: ${request.email}, tokens saved.")
                emit(Resource.Success(tokenDto.toDomain()))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "Registration failed for email: ${request.email}. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(Resource.Error(errorBody ?: "Ошибка регистрации. Код: ${response.code()}"))
            }
        } catch (e: HttpException) {
            Log.e(TAG, "Register HttpException for email: ${request.email}. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Ошибка сети"))
        } catch (e: IOException) {
            Log.e(TAG, "Register IOException for email: ${request.email}. Message: ${e.message}", e)
            emit(Resource.Error("Не удалось подключиться к серверу. Проверьте интернет-соединение."))
        }
    }

    override fun logout(): Flow<Resource<Unit>> = flow {
        Log.d(TAG, "logout called")
        emit(Resource.Loading())
        try {
            val response = apiService.logout()

            if (response.isSuccessful || response.code() == 401) {
                tokenManager.clearTokens()
                Log.d(TAG, "Logout successful (or token was already invalid). Code: ${response.code()}, Tokens cleared.")
                emit(Resource.Success(Unit))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "Logout error. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody. Tokens cleared.")
                tokenManager.clearTokens() // На всякий случай все равно чистим токены
                emit(Resource.Error(errorBody ?: "Unexpected logout error. Code: ${response.code()}"))
            }

        } catch (e: HttpException) {
            tokenManager.clearTokens() // В случае любой другой ошибки также чистим токены
            Log.e(TAG, "Logout HttpException. Message: ${e.localizedMessage}. Tokens cleared.", e)
            emit(Resource.Error(e.localizedMessage ?: "Произошла ошибка сети при выходе из системы"))
        } catch (e: IOException) {
            tokenManager.clearTokens()
            Log.e(TAG, "Logout IOException. Message: ${e.message}. Tokens cleared.", e)
            emit(Resource.Error("Не удалось подключиться к серверу для выхода. Токены очищены."))
        } catch (e: Exception) {
            tokenManager.clearTokens()
            Log.e(TAG, "Logout generic exception. Message: ${e.message}. Tokens cleared.", e)
            emit(Resource.Error(e.localizedMessage ?: "Произошла ошибка при выходе из системы"))
        }
    }
}
