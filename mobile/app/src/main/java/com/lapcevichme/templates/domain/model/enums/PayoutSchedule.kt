package com.lapcevichme.templates.domain.model.enums

import com.google.gson.annotations.SerializedName

enum class PayoutSchedule {
    @SerializedName("daily")
    DAILY,

    @SerializedName("weekly")
    WEEKLY,

    @SerializedName("monthly")
    MONTHLY
}
