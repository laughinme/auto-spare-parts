package com.lapcevichme.templates.domain.model.enums

import com.google.gson.annotations.SerializedName

enum class StockType {
    @SerializedName("unique")
    UNIQUE,
    @SerializedName("stock")
    STOCK
}
