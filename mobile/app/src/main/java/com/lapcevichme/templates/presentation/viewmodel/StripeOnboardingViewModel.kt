package com.lapcevichme.templates.presentation.viewmodel
import android.util.Log
import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.ViewModel
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.usecase.user.GetConnectClientSecretUseCase
import com.stripe.android.connect.AccountOnboardingController
import com.stripe.android.connect.AccountOnboardingListener
import com.stripe.android.connect.EmbeddedComponentManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Named

sealed interface OnboardingState {
    object Idle : OnboardingState
    object Loading : OnboardingState
    object Success : OnboardingState
    data class Error(val message: String) : OnboardingState
}

const val CONNECT_ONBOARDING_VIEWMODEL_TAG = "ConnectOnboardingViewModel"

@HiltViewModel
class ConnectOnboardingViewModel @Inject constructor(
    private val getConnectClientSecretUseCase: GetConnectClientSecretUseCase,
    @Named("StripePublishableKey") private val publishableKey: String
) : ViewModel() {

    private val _onboardingState = MutableStateFlow<OnboardingState>(OnboardingState.Idle)
    val onboardingState = _onboardingState.asStateFlow()

    private var accountOnboardingController: AccountOnboardingController? = null

    init {
        Log.d(CONNECT_ONBOARDING_VIEWMODEL_TAG, "Initialized ViewModel@${hashCode()}")
    }

    private val embeddedComponentManager: EmbeddedComponentManager = EmbeddedComponentManager(
        publishableKey = publishableKey,
        fetchClientSecret = ::fetchClientSecret,
    )

    fun getAccountOnboardingController(activity: FragmentActivity): AccountOnboardingController {
        return accountOnboardingController ?: run {
            val controller = embeddedComponentManager.createAccountOnboardingController(activity)
            controller.listener = createListener()
            accountOnboardingController = controller
            controller
        }
    }

    /**
     * UI вызывает этот метод перед показом Stripe, чтобы ViewModel знала о начале процесса.
     */
    fun startLoading() {
        _onboardingState.value = OnboardingState.Loading
    }

    /**
     * UI вызывает этот метод после обработки состояния Success или Error,
     * чтобы вернуть ViewModel в исходное состояние.
     */
    fun resetState() {
        _onboardingState.value = OnboardingState.Idle
    }

    private fun createListener(): AccountOnboardingListener {
        return object : AccountOnboardingListener {
            override fun onExit() {
                // Устанавливаем состояние "Успех"
                _onboardingState.value = OnboardingState.Success
            }

            override fun onLoadError(error: Throwable) {
                // Устанавливаем состояние "Ошибка"
                _onboardingState.value = OnboardingState.Error(error.message ?: "Неизвестная ошибка")
            }
        }
    }

    private suspend fun fetchClientSecret(): String {
        return when (val resource = getConnectClientSecretUseCase()) {
            is Resource.Success -> {
                resource.data ?: throw Exception("Бэкенд вернул пустой client_secret")
            }
            is Resource.Error -> {
                Log.e("ConnectOnboardingVM", "Ошибка при получении client_secret: ${resource.message}")
                throw Exception(resource.message)
            }
            is Resource.Loading -> throw IllegalStateException("Неожиданное состояние загрузки")
        }
    }
}
