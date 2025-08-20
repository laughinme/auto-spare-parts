package com.lapcevichme.templates.presentation.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapcevichme.templates.data.remote.dto.UserLoginRequest
import com.lapcevichme.templates.data.remote.dto.UserRegisterRequest
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.TokenPair
import com.lapcevichme.templates.domain.usecase.LoginUseCase
import com.lapcevichme.templates.domain.usecase.RegisterUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

const val AUTH_VIEWMODEL_TAG = "AuthViewModel"

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase,
    private val registerUseCase: RegisterUseCase
) : ViewModel() {

    private val _username = MutableStateFlow("") // Added
    val username = _username.asStateFlow() // Added

    private val _email = MutableStateFlow("")
    val email = _email.asStateFlow()

    private val _password = MutableStateFlow("")
    val password = _password.asStateFlow()

    private val _authState = MutableStateFlow<Resource<TokenPair>?>(null)
    val authState = _authState.asStateFlow()

    init {
        Log.d(AUTH_VIEWMODEL_TAG, "Initialized ViewModel@${hashCode()}")
    }

    fun onUsernameChanged(newUsername: String) { // Added
        _username.value = newUsername
    }

    fun onEmailChanged(newEmail: String) {
        _email.value = newEmail
    }

    fun onPasswordChanged(newPassword: String) {
        _password.value = newPassword
    }

    fun onSignInClicked() {
        viewModelScope.launch {
            loginUseCase(UserLoginRequest(email.value, password.value))
                .collect { result ->
                    _authState.value = result
                }
        }
    }

    fun onSignUpClicked() {
        viewModelScope.launch {
            registerUseCase(UserRegisterRequest(email.value, password.value, username.value)) // Updated
                .collect { result ->
                    _authState.value = result
                }
        }
    }
}
