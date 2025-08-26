package com.lapcevichme.templates.domain.usecase.vehicles

import com.lapcevichme.templates.domain.repository.GarageRepository
import javax.inject.Inject

class GetVehiclesMakesUseCase @Inject constructor(
    private val garageRepository: GarageRepository
) {
    suspend operator fun invoke(query: String? = null) = garageRepository.getVehiclesMakes(query = query)
}