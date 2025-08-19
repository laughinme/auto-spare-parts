package com.lapcevichme.templates.data.remote

import kotlinx.coroutines.runBlocking
import okhttp3.Authenticator
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route
import javax.inject.Inject
import javax.inject.Provider

class TokenAuthenticator @Inject constructor(
    private val tokenManager: TokenManager,
    private val tokenRefreshApiService: Provider<TokenRefreshApiService>
) : Authenticator {

    override fun authenticate(route: Route?, response: Response): Request? {
        // Проверяем, не является ли запрос, вызвавший ошибку, запросом на выход
        if (response.request.url.encodedPath.endsWith("/api/v1/auth/logout")) {
            // Если да, то ошибка 401 ожидаема. Не пытаемся обновить токен.
            // Просто возвращаем null, чтобы запрос не повторялся.
            return null
        }

        // Используем runBlocking, так как метод authenticate должен быть синхронным
        return runBlocking {
            // Получаем старый refresh token
            val refreshToken = tokenManager.getFirstRefreshToken() ?: return@runBlocking null

            // Синхронно выполняем запрос на обновление токена
            val tokenResponse = tokenRefreshApiService.get()
                .refreshTokens("Bearer $refreshToken")

            if (tokenResponse.isSuccessful && tokenResponse.body() != null) {
                val newTokens = tokenResponse.body()!!
                // Сохраняем новые токены
                tokenManager.saveTokens(newTokens.accessToken, newTokens.refreshToken)
                // Повторяем исходный запрос с новым access token
                response.request.newBuilder()
                    .header("Authorization", "Bearer ${newTokens.accessToken}")
                    .build()
            } else {
                // Если обновить не удалось, выходим из системы (удаляем токены)
                tokenManager.clearTokens()
                null // Возвращаем null, чтобы прекратить попытки
            }
        }
    }
}