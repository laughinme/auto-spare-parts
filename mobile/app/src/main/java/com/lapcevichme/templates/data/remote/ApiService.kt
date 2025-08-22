package com.lapcevichme.templates.data.remote

import com.lapcevichme.templates.data.remote.dto.CityModelDto
import com.lapcevichme.templates.data.remote.dto.CursorPageDto
import com.lapcevichme.templates.data.remote.dto.OrganizationDto
import com.lapcevichme.templates.data.remote.dto.PageDto
import com.lapcevichme.templates.data.remote.dto.StripeAccountResponseDto
import com.lapcevichme.templates.data.remote.dto.StripeAccountSessionRequestDto
import com.lapcevichme.templates.data.remote.dto.StripeAccountSessionResponseDto
import com.lapcevichme.templates.data.remote.dto.TokenPairDto
import com.lapcevichme.templates.data.remote.dto.UserLoginRequest
import com.lapcevichme.templates.data.remote.dto.UserModelDto
import com.lapcevichme.templates.data.remote.dto.UserPatchRequest
import com.lapcevichme.templates.data.remote.dto.UserRegisterRequest
import com.lapcevichme.templates.data.remote.dto.ProductCreateDto
import com.lapcevichme.templates.data.remote.dto.ProductDto
import com.lapcevichme.templates.data.remote.dto.ProductPatchDto
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
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.DELETE


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

    /**
     * Получение информации об организации по ее ID.
     * Для этого эндпоинта требуется токен доступа.
     * @param orgId ID организации, информацию о которой нужно получить.
     * @return Модель организации OrganizationDto.
     */
    @GET("/api/v1/organizations/{org_id}/")
    suspend fun getOrganizationById(
        @Path("org_id") orgId: String
    ): Response<OrganizationDto>

    /**
     * Создание нового продукта в организации.
     * @param orgId ID организации.
     * @param request Тело запроса с данными для создания продукта.
     * @param idempotencyKey Ключ идемпотентности (опционально).
     */
    @POST("/api/v1/organizations/{org_id}/products")
    suspend fun createProduct(
        @Path("org_id") orgId: String,
        @Body request: ProductCreateDto,
        @Header("Idempotency-Key") idempotencyKey: String? = null
    ): Response<ProductDto>
    /**
     * Получение списка продуктов организации с фильтрами и пагинацией.
     * @param orgId ID организации.
     * @param offset Смещение от начала (по умолчанию 0).
     * @param limit Максимальное количество элементов (по умолчанию 20, макс. 100).
     * @param status Фильтр по статусу продукта (опционально).
     * @param q Поисковый запрос (опционально).
     */
    @GET("/api/v1/organizations/{org_id}/products")
    suspend fun listOrganizationProducts(
        @Path("org_id") orgId: String,
        @Query("offset") offset: Int = 0,
        @Query("limit") limit: Int = 20,
        @Query("status") status: String? = null,
        @Query("q") q: String? = null
    ): Response<PageDto<ProductDto>>

    /**
     * Получение деталей продукта в контексте организации.
     * @param orgId ID организации.
     * @param productId ID продукта.
     */
    @GET("/api/v1/organizations/{org_id}/{product_id}/")
    suspend fun getOrganizationProductDetails(
        @Path("org_id") orgId: String,
        @Path("product_id") productId: String
    ): Response<ProductDto>

    /**
     * Частичное обновление продукта организации.
     * @param orgId ID организации.
     * @param productId ID продукта.
     * @param request Тело запроса с полями для обновления.
     */
    @PATCH("/api/v1/organizations/{org_id}/{product_id}/")
    suspend fun patchOrganizationProduct(
        @Path("org_id") orgId: String,
        @Path("product_id") productId: String,
        @Body request: ProductPatchDto
    ): Response<ProductDto>

    /**
     * Удаление продукта организации.
     * @param orgId ID организации.
     * @param productId ID продукта.
     */
    @DELETE("/api/v1/organizations/{org_id}/{product_id}/")
    suspend fun deleteOrganizationProduct(
        @Path("org_id") orgId: String,
        @Path("product_id") productId: String
    ): Response<Unit> // Ответ 204 без тела

    /**
     * Загрузка фотографии продукта.
     * @param orgId ID организации.
     * @param productId ID продукта.
     * @param file Файл изображения в формате MultipartBody.Part.
     */
    @Multipart
    @PUT("/api/v1/organizations/{org_id}/{product_id}/media")
    suspend fun uploadProductPhoto(
        @Path("org_id") orgId: String,
        @Path("product_id") productId: String,
        @Part file: MultipartBody.Part
    ): Response<ProductDto>

    /**
     * Удаление медиафайла продукта.
     * @param orgId ID организации.
     * @param productId ID продукта.
     * @param mediaId ID медиафайла.
     */
    @DELETE("/api/v1/organizations/{org_id}/{product_id}/media/{media_id}")
    suspend fun deleteProductMediaFile(
        @Path("org_id") orgId: String,
        @Path("product_id") productId: String,
        @Path("media_id") mediaId: String
    ): Response<Unit> // Ответ 204 без тела

    /**
     * Публикация продукта (сделать видимым в публичном каталоге).
     * @param orgId ID организации.
     * @param productId ID продукта.
     */
    @POST("/api/v1/organizations/{org_id}/{product_id}/publish")
    suspend fun publishProduct(
        @Path("org_id") orgId: String,
        @Path("product_id") productId: String
    ): Response<ProductDto>

    /**
     * Снятие продукта с публикации (скрыть из публичного каталога).
     * @param orgId ID организации.
     * @param productId ID продукта.
     */
    @POST("/api/v1/organizations/{org_id}/{product_id}/unpublish")
    suspend fun unpublishProduct(
        @Path("org_id") orgId: String,
        @Path("product_id") productId: String
    ): Response<ProductDto>

    @GET("api/v1/organizations/my")
    suspend fun getMyOrganizations(): List<OrganizationDto>

    /**
     * Поиск по публичному каталогу продуктов с курсорной пагинацией.
     * @param limit Максимальное количество элементов.
     * @param cursor Курсор для следующей страницы.
     * @param q Поисковый запрос.
     * @param brand Фильтр по бренду.
     * @param condition Фильтр по состоянию ('new' или 'used').
     * @param priceMin Минимальная цена.
     * @param priceMax Максимальная цена.
     */
    @GET("/api/v1/products/catalog")
    suspend fun searchProductsCatalog(
        @Query("limit") limit: Int = 20,
        @Query("cursor") cursor: String? = null,
        @Query("q") q: String? = null,
        @Query("brand") brand: String? = null,
        @Query("condition") condition: String? = null, // "new" or "used"
        @Query("price_min") priceMin: Double? = null,
        @Query("price_max") priceMax: Double? = null
    ): Response<CursorPageDto<ProductDto>>

    /**
     * Получение ленты продуктов с курсорной пагинацией.
     * @param limit Максимальное количество элементов.
     * @param cursor Курсор для следующей страницы.
     */
    @GET("/api/v1/products/feed")
    suspend fun getProductsFeed(
        @Query("limit") limit: Int = 20,
        @Query("cursor") cursor: String? = null
    ): Response<CursorPageDto<ProductDto>>

    /**
     * Получение детальной информации о публичном продукте.
     * @param productId ID продукта.
     */
    @GET("/api/v1/products/{product_id}")
    suspend fun getProductDetails(
        @Path("product_id") productId: String
    ): Response<ProductDto>
}