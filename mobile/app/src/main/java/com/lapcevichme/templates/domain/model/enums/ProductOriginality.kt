package com.lapcevichme.templates.domain.model.enums

import com.google.gson.annotations.SerializedName

enum class ProductOriginality {
    @SerializedName("oem")
    OEM,
    @SerializedName("aftermarket")
    AFTERMARKET
}
