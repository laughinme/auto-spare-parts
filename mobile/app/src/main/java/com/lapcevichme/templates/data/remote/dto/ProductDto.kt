// com/lapcevichme/templates/data/remote/dto/ProductDtos.kt

package com.lapcevichme.templates.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.lapcevichme.templates.domain.model.enums.ProductCondition
import com.lapcevichme.templates.domain.model.enums.ProductStatus
import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.MediaModel
import com.lapcevichme.templates.domain.model.OrganizationModel
import com.lapcevichme.templates.domain.model.OrganizationShare

// Removed: import com.lapcevichme.templates.domain.model.enums.toDomain // Not used directly here, and was causing an error if it was for a specific enum not present.

data class ProductCreateDto(
    @SerializedName("brand")
    val brand: String,
    @SerializedName("part_number")
    val partNumber: String,
    @SerializedName("price")
    val price: Double,
    @SerializedName("condition")
    val condition: ProductCondition,
    @SerializedName("description")
    val description: String? = null,
    @SerializedName("status")
    val status: ProductStatus = ProductStatus.DRAFT
)

data class ProductDto(
    @SerializedName("id")
    val id: String,
    @SerializedName("organization")
    val organization: OrganizationShare,
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
    val condition: ProductCondition,
    @SerializedName("description")
    val description: String? = null,
    @SerializedName("status")
    val status: ProductStatus,
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
    val condition: ProductCondition? = null,
    @SerializedName("description")
    val description: String? = null,
    @SerializedName("status")
    val status: ProductStatus? = null
)

data class PageDto<T>( // Used for non-cursor pagination if needed elsewhere
    @SerializedName("items")
    val items: List<T>,
    @SerializedName("offset")
    val offset: Int,
    @SerializedName("limit")
    val limit: Int,
    @SerializedName("total")
    val total: Int
)

fun MediaDto.toDomain(): MediaModel {
    return MediaModel(
        id = this.id,
        url = this.url,
        alt = this.alt
    )
}

fun ProductDto.toDomain(): ProductModel {
    return ProductModel(
        id = this.id,
        organization = this.organization,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        brand = this.brand,
        partNumber = this.partNumber,
        price = this.price,
        condition = this.condition, // Direct mapping as enum types match
        description = this.description,
        status = this.status, // Direct mapping as enum types match
        media = this.media.map { it.toDomain() }
    )
}

// Ensure CursorPageDto is imported if not in the same file (it's in GarageDtos.kt)
// import com.lapcevichme.templates.data.remote.dto.CursorPageDto 

fun CursorPageDto<ProductDto>.toDomain(): CursorPage<ProductModel> {
    return CursorPage(
        items = this.items.map { it.toDomain() },
        nextCursor = this.nextCursor // Assumes 'nextCursor' is the field in the generic CursorPageDto
    )
}
