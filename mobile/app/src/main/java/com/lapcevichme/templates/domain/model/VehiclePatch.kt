package com.lapcevichme.templates.domain.model

data class VehiclePatch(
    val makeId: Int? = null,
    val modelId: Int? = null,
    val year: Int? = null,
    val vehicleTypeId: Int? = null,
    val vin: String? = null,
    val comment: String? = null
)
