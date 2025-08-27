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

fun MediaDto.toDomain(): MediaModel {
    return MediaModel(
        id = this.id,
        url = this.url,
        alt = this.alt
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
