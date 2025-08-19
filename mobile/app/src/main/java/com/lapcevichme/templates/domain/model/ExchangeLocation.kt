package com.lapcevichme.templates.domain.model

data class ExchangeLocation(
    val id: Int,
    val title: String,
    val address: String,
    val latitude: Double,
    val longitude: Double,
    val city: City,
    val isActive: Boolean,
)