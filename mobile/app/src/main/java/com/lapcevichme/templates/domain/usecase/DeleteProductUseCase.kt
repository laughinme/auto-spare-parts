package com.lapcevichme.templates.domain.usecase

import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.ProductRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class DeleteProductUseCase @Inject constructor(
    private val productRepository: ProductRepository
) {
    operator fun invoke(orgId: String, productId: String): Flow<Resource<Unit>> {
        return productRepository.deleteProduct(orgId, productId)
    }
}
