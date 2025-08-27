package com.lapcevichme.templates.domain.model

import com.lapcevichme.templates.domain.model.enums.ProductCondition
import com.lapcevichme.templates.domain.model.enums.ProductOriginality
import com.lapcevichme.templates.domain.model.enums.ProductStatus
import com.lapcevichme.templates.domain.model.enums.StockType

data class ProductCreate(
    val title: String,
    val makeId: Int,
    val partNumber: String,
    val price: String, // Changed from Double to String
    val stockType: StockType,
    val quantity: Int,
    val condition: ProductCondition,
    val originality: ProductOriginality,
    val description: String? = null,
    val status: ProductStatus = ProductStatus.DRAFT,
    val allowCart: Boolean,
    val allowChat: Boolean = true // Default true as per OpenAPI
)
