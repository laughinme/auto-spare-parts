package com.lapcevichme.templates.domain.repository

import com.lapcevichme.templates.domain.model.Page
import com.lapcevichme.templates.domain.model.ProductCreate
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.ProductPatch
import com.lapcevichme.templates.domain.model.Resource
import kotlinx.coroutines.flow.Flow
import java.util.UUID

interface ProductRepository {
    fun getProducts(
        offset: Int,
        limit: Int,
        query: String? = null,
        orgId: UUID? = null
    ): Flow<Resource<Page<ProductModel>>>

    fun getProduct(productId: UUID): Flow<Resource<ProductModel>>

    fun createProduct(orgId: UUID, product: ProductCreate): Flow<Resource<ProductModel>>

    fun updateProduct(
        orgId: UUID,
        productId: UUID,
        patch: ProductPatch
    ): Flow<Resource<ProductModel>>

    fun deleteProduct(orgId: UUID, productId: UUID): Flow<Resource<Unit>>

    fun publishProduct(orgId: UUID, productId: UUID): Flow<Resource<ProductModel>>

    fun unpublishProduct(orgId: UUID, productId: UUID): Flow<Resource<ProductModel>>

    fun uploadProductPhoto(
        orgId: UUID,
        productId: UUID,
        photoBytes: ByteArray,
        mimeType: String
    ): Flow<Resource<ProductModel>>

    fun deleteProductPhoto(
        orgId: UUID,
        productId: UUID,
        mediaId: UUID
    ): Flow<Resource<Unit>>
}
