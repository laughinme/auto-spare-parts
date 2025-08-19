package com.lapcevichme.templates.domain.model

data class TokenPair(
    val accessToken: String,
    val refreshToken: String?
)