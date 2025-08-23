package com.lapcevichme.templates.domain.usecase.user

import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.AppStripeRepository
import javax.inject.Inject

class GetConnectClientSecretUseCase @Inject constructor(
    private val stripeRepository: AppStripeRepository
) {
    suspend operator fun invoke(): Resource<String> {
        return stripeRepository.getOnboardingClientSecret()
    }
}
