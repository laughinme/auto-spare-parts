package com.lapcevichme.templates.domain.model.garage

data class VehicleCreate(
    val makeId: Int,
    val modelId: Int,
    val year: Int,
    val vehicleTypeId: Int?,
    val vin: String?,
    val comment: String?
)
