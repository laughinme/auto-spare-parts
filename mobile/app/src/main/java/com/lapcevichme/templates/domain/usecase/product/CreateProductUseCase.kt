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
    operator fun invoke(
        orgId: String,
        product: ProductCreate,
        photoBytes: ByteArray?, // Добавляем nullable ByteArray
        mimeType: String?      // Добавляем nullable String
    ): Flow<Resource<ProductModel>> {
        // Передаем новые параметры в репозиторий
        return productRepository.createProduct(orgId, product, photoBytes, mimeType)
    }
}

