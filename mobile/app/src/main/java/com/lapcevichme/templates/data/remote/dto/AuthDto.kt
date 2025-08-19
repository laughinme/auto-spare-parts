package com.lapcevichme.templates.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.lapcevichme.templates.domain.model.TokenPair

/**
 * Тело запроса для входа пользователя.
 */
data class UserLoginRequest(
    @SerializedName("email")
    val email: String,
    @SerializedName("password")
    val password: String
)

/**
 * Тело запроса для регистрации пользователя.
 */
data class UserRegisterRequest(
    @SerializedName("email")
    val email: String,
    @SerializedName("password")
    val password: String,
    @SerializedName("username")
    val username: String? = null
)

/**
 * Ответ, содержащий пару токенов доступа и обновления.
 */
data class TokenPairDto(
    @SerializedName("access_token")
    val accessToken: String,
    @SerializedName("refresh_token")
    val refreshToken: String? // Может быть null для web-клиента
)

fun TokenPairDto.toDomain(): TokenPair {
    return TokenPair(
        accessToken = this.accessToken,
        refreshToken = this.refreshToken
    )
}