package com.lapcevichme.templates.domain.usecase

import android.util.Log
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.UserRepository
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.first
import javax.inject.Inject

class GetOrgIdUseCase @Inject constructor(
    private val repository: UserRepository
) {
    suspend operator fun invoke(): String? {
        return when (val result = repository.getProfile().first {
            it !is Resource.Loading
        }) {
            is Resource.Success -> {
                val id = result.data?.organization?.id
                Log.d("GetOrgIdUseCase", "Fetched organization ID: $id, Data: ${result.data}")
                id
            }
            is Resource.Error -> null
            is Resource.Loading -> "loading"
        }
    }
}