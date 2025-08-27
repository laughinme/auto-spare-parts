// com/lapcevichme/templates/data/remote/dto/ProductDto.kt

package com.lapcevichme.templates.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.lapcevichme.templates.domain.model.enums.ProductCondition
import com.lapcevichme.templates.domain.model.enums.ProductStatus
import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.MediaModel
import com.lapcevichme.templates.domain.model.ProductCreate
import com.lapcevichme.templates.domain.model.ProductPatch
import com.lapcevichme.templates.domain.model.enums.StockType
import com.lapcevichme.templates.domain.model.enums.ProductOriginality
// Assuming CursorPageDto is in this package, adjust if it's elsewhere, e.g., garage sub-package
import com.lapcevichme.templates.domain.model.OrganizationShare

data class ProductCreateDto(
    @SerializedName("title")
    val title: String,
    @SerializedName("make_id") 
    val makeId: Int,
    @SerializedName("part_number")
    val partNumber: String,
    @SerializedName("price")
    val price: String, 
    @SerializedName("stock_type")
    val stockType: String, 
    @SerializedName("quantity")
    val quantity: Int,
    @SerializedName("condition")
    val condition: String, 
    @SerializedName("originality")
    val originality: String, 
    @SerializedName("description")
    val description: String? = null,
    @SerializedName("status")
    val status: String = ProductStatus.DRAFT.name, 
    @SerializedName("allow_cart")
    val allowCart: Boolean,
    @SerializedName("allow_chat")
    val allowChat: Boolean? = true 
)

data class ProductDto(
    @SerializedName("id")
    val id: String,
    @SerializedName("title") 
    val title: String,
    @SerializedName("organization")
    val organization: OrganizationShareDto, 
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("updated_at")
    val updatedAt: String?,
    @SerializedName("make") 
    val make: MakeModelDto, 
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
    val media: List<MediaDto>,
    @SerializedName("stock_type")
    val stockType: String, 
    @SerializedName("quantity_on_hand")
    val quantityOnHand: Int,
    @SerializedName("originality")
    val originality: String, 
    @SerializedName("allow_cart")
    val allowCart: Boolean,
    @SerializedName("allow_chat")
    val allowChat: Boolean = true, 
    @SerializedName("is_in_stock")
    val isInStock: Boolean,
    @SerializedName("is_buyable")
    val isBuyable: Boolean
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
    @SerializedName("title") 
    val title: String? = null,
    @SerializedName("description")
    val description: String? = null,
    @SerializedName("make_id")
    val makeId: Int? = null,
    @SerializedName("part_number")
    val partNumber: String? = null,
    @SerializedName("price")
    val price: String? = null, 
    @SerializedName("stock_type")
    val stockType: String? = null, 
    @SerializedName("quantity") 
    val quantity: Int? = null,
    @SerializedName("condition")
    val condition: String? = null, 
    @SerializedName("originality")
    val originality: String? = null, 
    @SerializedName("status")
    val status: String? = null, 
    @SerializedName("allow_cart")
    val allowCart: Boolean? = null,
    @SerializedName("allow_chat")
    val allowChat: Boolean? = null
)

data class PageDto<T>( 
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
        title = this.title, 
        organization = this.organization.toDomain(),
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        make = this.make.toDomain(), 
        partNumber = this.partNumber,
        price = this.price,
        condition = this.condition, 
        description = this.description,
        status = this.status, 
        media = this.media.map { it.toDomain() },
        stockType = StockType.valueOf(this.stockType.uppercase()), 
        quantityOnHand = this.quantityOnHand,
        originality = ProductOriginality.valueOf(this.originality.uppercase()), 
        allowCart = this.allowCart,
        allowChat = this.allowChat,
        isInStock = this.isInStock,
        isBuyable = this.isBuyable
    )
}

// Mapper from Domain to DTO for ProductCreate
fun ProductCreate.toDto(): ProductCreateDto {
    return ProductCreateDto(
        title = this.title,
        makeId = this.makeId,
        partNumber = this.partNumber,
        price = this.price, 
        stockType = this.stockType.name.lowercase(),
        quantity = this.quantity,
        condition = this.condition.name.lowercase(),
        originality = this.originality.name.lowercase(),
        description = this.description,
        status = this.status.name.lowercase(),
        allowCart = this.allowCart,
        allowChat = this.allowChat 
    )
}

// Mapper from Domain to DTO for ProductPatch
fun ProductPatch.toDto(): ProductPatchDto {
    return ProductPatchDto(
        title = this.title,
        description = this.description,
        makeId = this.makeId,
        partNumber = this.partNumber,
        price = this.price?.toString(), 
        stockType = this.stockType?.name?.lowercase(),
        quantity = this.quantity,
        condition = this.condition?.name?.lowercase(),
        originality = this.originality?.name?.lowercase(),
        status = this.status?.name?.lowercase(),
        allowCart = this.allowCart,
        allowChat = this.allowChat
    )
}

// Specialized toDomain mapper for CursorPageDto<ProductDto>
fun CursorPageDto<ProductDto>.toDomain(): CursorPage<ProductModel> {
    return CursorPage(
        items = this.items.map { it.toDomain() }, // Uses ProductDto.toDomain()
        nextCursor = this.nextCursor
    )
}