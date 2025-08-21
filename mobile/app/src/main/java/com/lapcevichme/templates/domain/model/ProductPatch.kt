package com.lapcevichme.templates.domain.model

import com.lapcevichme.templates.domain.model.enums.ProductCondition
import com.lapcevichme.templates.domain.model.enums.ProductStatus

data class  ProductPatch(
    val brand: String? = null,
    val partNumber: String? = null,
    val price: Double? = null,
    val condition: ProductCondition? = null,
    val description: String? = null,
    val status: ProductStatus? = null
)
