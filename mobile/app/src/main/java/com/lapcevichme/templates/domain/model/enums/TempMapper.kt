// com/lapcevichme/templates/data/remote/dto/ProductMappers.kt

package com.lapcevichme.templates.domain.model.enums

import com.lapcevichme.templates.data.remote.dto.MediaDto
import com.lapcevichme.templates.data.remote.dto.PageDto
import com.lapcevichme.templates.data.remote.dto.ProductCreateDto
import com.lapcevichme.templates.data.remote.dto.ProductDto
import com.lapcevichme.templates.data.remote.dto.ProductPatchDto
import com.lapcevichme.templates.data.remote.dto.toDomain
import com.lapcevichme.templates.domain.model.MediaModel
import com.lapcevichme.templates.domain.model.Page
import com.lapcevichme.templates.domain.model.ProductCreate
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.ProductPatch

// Простое присваивание. Gson сделает всю работу.
fun ProductCreate.toDto(): ProductCreateDto {
    return ProductCreateDto(
        brand = this.brand,
        partNumber = this.partNumber,
        price = this.price,
        condition = this.condition, // <-- Просто присваиваем enum
        description = this.description,
        status = this.status // <-- Просто присваиваем enum
    )
}

// Простое присваивание. Gson сделает всю работу.
fun ProductDto.toDomain(): ProductModel {
    return ProductModel(
        id = this.id,
        organization = this.organization?.toDomain(), // <-- ИЗМЕНЕНО НА SAFE CALL
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        brand = this.brand,
        partNumber = this.partNumber,
        price = this.price,
        condition = this.condition, // <-- Просто присваиваем enum
        description = this.description,
        status = this.status, // <-- Просто присваиваем enum
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

// Простое присваивание. Gson сделает всю работу.
fun ProductPatch.toDto(): ProductPatchDto {
    return ProductPatchDto(
        brand = this.brand,
        partNumber = this.partNumber,
        price = this.price,
        condition = this.condition, // <-- Просто присваиваем enum
        description = this.description,
        status = this.status // <-- Просто присваиваем enum
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
