package com.lapcevichme.templates.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.lapcevichme.templates.domain.model.OrganizationModel
import com.lapcevichme.templates.domain.model.enums.KycStatus
import com.lapcevichme.templates.domain.model.enums.OrganizationType
import com.lapcevichme.templates.domain.model.enums.PayoutSchedule

data class OrganizationDto(
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("updated_at")
    val updatedAt: String?,
    @SerializedName("id")
    val id: String,
    @SerializedName("type")
    val type: OrganizationType,
    @SerializedName("name")
    val name: String,
    @SerializedName("country")
    val country: String,
    @SerializedName("address")
    val address: String?,
    @SerializedName("stripe_account_id")
    val stripeAccountId: String?,
    @SerializedName("kyc_status")
    val kycStatus: KycStatus,
    @SerializedName("payout_schedule")
    val payoutSchedule: PayoutSchedule
)

fun OrganizationDto.toDomain(): OrganizationModel {
    return OrganizationModel(
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        id = this.id,
        type = this.type,
        name = this.name,
        country = this.country,
        address = this.address,
        stripeAccountId = this.stripeAccountId,
        kycStatus = this.kycStatus,
        payoutSchedule = this.payoutSchedule
    )
}
