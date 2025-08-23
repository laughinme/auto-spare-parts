package com.lapcevichme.templates.domain.model

import com.lapcevichme.templates.domain.model.enums.ProductCondition
import com.lapcevichme.templates.domain.model.enums.ProductStatus

data class ProductCreate(
    val brand: String,
    val partNumber: String,
    val price: Double,
    val condition: ProductCondition,
    val description: String? = null,
    val status: ProductStatus = ProductStatus.DRAFT
)
