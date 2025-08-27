package com.lapcevichme.templates.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.lapcevichme.templates.domain.model.OrganizationShare

data class OrganizationShareDto(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("country") val country: String,
    @SerializedName("address") val address: String?
)

fun OrganizationShareDto.toDomain(): OrganizationShare = OrganizationShare(
    id = this.id,
    name = this.name,
    country = this.country,
    address = this.address
)