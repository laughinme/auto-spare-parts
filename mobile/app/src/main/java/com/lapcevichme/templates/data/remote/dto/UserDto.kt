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
    val createdAt: String,
    @SerializedName("updated_at")
    val updatedAt: String?,
    @SerializedName("email")
    val email: String,
    @SerializedName("username")
    val username: String?,
    @SerializedName("profile_pic_url")
    val profilePicUrl: String?,
    @SerializedName("bio")
    val bio: String?,
    @SerializedName("languageCode")
    val languageCode: String?,
    @SerializedName("is_onboarded")
    val isOnboarded: Boolean,
    @SerializedName("banned")
    val isBanned: Boolean,
    @SerializedName("organization")
    val organization: OrganizationModelDto?
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
    @SerializedName("languageCode")
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
        banned = this.isBanned,
        organization = this.organization?.toDomain()
    )
}
