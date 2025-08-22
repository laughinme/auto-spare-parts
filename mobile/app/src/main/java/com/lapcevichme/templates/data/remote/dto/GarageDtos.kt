package com.lapcevichme.templates.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.lapcevichme.templates.domain.model.CursorPage // Added import
import com.lapcevichme.templates.domain.model.garage.MakeModel
import com.lapcevichme.templates.domain.model.garage.VehicleCreate
import com.lapcevichme.templates.domain.model.garage.VehicleModel
import com.lapcevichme.templates.domain.model.garage.VehicleModelInfo
import com.lapcevichme.templates.domain.model.garage.VehicleTypeModel

data class MakeModelDto(
    @SerializedName("make_id") val makeId: Int,
    @SerializedName("make_name") val makeName: String
)

data class ModelSchemaDto( // Corresponds to ModelSchema in OpenAPI
    @SerializedName("model_id") val modelId: Int,
    @SerializedName("make_id") val makeId: Int,
    @SerializedName("model_name") val modelName: String
)

data class VehicleTypeModelDto(
    @SerializedName("vehicle_type_id") val vehicleTypeId: Int,
    @SerializedName("name") val name: String
)

data class VehicleModelDto( // Corresponds to VehilceModel in OpenAPI
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String?,
    @SerializedName("id") val id: String,
    @SerializedName("user_id") val userId: String,
    @SerializedName("make") val make: MakeModelDto,
    @SerializedName("model") val model: ModelSchemaDto,
    @SerializedName("year") val year: Int,
    @SerializedName("vehicle_type") val vehicleType: VehicleTypeModelDto?,
    @SerializedName("vin") val vin: String?,
    @SerializedName("comment") val comment: String?
)

data class VehicleCreateDto( // Corresponds to VehicleCreate in OpenAPI
    @SerializedName("make_id") val makeId: Int,
    @SerializedName("model_id") val modelId: Int,
    @SerializedName("year") val year: Int,
    @SerializedName("vehicle_type_id") val vehicleTypeId: Int?,
    @SerializedName("vin") val vin: String?,
    @SerializedName("comment") val comment: String?
)

// Generic DTO for cursor-based pagination responses
data class CursorPageDto<T>(
    @SerializedName("items") val items: List<T>,
    @SerializedName("next_cursor") val nextCursor: String?
)

// Mappers to Domain Models

fun MakeModelDto.toDomain(): MakeModel = MakeModel(
    makeId = this.makeId,
    makeName = this.makeName
)

fun ModelSchemaDto.toDomain(): VehicleModelInfo = VehicleModelInfo(
    modelId = this.modelId,
    makeId = this.makeId,
    modelName = this.modelName
)

fun VehicleTypeModelDto.toDomain(): VehicleTypeModel = VehicleTypeModel(
    vehicleTypeId = this.vehicleTypeId,
    name = this.name
)

fun VehicleModelDto.toDomain(): VehicleModel = VehicleModel(
    createdAt = this.createdAt,
    updatedAt = this.updatedAt,
    id = this.id,
    userId = this.userId,
    make = this.make.toDomain(),
    model = this.model.toDomain(),
    year = this.year,
    vehicleType = this.vehicleType?.toDomain(),
    vin = this.vin,
    comment = this.comment
)

// Mapper for CursorPageDto to domain model CursorPage
fun CursorPageDto<VehicleModelDto>.toDomain(): CursorPage<VehicleModel> = CursorPage(
    items = this.items.map { it.toDomain() }, // Uses existing VehicleModelDto.toDomain()
    nextCursor = this.nextCursor
)

// Mapper from Domain Model to DTO (for request bodies)

fun VehicleCreate.toDto(): VehicleCreateDto = VehicleCreateDto(
    makeId = this.makeId,
    modelId = this.modelId,
    year = this.year,
    vehicleTypeId = this.vehicleTypeId,
    vin = this.vin,
    comment = this.comment
)
