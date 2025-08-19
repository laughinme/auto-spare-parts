package com.lapcevichme.templates.domain.usecase

import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.UserProfile
import com.lapcevichme.templates.domain.repository.UserRepository
import kotlinx.coroutines.flow.Flow
import java.io.File
import javax.inject.Inject

class UpdateProfilePictureUseCase @Inject constructor(
    private val userRepository: UserRepository
) {
    operator fun invoke(file: File): Flow<Resource<UserProfile>> {
        return userRepository.updateProfilePicture(file)
    }
}