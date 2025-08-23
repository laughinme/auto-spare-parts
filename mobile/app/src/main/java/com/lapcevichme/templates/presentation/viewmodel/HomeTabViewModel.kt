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
            // Устанавливаем статус загрузки перед началом запроса
            _loadingStatus.value = true
            getProductFeedUseCase(cursor = cursor).collect { result ->
                when (result) {
                    is Resource.Success -> {
                        _loadingStatus.value = false
                        result.data?.let { newFeedData ->
                            if (_productFeed.value != null) {
                                _productFeed.update { currentFeed ->
                                    val oldItems = currentFeed?.items ?: emptyList()
                                    val newItems = newFeedData.items
                                    newFeedData.copy(items = oldItems + newItems)
                                }
                            } else {
                                _productFeed.value = newFeedData
                            }
                            _lastCursor.value = newFeedData.nextCursor
                            Log.d(HOME_TAB_VIEWMODEL_TAG, "Success. Next cursor: ${_lastCursor.value}")
                        }
                    }

                    is Resource.Error -> {
                        _loadingStatus.value = false
                        _errorMessage.value = result.message
                        Log.e(HOME_TAB_VIEWMODEL_TAG, "Error: ${result.message}")
                    }

                    is Resource.Loading -> {
                        _loadingStatus.value = true
                    }
                }
            }
        }
    }

    private val _lastCursor = MutableStateFlow<String?>(null)

    private val _loadingStatus = MutableStateFlow(true)
    val loadingStatus = _loadingStatus.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage = _errorMessage.asStateFlow()

    private val _productFeed = MutableStateFlow<CursorPage<ProductModel>?>(null)
    val productFeed = _productFeed.asStateFlow()

    init {
        Log.d(HOME_TAB_VIEWMODEL_TAG, "HomeTabViewModel initialized")
        loadProductFeed(null) // Загружаем первую страницу
    }

    fun addNextPage() {
        if (_loadingStatus.value) {
            Log.d(HOME_TAB_VIEWMODEL_TAG, "addNextPage ignored: Already loading.")
            return
        }
        
        if (_lastCursor.value == null) {
            Log.d(HOME_TAB_VIEWMODEL_TAG, "addNextPage ignored: Reached the end of the feed.")
            return
        }
        
        loadProductFeed(cursor = _lastCursor.value)
    }
}