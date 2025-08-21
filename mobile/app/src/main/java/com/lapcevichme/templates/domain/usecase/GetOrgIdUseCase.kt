package com.lapcevichme.templates.domain.usecase

import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.UserRepository
import kotlinx.coroutines.flow.firstOrNull
import javax.inject.Inject

class GetOrgIdUseCase @Inject constructor(
    private val repository: UserRepository
) {
    suspend operator fun invoke(): String? {
        return when (val profileResource = repository.getProfile().firstOrNull()) {
            is Resource.Success -> {
                profileResource.data!!.organization?.id
            }
            else -> null // Handle error or loading state as needed, or return null if profile isn't available
        }
    }
}
