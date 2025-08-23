package com.lapcevichme.templates.domain.usecase.product

import com.lapcevichme.templates.domain.model.Page
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.ProductRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetProductsUseCase @Inject constructor(
    private val productRepository: ProductRepository
) {
    operator fun invoke(
        offset: Int,
        limit: Int,
        query: String? = null,
        orgId: String? = null
    ): Flow<Resource<Page<ProductModel>>> {
        return productRepository.getProducts(
            offset = offset,
            limit = limit,
            query = query,
            orgId = orgId
        )
    }
}
