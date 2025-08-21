package com.lapcevichme.templates.domain.model

import com.lapcevichme.templates.domain.model.enums.KycStatus
import com.lapcevichme.templates.domain.model.enums.OrganizationType
import com.lapcevichme.templates.domain.model.enums.PayoutSchedule

data class OrganizationModel(
    val createdAt: String,
    val updatedAt: String?,
    val id: String,
    val type: OrganizationType,
    val name: String,
    val country: String,
    val address: String?,
    val stripeAccountId: String?,
    val kycStatus: KycStatus,
    val payoutSchedule: PayoutSchedule
)
