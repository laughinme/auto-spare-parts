package com.lapcevichme.templates.presentation.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

const val HOME_TAB_VIEWMODEL_TAG = "HomeTabViewModel"

@HiltViewModel
class HomeTabViewModel @Inject constructor() : ViewModel() {

    private val _searchQuery = MutableStateFlow<String?>(null)
    val searchQuery = _searchQuery.asStateFlow()

    fun onSearchQueryChanged(query: String) {
        _searchQuery.value = query
    }

    fun onSearchClicked(){
        // Handle search click logic here
        // This could involve filtering a list, making a network request, etc.
        // For now, we will just log the current search query
        Log.d(HOME_TAB_VIEWMODEL_TAG, "Search clicked with query: ${_searchQuery.value}")
    }
}