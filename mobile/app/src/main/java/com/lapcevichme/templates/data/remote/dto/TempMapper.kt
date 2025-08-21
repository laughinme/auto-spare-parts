package com.lapcevichme.templates.data.remote.dto

import com.lapcevichme.templates.domain.model.MediaModel
import com.lapcevichme.templates.domain.model.Page
import com.lapcevichme.templates.domain.model.ProductCondition
import com.lapcevichme.templates.domain.model.ProductCreate
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.ProductPatch
import com.lapcevichme.templates.domain.model.ProductStatus

fun ProductCreate.toDto(): ProductCreateDto {
    return ProductCreateDto(
        brand = this.brand,
        partNumber = this.partNumber,
        price = this.price,
        condition = this.condition.name.lowercase(), // Преобразуем в String
        description = this.description,
        status = this.status.name.lowercase() // Преобразуем в String
    )
}

fun String.toProductCondition(): ProductCondition {
    return ProductCondition.valueOf(this.uppercase())
}

fun String.toProductStatus(): ProductStatus {
    return ProductStatus.valueOf(this.uppercase())
}

fun ProductDto.toDomain(): ProductModel {
    return ProductModel(
        id = this.id,
        orgId = this.orgId,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        brand = this.brand,
        partNumber = this.partNumber,
        price = this.price,
        condition = this.condition.toProductCondition(), // Преобразуем из String
        description = this.description,
        status = this.status.toProductStatus(), // Преобразуем из String
        media = this.media.map { it.toDomain() }
    )
}

fun MediaDto.toDomain(): MediaModel {
    return MediaModel(
        id = this.id,
        url = this.url,
        alt = this.alt
    )
}

fun ProductPatch.toDto(): ProductPatchDto {
    return ProductPatchDto(
        brand = this.brand,
        partNumber = this.partNumber,
        price = this.price,
        condition = this.condition?.name, // Преобразуем в String
        description = this.description,
        status = this.status?.name // Преобразуем в String
    )
}

fun PageDto<ProductDto>.toDomain(): Page<ProductModel> {
    return Page(
        items = this.items.map { it.toDomain() },
        offset = this.offset,
        limit = this.limit,
        total = this.total
    )
}