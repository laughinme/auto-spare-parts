package com.lapcevichme.templates.domain.repository

import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.UserProfile
import com.lapcevichme.templates.domain.model.UserProfileUpdate
import kotlinx.coroutines.flow.Flow
import java.io.File

interface UserRepository {
    fun getProfile(): Flow<Resource<UserProfile>>
    fun updateFullProfile(
        profileData: UserProfileUpdate,
    ): Flow<Resource<UserProfile>>
    fun updateProfilePicture(file: File): Flow<Resource<UserProfile>>
}
