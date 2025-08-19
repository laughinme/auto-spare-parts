package com.lapcevichme.templates.data.repository

import android.util.Log
import com.lapcevichme.templates.data.remote.ApiService
import com.lapcevichme.templates.data.remote.TokenManager
import com.lapcevichme.templates.data.remote.dto.TokenPairDto
import com.lapcevichme.templates.data.remote.dto.UserLoginRequest
import com.lapcevichme.templates.data.remote.dto.UserRegisterRequest
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.TokenPair
import com.lapcevichme.templates.domain.repository.AuthRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class AuthRepositoryImpl @Inject constructor(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) : AuthRepository {

    override fun login(request: UserLoginRequest): Flow<Resource<TokenPair>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.login(request = request)
            if (response.isSuccessful && response.body() != null) {
                val tokenDto = response.body()!!
                tokenManager.saveTokens(tokenDto.accessToken, tokenDto.refreshToken)
                emit(Resource.Success(tokenDto.toDomain()))
            } else {
                // Например, код 401 - неверные учетные данные
                val errorMsg = response.errorBody()?.string() ?: "Ошибка входа"
                emit(Resource.Error(errorMsg))
            }
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "Ошибка сети"))
        } catch (e: IOException) {
            emit(Resource.Error("Не удалось подключиться к серверу. Проверьте интернет-соединение."))
        }
    }

    override fun register(request: UserRegisterRequest): Flow<Resource<TokenPair>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.register(request = request)
            if (response.isSuccessful && response.body() != null) {
                val tokenDto = response.body()!!
                tokenManager.saveTokens(tokenDto.accessToken, tokenDto.refreshToken)
                emit(Resource.Success(tokenDto.toDomain()))
            } else {
                // Например, код 409 - пользователь уже существует
                val errorMsg = response.errorBody()?.string() ?: "Ошибка регистрации"
                emit(Resource.Error(errorMsg))
            }
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "Ошибка сети"))
        } catch (e: IOException) {
            emit(Resource.Error("Не удалось подключиться к серверу. Проверьте интернет-соединение."))
        }
    }

    override fun logout(): Flow<Resource<Unit>> = flow {
        emit(Resource.Loading())
        try {
            Log.d("AuthRepositoryImpl", "Trying to logout")
            val response = apiService.logout()

            // Считаем выход успешным, если сервер ответил 2xx ИЛИ 401 (токен недействителен)
            if (response.isSuccessful || response.code() == 401) {
                tokenManager.clearTokens()
                emit(Resource.Success(Unit))
                Log.d("AuthRepositoryImpl", "Logout successful (or token was already invalid)")
            } else {
                // Все остальные коды ответа считаем реальной ошибкой
                val errorMsg = response.errorBody()?.string() ?: "Unexpected logout error"
                // На всякий случай все равно чистим токены
                tokenManager.clearTokens()
                emit(Resource.Error(errorMsg))
                Log.d("AuthRepositoryImpl", "Logout error: $errorMsg")
            }

        } catch (e: Exception) {
            // В случае любой другой ошибки (например, нет сети) также чистим токены
            tokenManager.clearTokens()
            emit(Resource.Error(e.localizedMessage ?: "Произошла ошибка"))
        }
    }
}

// Простая функция-маппер для преобразования DTO в доменную модель
private fun TokenPairDto.toDomain(): TokenPair {
    return TokenPair(
        accessToken = this.accessToken,
        refreshToken = this.refreshToken
    )
}