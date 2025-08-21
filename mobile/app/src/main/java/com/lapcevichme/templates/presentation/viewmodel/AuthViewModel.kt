package com.lapcevichme.templates.presentation.viewmodel

import android.util.Log
import android.util.Patterns
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapcevichme.templates.data.remote.dto.UserLoginRequest
import com.lapcevichme.templates.data.remote.dto.UserRegisterRequest
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.TokenPair
import com.lapcevichme.templates.domain.usecase.user.LoginUseCase
import com.lapcevichme.templates.domain.usecase.user.RegisterUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

const val AUTH_VIEWMODEL_TAG = "AuthViewModel"

// Определение AuthEvent (может быть в отдельном файле)
sealed class AuthEvent {
    data class EmailChanged(val email: String) : AuthEvent()
    data class PasswordChanged(val password: String) : AuthEvent()
    data class UsernameChanged(val username: String) : AuthEvent()
    object SignInClicked : AuthEvent()
    object SignUpClicked : AuthEvent()
    object ResetAuthState : AuthEvent() // Для сброса signInState/signUpState
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase,
    private val registerUseCase: RegisterUseCase
) : ViewModel() {

    // ---- Inputs ----
    private val _email = MutableStateFlow("")
    val email = _email.asStateFlow()

    private val _password = MutableStateFlow("")
    val password = _password.asStateFlow()

    private val _username = MutableStateFlow("")
    val username = _username.asStateFlow()

    // ---- UI state / errors for fields ----
    private val _emailError = MutableStateFlow<String?>(null)
    val emailError = _emailError.asStateFlow()

    private val _passwordError = MutableStateFlow<String?>(null)
    val passwordError = _passwordError.asStateFlow()

    private val _usernameError = MutableStateFlow<String?>(null)
    val usernameError = _usernameError.asStateFlow()

    // ---- UI state for actions ----
    private val _signInState = MutableStateFlow<Resource<TokenPair>?>(null)
    val signInState = _signInState.asStateFlow()

    private val _signUpState = MutableStateFlow<Resource<TokenPair>?>(null)
    val signUpState = _signUpState.asStateFlow()


    init {
        Log.d(AUTH_VIEWMODEL_TAG, "Initialized ViewModel@${hashCode()}")
    }

    // ---- Новый обработчик событий ----
    fun onEvent(event: AuthEvent) {
        when (event) {
            is AuthEvent.EmailChanged -> handleEmailChanged(event.email)
            is AuthEvent.PasswordChanged -> handlePasswordChanged(event.password)
            is AuthEvent.UsernameChanged -> handleUsernameChanged(event.username)
            is AuthEvent.SignInClicked -> handleSignInClicked()
            is AuthEvent.SignUpClicked -> handleSignUpClicked()
            is AuthEvent.ResetAuthState -> {
                _signInState.value = null
                _signUpState.value = null
            }
        }
    }

    // ---- Приватные обработчики для каждого эвента/действия ----
    private fun handleEmailChanged(newEmail: String) {
        _email.value = newEmail
        validateEmail(newEmail)
    }

    private fun handlePasswordChanged(newPassword: String) {
        _password.value = newPassword
        validatePassword(newPassword)
    }

    private fun handleUsernameChanged(newUsername: String) {
        _username.value = newUsername
        validateUsername(newUsername)
    }

    private fun handleSignInClicked() {
        val isEmailValid = validateEmail()
        val isPasswordValid = validatePassword()

        if (isEmailValid && isPasswordValid) {
            viewModelScope.launch {
                _signInState.value = Resource.Loading()
                loginUseCase(UserLoginRequest(email.value, password.value))
                    .collect { result -> _signInState.value = result }
            }
        } else {
            // Можно установить _signInState в ошибку валидации, если нужно явно передать это UI
            Log.d(AUTH_VIEWMODEL_TAG, "Sign In validation failed.")
        }
    }

    private fun handleSignUpClicked() {
        val isEmailValid = validateEmail()
        val isPasswordValid = validatePassword()
        val isUsernameValid = validateUsername() // Убедись, что username используется в UserRegisterRequest, если он здесь валидируется

        if (isEmailValid && isPasswordValid && isUsernameValid) {
            viewModelScope.launch {
                _signUpState.value = Resource.Loading()
                // UserRegisterRequest не меняется и не включает роль
                registerUseCase(UserRegisterRequest(email.value, password.value, username.value))
                    .collect { result -> _signUpState.value = result }
            }
        } else {
            // Можно установить _signUpState в ошибку валидации
            Log.d(AUTH_VIEWMODEL_TAG, "Sign Up validation failed.")
        }
    }

    // ---- Validation ----
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
        } else {
            _passwordError.value = null
            true
        }
    }

    private fun validateUsername(usernameToValidate: String = _username.value): Boolean {
        // Убедись, что UserRegisterRequest действительно использует username,
        // иначе эта валидация не имеет смысла для процесса регистрации.
        return if (usernameToValidate.isBlank()) {
            _usernameError.value = "Имя пользователя не может быть пустым"
            false
        } else {
            _usernameError.value = null
            true
        }
    }

    // ---- Методы для сброса состояния (если нужно извне) ----
    // Вместо них теперь используется AuthEvent.ResetAuthState
    /*
    fun resetSignInState() {
        _signInState.value = null
    }

    fun resetSignUpState() {
        _signUpState.value = null
    }
    */
}

