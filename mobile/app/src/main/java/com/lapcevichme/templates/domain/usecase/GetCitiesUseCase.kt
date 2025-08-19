package com.lapcevichme.templates.domain.usecase

import com.lapcevichme.templates.domain.model.City
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.GeographyRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetCitiesUseCase @Inject constructor(
    private val repository: GeographyRepository
) {
    operator fun invoke(): Flow<Resource<List<City>>> = repository.getCities()
}