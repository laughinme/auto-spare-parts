package com.lapcevichme.templates.domain.model

import com.lapcevichme.templates.domain.model.enums.ProductCondition
import com.lapcevichme.templates.domain.model.enums.ProductStatus


data class ProductModel(
    val id: String,
    val organization: OrganizationModel?, // <-- ИЗМЕНЕНО НА NULLABLE
    val createdAt: String,
    val updatedAt: String?,
    val brand: String,
    val partNumber: String,
    val price: Double,
    val condition: ProductCondition,
    val description: String?,
    val status: ProductStatus,
    val media: List<MediaModel>
)
