package com.lapcevichme.templates.domain.usecase.vehicles

import com.lapcevichme.templates.domain.repository.GarageRepository
import jakarta.inject.Inject

class GetVehiclesYearsUseCase @Inject constructor(
    private val garageRepository: GarageRepository
) {
    suspend operator fun invoke(modelId: Int) = garageRepository.getVehiclesYears(modelId = modelId)
}