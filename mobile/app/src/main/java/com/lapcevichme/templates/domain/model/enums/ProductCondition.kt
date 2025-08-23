package com.lapcevichme.templates.domain.model.enums

import com.google.gson.annotations.SerializedName

enum class ProductCondition {
    @SerializedName("new")
    NEW,

    @SerializedName("used")
    USED
}
