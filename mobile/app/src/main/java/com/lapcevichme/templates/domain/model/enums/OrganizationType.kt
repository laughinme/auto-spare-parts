package com.lapcevichme.templates.domain.model.enums

import com.google.gson.annotations.SerializedName


enum class OrganizationType {
    @SerializedName("supplier")
    SUPPLIER,

    @SerializedName("workshop")
    WORKSHOP
}