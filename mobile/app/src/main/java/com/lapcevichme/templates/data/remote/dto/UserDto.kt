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
    @SerializedName("profile_pic_url") // Changed from avatar_url
    val profilePicUrl: String?,
    @SerializedName("bio")
    val bio: String?,
    @SerializedName("language_code") // Changed from language
    val languageCode: String?,
    @SerializedName("is_onboarded")
    val isOnboarded: Boolean,
    @SerializedName("banned")
    val isBanned: Boolean
    // Removed: birthDate, age, gender, city, latitude, longitude
)

/**
 * Тело запроса для обновления профиля пользователя.
 * Соответствует схеме UserPatch в Swagger.
 */
data class UserPatchRequest(
    @SerializedName("username")
    val username: String? = null,
    @SerializedName("profile_pic_url")
    val profilePicUrl: String? = null,
    @SerializedName("bio")
    val bio: String? = null,
    @SerializedName("language_code")
    val languageCode: String? = null
)


fun UserModelDto.toDomain(): UserProfile {
    return UserProfile(
        id = this.id,
        email = this.email,
        username = this.username,
        profilePicUrl = this.profilePicUrl,
        bio = this.bio,
        languageCode = this.languageCode,
        isOnboarded = this.isOnboarded,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        banned = this.isBanned
    )
}
