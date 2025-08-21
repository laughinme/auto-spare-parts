package com.lapcevichme.templates.domain.model

import com.google.gson.annotations.SerializedName

enum class ProductCondition {
    @SerializedName("new")
    NEW,

    @SerializedName("used")
    USED
}
