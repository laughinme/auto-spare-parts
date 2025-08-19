package com.lapcevichme.templates.presentation.viewmodel

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

class OnboardingViewModel @Inject constructor() : ViewModel() {

    private val _role = MutableStateFlow<String?>(null)
    val role = _role.asStateFlow()

    fun onRoleClicked(newRole: String) {
        _role.value = newRole
    }
}