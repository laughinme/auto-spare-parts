package com.lapcevichme.templates.domain.model



data class ProductModel(
    val id: String,
    val orgId: String,
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
