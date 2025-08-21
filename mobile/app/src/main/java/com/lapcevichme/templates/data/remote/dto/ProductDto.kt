package com.lapcevichme.templates.data.remote.dto

import com.google.gson.annotations.SerializedName

data class ProductCreateDto(
    @SerializedName("brand")
    val brand: String,
    @SerializedName("part_number")
    val partNumber: String,
    @SerializedName("price")
    val price: Double,
    @SerializedName("condition")
    val condition: String, // Используем String для соответствия ProductCondition
    @SerializedName("description")
    val description: String? = null,
    @SerializedName("status")
    val status: String = "DRAFT" // Используем String для соответствия ProductStatus
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
    val condition: String, // Используем String для соответствия ProductCondition
    @SerializedName("description")
    val description: String? = null,
    @SerializedName("status")
    val status: String = "DRAFT", // Используем String для соответствия ProductStatus
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
    val condition: String? = null, // Используем String для соответствия ProductCondition
    @SerializedName("description")
    val description: String? = null,
    @SerializedName("status")
    val status: String? = null // Используем String для соответствия ProductStatus
)

data class PageDto<ProductDto>(
    @SerializedName("items")
    val items: List<ProductDto>,
    @SerializedName("offset")
    val offset: Int,
    @SerializedName("limit")
    val limit: Int,
    @SerializedName("total")
    val total: Int
)


