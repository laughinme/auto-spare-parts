// com/lapcevichme/templates/data/remote/dto/ProductDtos.kt

package com.lapcevichme.templates.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.lapcevichme.templates.domain.model.enums.ProductCondition
import com.lapcevichme.templates.domain.model.enums.ProductStatus
import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.enums.toDomain

data class ProductCreateDto(
    @SerializedName("brand")
    val brand: String,
    @SerializedName("part_number")
    val partNumber: String,
    @SerializedName("price")
    val price: Double,
    @SerializedName("condition")
    val condition: ProductCondition, // <-- Тип изменен
    @SerializedName("description")
    val description: String? = null,
    @SerializedName("status")
    val status: ProductStatus = ProductStatus.DRAFT // <-- Тип изменен
)

data class ProductDto(
    @SerializedName("id")
    val id: String,
    @SerializedName("org_id")
    val orgId: String,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("updated_at")
    val updatedAt: String?,
    @SerializedName("brand")
    val brand: String,
    @SerializedName("part_number")
    val partNumber: String,
    @SerializedName("price")
    val price: Double,
    @SerializedName("condition")
    val condition: ProductCondition, // <-- Тип изменен
    @SerializedName("description")
    val description: String? = null,
    @SerializedName("status")
    val status: ProductStatus, // <-- Тип изменен
    @SerializedName("media")
    val media: List<MediaDto>
)

data class MediaDto(
    @SerializedName("id")
    val id: String,
    @SerializedName("url")
    val url: String,
    @SerializedName("alt")
    val alt: String? = null
)

data class ProductPatchDto(
    @SerializedName("brand")
    val brand: String? = null,
    @SerializedName("part_number")
    val partNumber: String? = null,
    @SerializedName("price")
    val price: Double? = null,
    @SerializedName("condition")
    val condition: ProductCondition? = null, // <-- Тип изменен
    @SerializedName("description")
    val description: String? = null,
    @SerializedName("status")
    val status: ProductStatus? = null // <-- Тип изменен
)

data class PageDto<T>( // Используем Generic T вместо ProductDto
    @SerializedName("items")
    val items: List<T>,
    @SerializedName("offset")
    val offset: Int,
    @SerializedName("limit")
    val limit: Int,
    @SerializedName("total")
    val total: Int
)

data class CursorPageDto<ProductDto>(
    @SerializedName("items")
    val items: List<ProductDto>,
    @SerializedName("next_cursor")
    val next: String? = null,
)

fun CursorPageDto<ProductDto>.toDomain(): CursorPage<ProductModel> {
    return CursorPage(
        items = this.items.map { it.toDomain() },
        nextCursor = this.next
    )
}