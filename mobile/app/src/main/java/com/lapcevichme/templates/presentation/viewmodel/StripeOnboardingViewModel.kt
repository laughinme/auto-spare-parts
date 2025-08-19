package com.lapcevichme.templates.presentation.viewmodel
import android.util.Log
import androidx.lifecycle.ViewModel
import com.stripe.android.connect.EmbeddedComponentManager
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.usecase.GetConnectClientSecretUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import javax.inject.Named


/**
 * ViewModel для управления процессом онбординга продавца через Stripe Connect.
 *
 * Эта ViewModel следует паттерну из официальной документации Stripe:
 * 1. Она является долгоживущим хранилищем для `EmbeddedComponentManager`, чтобы он пережил
 * смены конфигурации (например, поворот экрана).
 * 2. Она предоставляет `fetchClientSecret` функцию, которая безопасно обращается к бэкенду
 * через UseCase.
 * 3. Она НЕ создает UI-компоненты. Этим занимается Activity/Fragment, получая менеджер
 * из этой ViewModel.
 *
 * @param getConnectClientSecretUseCase UseCase для получения client_secret с бэкенда.
 * @param publishableKey Публикуемый ключ Stripe, предоставляемый через Hilt.
 */
@HiltViewModel
class ConnectOnboardingViewModel @Inject constructor(
    private val getConnectClientSecretUseCase: GetConnectClientSecretUseCase,
    // Используем @Named, чтобы Hilt понял, какой именно String нам нужен
    @Named("StripePublishableKey") private val publishableKey: String
) : ViewModel() {

    val embeddedComponentManager: EmbeddedComponentManager = EmbeddedComponentManager(
        // Теперь используем ключ, который пришел через конструктор
        publishableKey = publishableKey,
        fetchClientSecret = ::fetchClientSecret,
    )

    /**
     * Приватная suspend-функция, которая вызывается Stripe SDK, когда ему нужен client_secret.
     * Она соответствует сигнатуре, требуемой `EmbeddedComponentManager`.
     *
     * @return `String?` - client_secret в случае успеха или null в случае ошибки.
     */
    private suspend fun fetchClientSecret(): String? {
        return when (val resource = getConnectClientSecretUseCase()) {
            is Resource.Success -> {
                // Успешно получили токен, возвращаем его
                resource.data
            }
            is Resource.Error -> {
                // Произошла ошибка. Логгируем ее и возвращаем null, как требует SDK.
                // UI должен будет обработать ошибку загрузки через listener контроллера.
                Log.e("ConnectOnboardingVM", "Ошибка при получении client_secret: ${resource.message}")
                null
            }
            // Состояние Loading не должно происходить в suspend-функции, но для полноты обрабатываем.
            is Resource.Loading -> null
        }
    }
}