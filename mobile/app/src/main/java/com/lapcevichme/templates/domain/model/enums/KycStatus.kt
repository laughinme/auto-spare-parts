package com.lapcevichme.templates.domain.model.enums

import com.google.gson.annotations.SerializedName

enum class KycStatus {
    @SerializedName("not_started")
    NOT_STARTED,

    @SerializedName("pending")
    PENDING,

    @SerializedName("verified")
    VERIFIED,

    @SerializedName("rejected")
    REJECTED
}