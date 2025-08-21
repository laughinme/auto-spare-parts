package com.lapcevichme.templates.domain.repository

import com.lapcevichme.templates.domain.model.OrganizationModel
import com.lapcevichme.templates.domain.model.Resource
import kotlinx.coroutines.flow.Flow

interface OrganizationRepository {
    suspend fun getMyOrganizations(): Flow<Resource<List<OrganizationModel>>>
}