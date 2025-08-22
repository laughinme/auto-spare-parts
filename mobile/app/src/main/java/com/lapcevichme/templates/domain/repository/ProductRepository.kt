package com.lapcevichme.templates.domain.repository

import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.Page
import com.lapcevichme.templates.domain.model.ProductCreate
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.ProductPatch
import com.lapcevichme.templates.domain.model.Resource
import kotlinx.coroutines.flow.Flow

interface ProductRepository {
    fun getProducts(
        offset: Int,
        limit: Int,
        query: String? = null,
        orgId: String? = null
    ): Flow<Resource<Page<ProductModel>>>

    fun getProduct(productId: String): Flow<Resource<ProductModel>>

    fun createProduct(
        orgId: String,
        product: ProductCreate,
        photoBytes: ByteArray?, // Изменено
        mimeType: String?     // Изменено
    ): Flow<Resource<ProductModel>>

    fun updateProduct(
        orgId: String,
        productId: String,
        patch: ProductPatch
    ): Flow<Resource<ProductModel>>

    fun deleteProduct(orgId: String, productId: String): Flow<Resource<Unit>>

    fun publishProduct(orgId: String, productId: String): Flow<Resource<ProductModel>>

    fun unpublishProduct(orgId: String, productId: String): Flow<Resource<ProductModel>>

    fun uploadProductPhoto(
        orgId: String,
        productId: String,
        photoBytes: ByteArray,
        mimeType: String
    ): Flow<Resource<ProductModel>>

    fun deleteProductPhoto(
        orgId: String,
        productId: String,
        mediaId: String
    ): Flow<Resource<Unit>>

    fun searchProductsCatalog(
        limit: Int = 20,
        cursor: String? = null,
        query: String? = null,
        brand: String? = null,
        condition: String? = null,
        priceMin: Double? = null,
        priceMax: Double? = null
    ): Flow<Resource<CursorPage<ProductModel>>>

    fun getProductsFeed(
        limit: Int = 20,
        cursor: String? = null
    ): Flow<Resource<CursorPage<ProductModel>>>

    fun getProductDetails(
        productId: String
    ): Flow<Resource<ProductModel>>
}
