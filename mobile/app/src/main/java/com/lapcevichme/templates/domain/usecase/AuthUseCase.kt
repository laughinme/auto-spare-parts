package com.lapcevichme.templates.domain.usecase

import com.lapcevichme.templates.data.remote.dto.UserLoginRequest
import com.lapcevichme.templates.data.remote.dto.UserRegisterRequest
import com.lapcevichme.templates.domain.repository.AuthRepository
import javax.inject.Inject

class LoginUseCase @Inject constructor(
    private val repository: AuthRepository
) {
    operator fun invoke(request: UserLoginRequest) = repository.login(request)
}

class RegisterUseCase @Inject constructor(
    private val repository: AuthRepository
) {
    operator fun invoke(request: UserRegisterRequest) = repository.register(request)
}

class LogoutUseCase @Inject constructor(
    private val repository: AuthRepository
) {
    operator fun invoke() = repository.logout()
}