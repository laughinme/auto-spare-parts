package com.lapcevichme.templates.domain.repository

import com.lapcevichme.templates.data.remote.dto.UserLoginRequest
import com.lapcevichme.templates.data.remote.dto.UserRegisterRequest
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.TokenPair
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    /**
     * Выполняет вход пользователя.
     * @return Flow, который эмитит состояния загрузки, успеха (с парой токенов) или ошибки.
     */
    fun login(request: UserLoginRequest): Flow<Resource<TokenPair>>

    /**
     * Регистрирует нового пользователя.
     * @return Flow, который эмитит состояния загрузки, успеха (с парой токенов) или ошибки.
     */
    fun register(request: UserRegisterRequest): Flow<Resource<TokenPair>>

    /**
     * Выполняет выход пользователя из системы.
     * @return Flow, который эмитит состояния загрузки, успеха или ошибки.
     */
    fun logout(): Flow<Resource<Unit>>
}