package com.lapcevichme.templates.presentation.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.usecase.product.GetProductFeedUseCase
import com.lapcevichme.templates.domain.usecase.product.ProductSearchUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

const val HOME_TAB_VIEWMODEL_TAG = "HomeTabViewModel"

@HiltViewModel
class HomeTabViewModel @Inject constructor(
    private val getProductFeedUseCase: GetProductFeedUseCase,
    private val productSearchUseCase: ProductSearchUseCase
) : ViewModel() {

    fun loadProductFeed(cursor: String? = null) {
        viewModelScope.launch {
            Log.d(HOME_TAB_VIEWMODEL_TAG, "Loading product feed")
            getProductFeedUseCase(cursor = cursor).collect { result ->
                when (result) {
                    is Resource.Success -> {
                        Log.d(
                            HOME_TAB_VIEWMODEL_TAG,
                            "Product feed loaded successfully: ${result.data}"
                        )
                        _loadingStatus.value = false
                        if (_productFeed.value != null) {
                            _productFeed.update { currentFeed ->
                                val oldFeed = currentFeed!!.items
                                val newFeed = result.data!!.items
                                result.data.copy(items = oldFeed + newFeed)
                            }
                        } else {
                            _productFeed.value = result.data
                        }
                        _lastCursor.value = result.data?.nextCursor
                    }

                    is Resource.Error -> {
                        Log.e(
                            HOME_TAB_VIEWMODEL_TAG,
                            "Error loading product feed: ${result.message}"
                        )
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
    }
    private val _lastCursor = MutableStateFlow<String?>(null)
    private val _oldCursor = MutableStateFlow<String>("")

    private val _loadingStatus = MutableStateFlow(true)
    val loadingStatus = _loadingStatus.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage = _errorMessage.asStateFlow()

    private val _productFeed = MutableStateFlow<CursorPage<ProductModel>?>(null)
    val productFeed = _productFeed.asStateFlow()


    init {
        Log.d(HOME_TAB_VIEWMODEL_TAG, "HomeTabViewModel initialized")
        loadProductFeed(_lastCursor.value)
    }
    private val _searchQuery = MutableStateFlow<String?>(null)
    val searchQuery = _searchQuery.asStateFlow()

    fun onSearchQueryChanged(query: String) {
        _searchQuery.value = query
    }

    fun addNextPage() {
        if (_lastCursor.value != _oldCursor.value) {
            loadProductFeed(cursor = _lastCursor.value)
            _oldCursor.value = _lastCursor.value ?: ""
        } else {
            Log.d(HOME_TAB_VIEWMODEL_TAG, "No new cursor to load")
        }
    }

}