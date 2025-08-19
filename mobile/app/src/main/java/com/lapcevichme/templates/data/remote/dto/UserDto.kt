package com.lapcevichme.templates.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.lapcevichme.templates.domain.model.UserProfile

/**
 * Модель пользователя, получаемая от API.
 */
data class UserModelDto(
    @SerializedName("id")
    val id: String,
    @SerializedName("created_at")
    val createdAt: String, // Формат "date-time"
    @SerializedName("updated_at")
    val updatedAt: String?, // Формат "date-time"
    @SerializedName("email")
    val email: String,
    @SerializedName("username")
    val username: String?,
    @SerializedName("avatar_url")
    val avatarUrl: String?,
    @SerializedName("bio")
    val bio: String?,
    @SerializedName("birth_date")
    val birthDate: String?, // Формат "date"
    @SerializedName("age")
    val age: Int?,
    @SerializedName("gender")
    val gender: String?, // "male", "female", "unknown"
    @SerializedName("language")
    val language: String?,
    @SerializedName("city")
    val city: CityModelDto?,
    @SerializedName("latitude")
    val latitude: Double?,
    @SerializedName("longitude")
    val longitude: Double?,
    @SerializedName("is_onboarded")
    val isOnboarded: Boolean,
    @SerializedName("banned")
    val isBanned: Boolean
)

/**
 * Тело запроса для обновления профиля пользователя.
 * Соответствует схеме UserPatch в Swagger.
 */
data class UserPatchRequest(
    @SerializedName("username")
    val username: String? = null,
    @SerializedName("avatar_url")
    val avatarUrl: String? = null,
    @SerializedName("bio")
    val bio: String? = null,
    @SerializedName("birth_date")
    val birthDate: String? = null, // Формат "date"
    @SerializedName("gender")
    val gender: String? = null, // "male", "female", "unknown"
    @SerializedName("language")
    val language: String? = null,
    @SerializedName("city_id")
    val cityId: Int? = null,
    @SerializedName("latitude")
    val latitude: Double? = null,
    @SerializedName("longitude")
    val longitude: Double? = null
)


fun UserModelDto.toDomain(): UserProfile {
    return UserProfile(
        id = this.id,
        email = this.email,
        username = this.username,
        avatarUrl = this.avatarUrl,
        bio = this.bio,
        age = this.age,
        birthDate = this.birthDate,
        gender = this.gender,
        language = this.language,
        city = this.city?.toDomain(),
        latitude = this.latitude,
        longitude = this.longitude,
        isOnboarded = this.isOnboarded
    )
}
