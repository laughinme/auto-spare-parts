package com.lapcevichme.templates.domain.repository

import com.lapcevichme.templates.domain.model.City
import com.lapcevichme.templates.domain.model.Resource
import kotlinx.coroutines.flow.Flow

interface GeographyRepository {
    fun getCities() : Flow<Resource<List<City>>>
}