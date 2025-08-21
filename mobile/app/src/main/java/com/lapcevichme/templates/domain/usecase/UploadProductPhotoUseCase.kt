package com.lapcevichme.templates.domain.usecase

import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.ProductRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class UploadProductPhotoUseCase @Inject constructor(
    private val productRepository: ProductRepository
) {
    operator fun invoke(
        orgId: String,
        productId: String,
        photoBytes: ByteArray,
        mimeType: String
    ): Flow<Resource<ProductModel>> {
        return productRepository.uploadProductPhoto(orgId, productId, photoBytes, mimeType)
    }
}
