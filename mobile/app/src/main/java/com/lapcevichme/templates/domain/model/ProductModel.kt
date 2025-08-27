package com.lapcevichme.templates.domain.model

import com.lapcevichme.templates.domain.model.enums.ProductCondition
import com.lapcevichme.templates.domain.model.enums.ProductOriginality
import com.lapcevichme.templates.domain.model.enums.ProductStatus
import com.lapcevichme.templates.domain.model.enums.StockType
import com.lapcevichme.templates.domain.model.garage.MakeModel

data class ProductModel(
    val createdAt: String,
    val updatedAt: String?,
    val id: String,
    val title: String,
    val description: String?,
    val make: MakeModel,
    val partNumber: String,
    val price: Double,
    val stockType: StockType,
    val quantityOnHand: Int,
    val condition: ProductCondition,
    val originality: ProductOriginality,
    val organization: OrganizationShare,
    val status: ProductStatus,
    val media: List<MediaModel>,
    val allowCart: Boolean,
    val allowChat: Boolean = true,
    val isInStock: Boolean,
    val isBuyable: Boolean
)
