package com.lapcevichme.templates.domain.model

/**
 * Represents a shared organization with basic details.
 *
 * @property id Unique identifier for the organization (UUID format).
 * @property name Organization name.
 * @property country 2-letter country code.
 */
data class OrganizationShare(
    val id: String,
    val name: String,
    val country: String,
    val address: String?,
)
