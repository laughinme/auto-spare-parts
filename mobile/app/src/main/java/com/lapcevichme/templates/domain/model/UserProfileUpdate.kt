package com.lapcevichme.templates.domain.model

data class UserProfileUpdate(
    val username: String?,
    val profilePicUrl: String?,
    val bio: String?,
    val languageCode: String?
)
