package com.lapcevichme.templates.domain.model.enums

import com.google.gson.annotations.SerializedName

enum class ProductStatus {
    @SerializedName("draft")
    DRAFT,

    @SerializedName("published")
    PUBLISHED,

    @SerializedName("archived")
    ARCHIVED
}