package com.lapcevichme.templates.presentation.viewmodel

import android.util.Log
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.usecase.product.GetProductUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProductDetailViewModel @Inject constructor(
    private val getProductUseCase: GetProductUseCase,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _product = MutableStateFlow<ProductModel?>(null)
    val product: StateFlow<ProductModel?> = _product

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage

    init {
        savedStateHandle.get<String>("productId")?.let { productId ->
            loadProductDetail(productId)
        }
    }

    private fun loadProductDetail(productId: String) {
        viewModelScope.launch {
            _loading.value = true
            _errorMessage.value = null
            try {
                getProductUseCase(productId).collect { result ->
                    when(result){
                        is Resource.Success -> {
                            _product.value = result.data
                        }
                        is Resource.Error -> Log.d("SUS", result.message.toString())
                        is Resource.Loading -> {}
                    }

                }
            } catch (e: Exception) {
                _errorMessage.value = e.localizedMessage ?: "Unknown error"
            } finally {
                _loading.value = false
            }
        }
    }

    fun addProductToCart(product: ProductModel) {
        // TODO: Implement actual add to cart logic, possibly via another UseCase
        // For now, just a placeholder.
    }
}
