package com.lapcevichme.templates.domain.usecase.vehicles

import com.lapcevichme.templates.domain.repository.GarageRepository
import jakarta.inject.Inject

class GetVehiclesModelsUseCase @Inject constructor(
    private val garageRepository: GarageRepository
) {
    suspend operator fun invoke(makeId: Int, query: String? = null) = garageRepository.getVehiclesModels(makeId = makeId, query = query)
}