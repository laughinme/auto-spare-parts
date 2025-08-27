package com.lapcevichme.templates.domain.model

import com.lapcevichme.templates.domain.model.enums.ProductCondition
import com.lapcevichme.templates.domain.model.enums.ProductOriginality
import com.lapcevichme.templates.domain.model.enums.ProductStatus
import com.lapcevichme.templates.domain.model.enums.StockType

data class ProductPatch(
    val title: String? = null,
    val description: String? = null,
    val makeId: Int? = null, // Changed from brand
    val partNumber: String? = null,
    val price: Double? = null, // In DTO, this will be String?
    val stockType: StockType? = null,
    val quantity: Int? = null,
    val condition: ProductCondition? = null,
    val originality: ProductOriginality? = null,
    val status: ProductStatus? = null,
    val allowCart: Boolean? = null,
    val allowChat: Boolean? = null
)
