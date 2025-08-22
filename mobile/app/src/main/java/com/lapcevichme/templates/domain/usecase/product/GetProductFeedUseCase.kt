package com.lapcevichme.templates.domain.usecase.product

import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.ProductRepository
import jakarta.inject.Inject
import kotlinx.coroutines.flow.Flow

class GetProductFeedUseCase @Inject constructor(
    private val productRepository: ProductRepository
) {
    operator fun invoke(
        limit: Int = 20,
        cursor: String? = null
    ): Flow<Resource<CursorPage<ProductModel>>> {
        return productRepository.getProductsFeed(
            limit = limit,
            cursor = cursor
        )
    }
}