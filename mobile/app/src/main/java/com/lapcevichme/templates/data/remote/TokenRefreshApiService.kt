package com.lapcevichme.templates.data.remote

import com.lapcevichme.templates.data.remote.dto.TokenPairDto
import retrofit2.Response
import retrofit2.http.Header
import retrofit2.http.POST

/**
 * Отдельный интерфейс только для эндпоинта обновления токенов.
 * Это помогает избежать проблем, когда AuthInterceptor пытается добавить
 * заголовок Authorization к запросу, который сам обновляет токен.
 */
interface TokenRefreshApiService {
    @POST("/api/v1/auth/refresh")
    suspend fun refreshTokens(@Header("Authorization") refreshToken: String): Response<TokenPairDto>
}