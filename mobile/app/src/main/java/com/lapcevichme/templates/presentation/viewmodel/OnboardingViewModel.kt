package com.lapcevichme.templates.presentation.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

const val ONBOARDING_VIEWMODEL_TAG = "OnboardingViewModel"

class OnboardingViewModel @Inject constructor() : ViewModel() {

    private val _role = MutableStateFlow<String?>(null)
    val role = _role.asStateFlow()

    init {
        Log.d(ONBOARDING_VIEWMODEL_TAG, "Initialized ViewModel@${hashCode()}")
    }

    fun onRoleClicked(newRole: String) {
        _role.value = newRole
        Log.d(ONBOARDING_VIEWMODEL_TAG, "Role selected: $newRole")
    }

    // Добавляем константы для ролей
    companion object {
        const val ROLE_BUYER = "Buyer"
        const val ROLE_SELLER = "Seller"
        // Можно добавить UNKNOWN или NONE, если нужно
        // const val ROLE_NONE = "None"
    }
}
