package com.lapcevichme.templates.presentation.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.usecase.product.GetProductFeedUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

const val HOME_TAB_VIEWMODEL_TAG = "HomeTabViewModel"

@HiltViewModel
class HomeTabViewModel @Inject constructor(
    private val getProductFeedUseCase: GetProductFeedUseCase,
) : ViewModel() {

    private suspend fun loadProductFeed() {
        Log.d(HOME_TAB_VIEWMODEL_TAG, "Loading product feed")
        getProductFeedUseCase().collect { result ->
            when(result) {
                is Resource.Success -> {
                    Log.d(HOME_TAB_VIEWMODEL_TAG, "Product feed loaded successfully: ${result.data}")
                    _loadingStatus.value = false
                    _productFeed.value = result.data
                }
                is Resource.Error -> {
                    Log.e(HOME_TAB_VIEWMODEL_TAG, "Error loading product feed: ${result.message}")
                    _loadingStatus.value = false
                    _errorMessage.value = result.message
                }
                is Resource.Loading -> {
                    Log.d(HOME_TAB_VIEWMODEL_TAG, "Loading product feed...")
                    _loadingStatus.value = true
                }
            }
        }
        Log.d(HOME_TAB_VIEWMODEL_TAG, "Product feed loaded successfully")
    }

    private val _loadingStatus = MutableStateFlow(true)
    val loadingStatus = _loadingStatus.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage = _errorMessage.asStateFlow()

    private val _productFeed = MutableStateFlow<CursorPage<ProductModel>?>(null)
    val productFeed = _productFeed.asStateFlow()


    init {
        Log.d(HOME_TAB_VIEWMODEL_TAG, "HomeTabViewModel initialized")
        viewModelScope.launch {
            loadProductFeed()
        }
    }
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