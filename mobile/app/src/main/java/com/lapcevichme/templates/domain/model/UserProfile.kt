package com.lapcevichme.templates.domain.model

data class UserProfile(
    val id: String,
    val email: String,
    val username: String?,
    val profilePicUrl: String?,
    val bio: String?,
    val languageCode: String?,
    val isOnboarded: Boolean,
    val createdAt: String,
    val updatedAt: String?,
    val banned: Boolean
)
