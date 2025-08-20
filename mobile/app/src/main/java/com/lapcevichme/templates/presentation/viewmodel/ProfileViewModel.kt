package com.lapcevichme.templates.presentation.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
// Removed: import com.lapcevichme.templates.domain.model.City // No longer used
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.UserProfile
import com.lapcevichme.templates.domain.model.UserProfileUpdate
import com.lapcevichme.templates.domain.repository.UserRepository
// Removed: import com.lapcevichme.templates.domain.usecase.GetCitiesUseCase // No longer used
// Removed: import com.lapcevichme.templates.domain.usecase.GetUserLocationUseCase // No longer used
import com.lapcevichme.templates.domain.usecase.LogoutUseCase
import com.lapcevichme.templates.domain.usecase.UpdateProfilePictureUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import java.io.File
// Removed: import java.time.LocalDate // No longer used
// Removed: import java.time.format.DateTimeFormatter // No longer used
import javax.inject.Inject

const val PROFILE_VIEWMODEL_TAG = "ProfileViewModel"


// --- СОБЫТИЯ ЭКРАНА ---
sealed interface ProfileEvent {
    data class OnUsernameChange(val value: String) : ProfileEvent
    data class OnBioChange(val value: String) : ProfileEvent
    data class OnLanguageChange(val language: String) : ProfileEvent
    data class OnPictureSelected(val file: File) : ProfileEvent
    object OnSaveClick : ProfileEvent
    object OnLogoutClick : ProfileEvent
    object OnRetry : ProfileEvent
}


@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val logoutUseCase: LogoutUseCase,
    private val userRepository: UserRepository,
    private val updateProfilePictureUseCase: UpdateProfilePictureUseCase
) : ViewModel() {
    private val _snackbarEvent = MutableSharedFlow<String>()
    val snackbarEvent = _snackbarEvent.asSharedFlow()


    // --- ОБЩЕЕ СОСТОЯНИЕ ЭКРАНА ---
    private val _profileState = MutableStateFlow<Resource<UserProfile>>(Resource.Loading())
    val profileState = _profileState.asStateFlow()

    // --- СОСТОЯНИЕ ДЛЯ ВЫХОДА ---
    private val _logoutState = MutableStateFlow<Resource<Unit>?>(null)
    val logoutState = _logoutState.asStateFlow()

    // --- СОСТОЯНИЕ ДЛЯ ЗАВЕРШЕНИЯ ОНБОРДИНГА ---
    private val _onboardingSaveComplete = MutableStateFlow<Boolean>(false)
    val onboardingSaveComplete = _onboardingSaveComplete.asStateFlow()

    // --- СОСТОЯНИЯ ДЛЯ ПОЛЕЙ ПРОФИЛЯ ---
    private val _username = MutableStateFlow("")
    val username = _username.asStateFlow()
    private val _bio = MutableStateFlow("")
    val bio = _bio.asStateFlow()
    private val _language = MutableStateFlow("")
    val language = _language.asStateFlow()
    private val _avatarUrl = MutableStateFlow<String?>(null)
    val avatarUrl = _avatarUrl.asStateFlow()


    init {
        Log.d(PROFILE_VIEWMODEL_TAG, "Initialized ViewModel@${hashCode()}")
        loadProfile()
    }

    fun onEvent(event: ProfileEvent) {
        when(event) {
            is ProfileEvent.OnUsernameChange -> _username.value = event.value
            is ProfileEvent.OnBioChange -> _bio.value = event.value
            is ProfileEvent.OnLanguageChange -> _language.value = event.language
            is ProfileEvent.OnPictureSelected -> uploadProfilePicture(event.file)
            ProfileEvent.OnSaveClick -> saveProfile()
            ProfileEvent.OnLogoutClick -> logout()
            ProfileEvent.OnRetry -> {
                loadProfile()
            }
        }
    }

    private fun loadProfile() {
        userRepository.getProfile().onEach { result ->
            if (result is Resource.Success) {
                result.data?.let { profile ->
                    _username.value = profile.username ?: ""
                    _bio.value = profile.bio ?: ""
                    _language.value = profile.languageCode ?: ""
                    _avatarUrl.value = profile.profilePicUrl
                }
            }
            _profileState.value = result
        }.launchIn(viewModelScope)
    }

    private fun saveProfile() {
        viewModelScope.launch {
            _profileState.value = Resource.Loading()

            val profileUpdateData = UserProfileUpdate(
                username = _username.value.takeIf { it.isNotBlank() },
                profilePicUrl = _avatarUrl.value,
                bio = _bio.value.takeIf { it.isNotBlank() },
                languageCode = _language.value.takeIf { it.isNotBlank() },
            )

            userRepository.updateFullProfile(profileUpdateData).onEach { result ->
                _profileState.value = result
                if (result is Resource.Success) {
                    Log.d(PROFILE_VIEWMODEL_TAG, "Profile saved successfully!")
                    _onboardingSaveComplete.value = true
                }
            }.launchIn(viewModelScope)
        }
    }

    private fun uploadProfilePicture(file: File) {
        updateProfilePictureUseCase(file).onEach { result ->
            if (result is Resource.Success) {
                _avatarUrl.value = result.data?.profilePicUrl
            }
        }.launchIn(viewModelScope)
    }

    private fun logout() {
        viewModelScope.launch {
            logoutUseCase().collect { result ->
                _logoutState.value = result
            }
        }
    }
}