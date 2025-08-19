package com.lapcevichme.templates.data.remote.dto

import com.google.gson.annotations.SerializedName

// DTO для ответа от /account
data class StripeAccountResponseDto(
    val account: String
)

// DTO для запроса на /account_session
data class StripeAccountSessionRequestDto(
    val account: String
)

data class StripeAccountSessionResponseDto(
    // Указываем точное имя поля из JSON
    @SerializedName("client_secret")
    val clientSecret: String
)