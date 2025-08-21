package com.lapcevichme.templates.data.repository

import com.lapcevichme.templates.data.remote.ApiService
import com.lapcevichme.templates.data.remote.dto.toDto // Assuming toDto mappers are in the same package or imported correctly
import com.lapcevichme.templates.data.remote.dto.toDomain
import com.lapcevichme.templates.domain.model.Page
import com.lapcevichme.templates.domain.model.ProductCreate
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.ProductPatch
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.repository.ProductRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class ProductRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : ProductRepository {

    override fun getProducts(
        offset: Int,
        limit: Int,
        query: String?,
        orgId: String?
    ): Flow<Resource<Page<ProductModel>>> = flow {
        emit(Resource.Loading())
        try {
            if (orgId == null) {
                emit(Resource.Error("Organization ID is required to get products."))
                return@flow
            }
            val response = apiService.listOrganizationProducts(
                orgId = orgId,
                offset = offset,
                limit = limit,
                q = query
            )
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                emit(
                    Resource.Error(
                        response.message() ?: "Failed to get products: ${'$'}{response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun getProduct(productId: String): Flow<Resource<ProductModel>> = flow {
        emit(Resource.Loading())
        try {
            // Assuming we need an orgId to get a single product as well
            // For now, let's assume it's part of the context or passed implicitly
            // As there is no orgId in the interface, this might need clarification.
            // For demonstration, I'll use a placeholder orgId for compilation.
            val orgId = "PLACEHOLDER_ORG_ID" // This needs to be resolved from context/user session

            val response = apiService.getOrganizationProductDetails(
                orgId = orgId,
                productId = productId
            )
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                emit(
                    Resource.Error(
                        response.message() ?: "Failed to get product: ${'$'}{response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun createProduct(orgId: String, product: ProductCreate): Flow<Resource<ProductModel>> = flow {
        emit(Resource.Loading())
        try {
            val productCreateDto = product.toDto()
            val response = apiService.createProduct(orgId, productCreateDto)
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                emit(
                    Resource.Error(
                        response.message() ?: "Failed to create product: ${'$'}{response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun updateProduct(
        orgId: String,
        productId: String,
        patch: ProductPatch
    ): Flow<Resource<ProductModel>> = flow {
        emit(Resource.Loading())
        try {
            val productPatchDto = patch.toDto()
            val response = apiService.patchOrganizationProduct(orgId, productId, productPatchDto)
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                emit(
                    Resource.Error(
                        response.message() ?: "Failed to update product: ${'$'}{response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun deleteProduct(orgId: String, productId: String): Flow<Resource<Unit>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.deleteOrganizationProduct(orgId, productId)
            if (response.isSuccessful) {
                emit(Resource.Success(Unit))
            } else {
                emit(
                    Resource.Error(
                        response.message() ?: "Failed to delete product: ${'$'}{response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun publishProduct(orgId: String, productId: String): Flow<Resource<ProductModel>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.publishProduct(orgId, productId)
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                emit(
                    Resource.Error(
                        response.message() ?: "Failed to publish product: ${'$'}{response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun unpublishProduct(orgId: String, productId: String): Flow<Resource<ProductModel>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.unpublishProduct(orgId, productId)
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                emit(
                    Resource.Error(
                        response.message() ?: "Failed to unpublish product: ${'$'}{response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun uploadProductPhoto(
        orgId: String,
        productId: String,
        photoBytes: ByteArray,
        mimeType: String
    ): Flow<Resource<ProductModel>> = flow {
        emit(Resource.Loading())
        try {
            val requestBody = photoBytes.toRequestBody(mimeType.toMediaTypeOrNull())
            val body = MultipartBody.Part.createFormData("file", "photo", requestBody)
            val response = apiService.uploadProductPhoto(orgId, productId, body)
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                emit(
                    Resource.Error(
                        response.message() ?: "Failed to upload product photo: ${'$'}{response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun deleteProductPhoto(
        orgId: String,
        productId: String,
        mediaId: String
    ): Flow<Resource<Unit>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.deleteProductMediaFile(orgId, productId, mediaId)
            if (response.isSuccessful) {
                emit(Resource.Success(Unit))
            } else {
                emit(
                    Resource.Error(
                        response.message() ?: "Failed to delete product photo: ${'$'}{response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            emit(Resource.Error("Failed to connect to the server."))
        }
    }
}
