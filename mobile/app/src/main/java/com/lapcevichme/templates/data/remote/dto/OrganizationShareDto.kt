package com.lapcevichme.templates.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.lapcevichme.templates.domain.model.OrganizationShare

/**
 * Data Transfer Object for shared organization details.
 *
 * @property id Unique identifier for the organization (UUID format).
 * @property name Organization name.
 * @property country 2-letter country code.
 */
data class OrganizationShareDto(
    @SerializedName("id")
    val id: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("country")
    val country: String,
    @SerializedName("address")
    val address: String?
)

/**
 * Converts [OrganizationShareDto] to the domain model [OrganizationShare].
 */
fun OrganizationShareDto.toDomain(): OrganizationShare {
    return OrganizationShare(
        id = this.id,
        name = this.name,
        country = this.country,
        address = this.address
    )
}
