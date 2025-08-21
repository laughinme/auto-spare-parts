package com.lapcevichme.templates.domain.usecase.product

import com.lapcevichme.templates.domain.model.ProductCreate
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.ProductRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class CreateProductUseCase @Inject constructor(
    private val productRepository: ProductRepository
) {
    operator fun invoke(orgId: String, product: ProductCreate): Flow<Resource<ProductModel>> {
        return productRepository.createProduct(orgId, product)
    }
}
