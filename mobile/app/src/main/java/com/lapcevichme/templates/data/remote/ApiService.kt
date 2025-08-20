package com.lapcevichme.templates.data.remote

import com.lapcevichme.templates.data.remote.dto.CityModelDto
import com.lapcevichme.templates.data.remote.dto.StripeAccountResponseDto
import com.lapcevichme.templates.data.remote.dto.StripeAccountSessionRequestDto
import com.lapcevichme.templates.data.remote.dto.StripeAccountSessionResponseDto
import com.lapcevichme.templates.data.remote.dto.TokenPairDto
import com.lapcevichme.templates.data.remote.dto.UserLoginRequest
import com.lapcevichme.templates.data.remote.dto.UserModelDto
import com.lapcevichme.templates.data.remote.dto.UserPatchRequest
import com.lapcevichme.templates.data.remote.dto.UserRegisterRequest
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Multipart
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Part

interface ApiService {
    /**
     * Регистрация нового пользователя.
     * @param clientHeader Заголовок, указывающий тип клиента ("mobile").
     * @param request Тело запроса с данными для регистрации.
     */
    @POST("/api/v1/auth/register")
    suspend fun register(
        @Header("X-Client") clientHeader: String = "mobile",
        @Body request: UserRegisterRequest
    ): Response<TokenPairDto>

    /**
     * Аутентификация пользователя.
     * @param clientHeader Заголовок, указывающий тип клиента ("mobile").
     * @param request Тело запроса с учетными данными.
     */
    @POST("/api/v1/auth/login")
    suspend fun login(
        @Header("X-Client") clientHeader: String = "mobile",
        @Body request: UserLoginRequest
    ): Response<TokenPairDto>

    /**
     * Выход пользователя из системы.
     * Для этого эндпоинта требуется токен доступа в заголовке Authorization.
     */
    @POST("/api/v1/auth/logout")
    suspend fun logout(): Response<Unit> // Ответ 200 без тела

    /**
     * Получение информации о текущем пользователе.
     * Для этого эндпоинта требуется токен доступа.
     */
    @GET("/api/v1/users/me/")
    suspend fun getMe(): Response<UserModelDto>

    /**
     * Частично обновляет информацию о пользователе.
     * @param request Тело запроса с полями для обновления.
     */
    @PATCH("/api/v1/users/me/")
    suspend fun updateProfile(@Body request: UserPatchRequest): Response<UserModelDto>

    /**
     * Загружает файл изображения в качестве аватара пользователя.
     * @param file Файл изображения в формате MultipartBody.Part.
     * @return Обновленная модель пользователя с новым URL аватара.
     */
    @Multipart
    @PUT("/api/v1/users/me/picture")
    suspend fun updateProfilePicture(
        @Part file: MultipartBody.Part
    ): Response<UserModelDto>

    /**
     * Получение списка всех поддерживаемых городов.
     * @return Список моделей городов.
     */
    @GET("/api/v1/geo/cities/")
    suspend fun listCities(): Response<List<CityModelDto>>

    @POST("/api/v1/organizations/account")
    suspend fun createStripeAccount(): Response<StripeAccountResponseDto>

    @POST("/api/v1/organizations/account_session")
    suspend fun createStripeAccountSession(
        @Body request: StripeAccountSessionRequestDto
    ): Response<StripeAccountSessionResponseDto>
}