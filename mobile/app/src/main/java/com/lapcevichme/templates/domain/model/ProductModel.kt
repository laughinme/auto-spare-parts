package com.lapcevichme.templates.domain.model

import com.lapcevichme.templates.domain.model.MediaModel
import java.time.LocalDateTime
import java.util.UUID

data class ProductModel(
    val id: UUID,
    val orgId: UUID,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime?,
    val brand: String,
    val partNumber: String,
    val price: Double,
    val condition: ProductCondition,
    val description: String?,
    val status: ProductStatus,
    val media: List<MediaModel>
)
