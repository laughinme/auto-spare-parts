package com.lapcevichme.templates.domain.model

data class VehicleModel(
    val createdAt: String,
    val updatedAt: String?,
    val id: String,
    val userId: String,
    val make: MakeModel,
    val model: VehicleModelInfo,
    val year: Int,
    val vehicleType: VehicleTypeModel?,
    val vin: String?,
    val comment: String?
)
