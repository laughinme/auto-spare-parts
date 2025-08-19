package com.lapcevichme.templates.domain.repository

import com.lapcevichme.templates.domain.model.Resource

interface AppStripeRepository {
    /**
     * Запрашивает у бэкенда client_secret для инициализации Stripe Connect Onboarding.
     * Возвращает Resource, так как операция может завершиться ошибкой.
     */
    suspend fun getOnboardingClientSecret(): Resource<String>
}