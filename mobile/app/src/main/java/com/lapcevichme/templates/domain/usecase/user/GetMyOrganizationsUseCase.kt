package com.lapcevichme.templates.domain.usecase.user

import com.lapcevichme.templates.domain.model.OrganizationModel
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.OrganizationRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetMyOrganizationsUseCase @Inject constructor(
    private val repository: OrganizationRepository
) {
    suspend operator fun invoke(): Flow<Resource<List<OrganizationModel>>> = repository.getMyOrganizations()
}