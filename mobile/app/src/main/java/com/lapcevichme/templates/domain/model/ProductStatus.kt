package com.lapcevichme.templates.domain.model

import com.google.gson.annotations.SerializedName

enum class ProductStatus {
    @SerializedName("draft")
    DRAFT,

    @SerializedName("published")
    PUBLISHED,

    @SerializedName("archived")
    ARCHIVED
}