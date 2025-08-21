package com.lapcevichme.templates.domain.usecase.product

import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.ProductRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class DeleteProductPhotoUseCase @Inject constructor(
    private val productRepository: ProductRepository
) {
    operator fun invoke(
        orgId: String,
        productId: String,
        mediaId: String
    ): Flow<Resource<Unit>> {
        return productRepository.deleteProductPhoto(orgId, productId, mediaId)
    }
}
