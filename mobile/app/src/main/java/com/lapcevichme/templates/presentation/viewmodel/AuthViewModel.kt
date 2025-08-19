package com.lapcevichme.templates.presentation.viewmodel

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
import android.util.Patterns
import javax.inject.Inject

const val AUTH_VIEWMODEL_TAG = "AuthViewModel"

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase,
    private val registerUseCase: RegisterUseCase
) : ViewModel() {

    private val _email = MutableStateFlow("")
    val email = _email.asStateFlow()

    private val _password = MutableStateFlow("")
    val password = _password.asStateFlow()

    // Добавляем StateFlow для имени пользователя (понадобится для SignUp)
    private val _username = MutableStateFlow("")
    val username = _username.asStateFlow()

    private val _authState = MutableStateFlow<Resource<TokenPair>?>(null)
    val authState = _authState.asStateFlow()

    private val _emailError = MutableStateFlow<String?>(null)
    val emailError = _emailError.asStateFlow()

    private val _passwordError = MutableStateFlow<String?>(null)
    val passwordError = _passwordError.asStateFlow()

    // Добавляем StateFlow для ошибки имени пользователя (понадобится для SignUp)
    private val _usernameError = MutableStateFlow<String?>(null)
    val usernameError = _usernameError.asStateFlow()

    fun onEmailChanged(newEmail: String) {
        _email.value = newEmail
        validateEmail(newEmail)
    }

    fun onPasswordChanged(newPassword: String) {
        _password.value = newPassword
        validatePassword(newPassword)
    }

    fun onUsernameChanged(newUsername: String) {
        _username.value = newUsername
        validateUsername(newUsername)
    }

    private fun validateEmail(emailToValidate: String = _email.value): Boolean {
        return if (emailToValidate.isBlank()) {
            _emailError.value = "Email не может быть пустым"
            false
        } else if (!Patterns.EMAIL_ADDRESS.matcher(emailToValidate).matches()) {
            _emailError.value = "Введите корректный email"
            false
        } else {
            _emailError.value = null
            true
        }
    }

    private fun validatePassword(passwordToValidate: String = _password.value): Boolean {
        return if (passwordToValidate.isBlank()) {
            _passwordError.value = "Пароль не может быть пустым"
            false
        } else if (passwordToValidate.length < 6) {
            _passwordError.value = "Пароль должен быть не менее 6 символов"
            false
        } else {
            _passwordError.value = null
            true
        }
    }

    private fun validateUsername(usernameToValidate: String = _username.value): Boolean {
        return if (usernameToValidate.isBlank()) {
            _usernameError.value = "Имя пользователя не может быть пустым"
            false
        } else {
            _usernameError.value = null
            true
        }
    }

    fun onSignInClicked() {
        val isEmailValid = validateEmail()
        val isPasswordValid = validatePassword()

        if (isEmailValid && isPasswordValid) {
            viewModelScope.launch {
                _authState.value = Resource.Loading()
                loginUseCase(UserLoginRequest(email.value, password.value))
                    .collect { result ->
                        _authState.value = result
                    }
            }
        }
    }

    fun onSignUpClicked() {
        val isEmailValid = validateEmail()
        val isPasswordValid = validatePassword()
        val isUsernameValid = validateUsername()

        if (isEmailValid && isPasswordValid && isUsernameValid) {
            viewModelScope.launch {
                _authState.value = Resource.Loading()
                registerUseCase(UserRegisterRequest(email.value, password.value, username.value))
                    .collect { result ->
                        _authState.value = result
                    }
            }
        }
    }
}