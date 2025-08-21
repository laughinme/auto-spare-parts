package com.lapcevichme.templates.domain.usecase

import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.ProductPatch
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.ProductRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class UpdateProductUseCase @Inject constructor(
    private val productRepository: ProductRepository
) {
    operator fun invoke(
        orgId: String,
        productId: String,
        patch: ProductPatch
    ): Flow<Resource<ProductModel>> {
        return productRepository.updateProduct(orgId, productId, patch)
    }
}
