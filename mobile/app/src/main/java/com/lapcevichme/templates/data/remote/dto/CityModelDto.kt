package com.lapcevichme.templates.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.lapcevichme.templates.domain.model.City

data class CityModelDto(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String
)

fun CityModelDto.toDomain(): City = City(
    id = this.id,
    name = this.name
)
