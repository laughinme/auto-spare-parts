package com.lapcevichme.templates.presentation.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapcevichme.templates.data.remote.TokenManager
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.UserProfile
import com.lapcevichme.templates.domain.repository.UserRepository
import com.lapcevichme.templates.presentation.navigation.Routes
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest // Используем collectLatest для автоматической отмены предыдущей загрузки профиля
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

const val MAIN_VIEWMODEL_TAG = "MainViewModel"

@HiltViewModel
class MainViewModel @Inject constructor(
    private val tokenManager: TokenManager,
    private val userRepository: UserRepository
) : ViewModel() {

    private val _startDestination = MutableStateFlow(Routes.AUTH_GRAPH)
    val startDestination = _startDestination.asStateFlow()

    private val _userProfile = MutableStateFlow<UserProfile?>(null)

    val isUserInOrganization = _userProfile.map { currentUserProfile ->
        currentUserProfile?.organization != null
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000L),
        initialValue = false
    )

    init {
        Log.d(MAIN_VIEWMODEL_TAG, "Initialized ViewModel@${hashCode()}")
        
        viewModelScope.launch {
            tokenManager.getAccessToken().collectLatest { accessToken -> // collectLatest здесь важен
                Log.d(MAIN_VIEWMODEL_TAG, "Observed access token in ViewModel: $accessToken") // Лог в ViewModel
                if (accessToken == null) {
                    // Пользователь вышел или токен отсутствует/истек
                    Log.d(MAIN_VIEWMODEL_TAG, "Access token is null. Clearing user profile and navigating to Auth.")
                    _userProfile.value = null // <-- Ключевой сброс профиля
                    _startDestination.value = Routes.AUTH_GRAPH
                } else {
                    // Пользователь залогинен, токен есть. Загружаем профиль.
                    Log.d(MAIN_VIEWMODEL_TAG, "Access token present. Fetching user profile.")
                    fetchUserProfile() 
                    // startDestination будет обновлен внутри fetchUserProfile после получения данных о isOnboarded
                }
            }
        }
        Log.d("Nya~!","'''...'''") // Котик следит за порядком!
    }

    private fun fetchUserProfile() {
        viewModelScope.launch {
            Log.d(MAIN_VIEWMODEL_TAG, "Starting to fetch user profile...")
            userRepository.getProfile().collect { resource ->
                when (resource) {
                    is Resource.Success -> {
                        _userProfile.value = resource.data
                        Log.d(MAIN_VIEWMODEL_TAG, "User profile fetched successfully. Onboarded: ${resource.data?.isOnboarded}")
                        // Пользователь залогинен и профиль (даже если частично) загружен, всегда идем в MAIN_GRAPH
                        _startDestination.value = Routes.MAIN_GRAPH
                        Log.d(MAIN_VIEWMODEL_TAG, "User profile fetched (success), navigating to MAIN_GRAPH.")
                    }
                    is Resource.Error -> {
                        _userProfile.value = null // Сбрасываем профиль при ошибке
                        Log.e(MAIN_VIEWMODEL_TAG, "Error fetching user profile: ${resource.message}")
                        // Даже если ошибка загрузки профиля, но токен есть, идем в MAIN_GRAPH.
                        // MAIN_GRAPH должен быть устойчив к отсутствию полного профиля или предлагать пути решения.
                        _startDestination.value = Routes.MAIN_GRAPH
                        Log.d(MAIN_VIEWMODEL_TAG, "Error fetching profile, but token exists, navigating to MAIN_GRAPH.")
                    }
                    is Resource.Loading -> {
                        Log.d(MAIN_VIEWMODEL_TAG, "Loading user profile...")
                        // Здесь _startDestination не меняем, ждем Success или Error.
                    }
                }
            }
        }
    }
}
