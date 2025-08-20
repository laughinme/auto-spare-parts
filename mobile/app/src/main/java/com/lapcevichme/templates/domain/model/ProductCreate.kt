package com.lapcevichme.templates.domain.model

data class ProductCreate(
    val brand: String,
    val partNumber: String,
    val price: Double,
    val condition: ProductCondition,
    val description: String? = null,
    val status: ProductStatus = ProductStatus.DRAFT
)
