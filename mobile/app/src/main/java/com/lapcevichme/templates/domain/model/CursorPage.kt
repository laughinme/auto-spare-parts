package com.lapcevichme.templates.domain.model

data class CursorPage<ProductModel>(
    val items: List<ProductModel>,
    val nextCursor: String? = null,
)
