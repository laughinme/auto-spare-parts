package com.lapcevichme.templates.domain.usecase.product

import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.ProductRepository
import jakarta.inject.Inject
import kotlinx.coroutines.flow.Flow

class GetProductDetailsUseCase @Inject constructor(
    private val productRepository: ProductRepository
){
    operator fun invoke(productId: String): Flow<Resource<ProductModel>>
    {
        return productRepository.getProductDetails(productId = productId)
    }
}