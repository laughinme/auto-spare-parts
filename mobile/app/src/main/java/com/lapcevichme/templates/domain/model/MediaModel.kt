package com.lapcevichme.templates.domain.model

import java.util.UUID

data class MediaModel(
    val id: String,
    val url: String,
    val alt: String?
)