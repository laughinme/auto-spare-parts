package com.lapcevichme.templates.data.repository

import android.util.Log
import com.lapcevichme.templates.data.remote.ApiService
import com.lapcevichme.templates.data.remote.dto.toDomain
import com.lapcevichme.templates.data.remote.dto.toDto
import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.enums.toDomain // Предполагается, что ProductDto имеет метод toDomain()
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

private const val TAG = "ProductRepositoryImpl"

class ProductRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : ProductRepository {

    override fun getProducts(
        offset: Int,
        limit: Int,
        query: String?,
        orgId: String?
    ): Flow<Resource<Page<ProductModel>>> = flow {
        Log.d(TAG, "getProducts called with offset: $offset, limit: $limit, query: $query, orgId: $orgId")
        emit(Resource.Loading())
        try {
            if (orgId == null) {
                Log.w(TAG, "getProducts: Organization ID is null.")
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
                Log.d(TAG, "getProducts successful for orgId: $orgId. Items count: ${response.body()!!.items.size}")
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "getProducts failed for orgId: $orgId. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(
                    Resource.Error(
                        errorBody ?: "Failed to get products: ${response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            Log.e(TAG, "getProducts HttpException for orgId: $orgId. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "getProducts IOException for orgId: $orgId. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun getProduct(productId: String, orgId: String): Flow<Resource<ProductModel>> = flow {
        Log.d(TAG, "getProduct called with productId: $productId")
        emit(Resource.Loading())
        try {
            // Placeholder orgId - this logic might need review for a real app
            Log.d(TAG, "getProduct using placeholder orgId: $orgId for productId: $productId")

            val response = apiService.getOrganizationProductDetails(
                orgId = orgId, 
                productId = productId
            )
            if (response.isSuccessful && response.body() != null) {
                Log.d(TAG, "getProduct successful for productId: $productId.")
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "getProduct failed for productId: $productId. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(
                    Resource.Error(
                        errorBody ?: "Failed to get product: ${response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            Log.e(TAG, "getProduct HttpException for productId: $productId. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "getProduct IOException for productId: $productId. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun createProduct(
        orgId: String,
        product: ProductCreate,
        photos: List<Pair<ByteArray, String>>? // Изменено для списка фото
    ): Flow<Resource<ProductModel>> = flow {
        Log.d(TAG, "createProduct called for orgId: $orgId, product brand: ${product.makeId}, with ${photos?.size ?: 0} photo(s)")
        emit(Resource.Loading())
        try {
            val productCreateDto = product.toDto()
            val createProductResponse = apiService.createProduct(orgId, productCreateDto)

            if (createProductResponse.isSuccessful && createProductResponse.body() != null) {
                var currentProductModel = createProductResponse.body()!!.toDomain()
                val createdProductId = createProductResponse.body()!!.id // Используем ID из ответа
                Log.d(TAG, "Product created successfully with ID: $createdProductId")

                if (!photos.isNullOrEmpty()) {
                    Log.d(TAG, "Preparing to upload ${photos.size} photo(s) for product ID: $createdProductId")

                    // 1. Создаем список для всех частей Multipart
                    val photoParts = mutableListOf<MultipartBody.Part>()

                    photos.forEachIndexed { index, photoPair ->
                        val photoBytes = photoPair.first
                        val mimeType = photoPair.second
                        val requestFile = photoBytes.toRequestBody(mimeType.toMediaTypeOrNull())

                        // 2. ВАЖНО: используем ключ "files", как ожидает бэкенд
                        val photoPart = MultipartBody.Part.createFormData(
                            "files", // <-- Ключ должен быть "files"!
                            "photo_${index + 1}.jpg",
                            requestFile
                        )
                        photoParts.add(photoPart)
                    }

                    try {
                        // 3. Отправляем все файлы ОДНИМ запросом
                        val uploadPhotosResponse = apiService.uploadProductPhotos(orgId, createdProductId, photoParts)

                        if (uploadPhotosResponse.isSuccessful && uploadPhotosResponse.body() != null) {
                            currentProductModel = uploadPhotosResponse.body()!!.toDomain()
                            Log.d(TAG, "All ${photos.size} photos uploaded successfully for product ID: $createdProductId.")
                        } else {
                            val errorBody = uploadPhotosResponse.errorBody()?.stringSafely()
                            Log.e(TAG, "Photos upload failed for product ID: $createdProductId. Code: ${uploadPhotosResponse.code()}, ErrorBody: $errorBody")
                        }

                        emit(Resource.Success(currentProductModel))

                    } catch (e: HttpException) {
                        Log.e(TAG, "HttpException during photos upload for product ID: $createdProductId.", e)
                        emit(Resource.Error(e.localizedMessage ?: "Network error during photo upload."))
                    } catch (e: IOException) {
                        Log.e(TAG, "IOException during photos upload for product ID: $createdProductId.", e)
                        emit(Resource.Error("Connection error during photo upload."))
                    }

                } else {
                    // Фотографии не были предоставлены
                    Log.d(TAG, "No photos provided. Returning created product data for ID: $createdProductId")
                    emit(Resource.Success(currentProductModel))
                }
            } else {
                val errorBody = createProductResponse.errorBody()?.stringSafely()
                Log.e(TAG, "createProduct API call failed for orgId: $orgId. Code: ${createProductResponse.code()}, Message: ${createProductResponse.message()}, ErrorBody: $errorBody")
                emit(Resource.Error(errorBody ?: "Failed to create product: ${createProductResponse.code()}"))
            }
        } catch (e: HttpException) {
            Log.e(TAG, "createProduct HttpException for orgId: $orgId. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "createProduct IOException for orgId: $orgId. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        } catch (e: Exception) { 
            Log.e(TAG, "createProduct general Exception for orgId: $orgId. Message: ${e.message}", e)
            emit(Resource.Error(e.message ?: "An unexpected error occurred."))
        }
    }

    override fun updateProduct(
        orgId: String,
        productId: String,
        patch: ProductPatch
    ): Flow<Resource<ProductModel>> = flow {
        Log.d(TAG, "updateProduct called for orgId: $orgId, productId: $productId")
        emit(Resource.Loading())
        try {
            val productPatchDto = patch.toDto()
            val response = apiService.patchOrganizationProduct(orgId, productId, productPatchDto)
            if (response.isSuccessful && response.body() != null) {
                Log.d(TAG, "updateProduct successful for orgId: $orgId, productId: $productId.")
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "updateProduct failed for orgId: $orgId, productId: $productId. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(
                    Resource.Error(
                        errorBody ?: "Failed to update product: ${response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            Log.e(TAG, "updateProduct HttpException for orgId: $orgId, productId: $productId. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "updateProduct IOException for orgId: $orgId, productId: $productId. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun deleteProduct(orgId: String, productId: String): Flow<Resource<Unit>> = flow {
        Log.d(TAG, "deleteProduct called for orgId: $orgId, productId: $productId")
        emit(Resource.Loading())
        try {
            val response = apiService.deleteOrganizationProduct(orgId, productId)
            if (response.isSuccessful) {
                Log.d(TAG, "deleteProduct successful for orgId: $orgId, productId: $productId.")
                emit(Resource.Success(Unit))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "deleteProduct failed for orgId: $orgId, productId: $productId. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(
                    Resource.Error(
                        errorBody ?: "Failed to delete product: ${response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            Log.e(TAG, "deleteProduct HttpException for orgId: $orgId, productId: $productId. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "deleteProduct IOException for orgId: $orgId, productId: $productId. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun publishProduct(orgId: String, productId: String): Flow<Resource<ProductModel>> = flow {
        Log.d(TAG, "publishProduct called for orgId: $orgId, productId: $productId")
        emit(Resource.Loading())
        try {
            val response = apiService.publishProduct(orgId, productId)
            if (response.isSuccessful && response.body() != null) {
                Log.d(TAG, "publishProduct successful for orgId: $orgId, productId: $productId.")
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "publishProduct failed for orgId: $orgId, productId: $productId. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(
                    Resource.Error(
                        errorBody ?: "Failed to publish product: ${response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            Log.e(TAG, "publishProduct HttpException for orgId: $orgId, productId: $productId. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "publishProduct IOException for orgId: $orgId, productId: $productId. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun unpublishProduct(orgId: String, productId: String): Flow<Resource<ProductModel>> = flow {
        Log.d(TAG, "unpublishProduct called for orgId: $orgId, productId: $productId")
        emit(Resource.Loading())
        try {
            val response = apiService.unpublishProduct(orgId, productId)
            if (response.isSuccessful && response.body() != null) {
                Log.d(TAG, "unpublishProduct successful for orgId: $orgId, productId: $productId.")
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "unpublishProduct failed for orgId: $orgId, productId: $productId. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(
                    Resource.Error(
                        errorBody ?: "Failed to unpublish product: ${response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            Log.e(TAG, "unpublishProduct HttpException for orgId: $orgId, productId: $productId. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "unpublishProduct IOException for orgId: $orgId, productId: $productId. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun uploadProductPhoto(
        orgId: String,
        productId: String,
        photoBytes: ByteArray,
        mimeType: String
    ): Flow<Resource<ProductModel>> = flow {
//        Log.d(TAG, "uploadProductPhoto called for orgId: $orgId, productId: $productId, mimeType: $mimeType, photoBytes length: ${photoBytes.size}")
//        emit(Resource.Loading())
//        try {
//            val requestBody = photoBytes.toRequestBody(mimeType.toMediaTypeOrNull())
//            val body = MultipartBody.Part.createFormData("file", "photo.jpg", requestBody) // Changed "photo" to "photo.jpg"
//            val response = apiService.uploadProductPhotos(orgId, productId, body)
//            if (response.isSuccessful && response.body() != null) {
//                Log.d(TAG, "uploadProductPhoto successful for orgId: $orgId, productId: $productId.")
//                emit(Resource.Success(response.body()!!.toDomain()))
//            } else {
//                val errorBody = response.errorBody()?.stringSafely()
//                Log.e(TAG, "uploadProductPhoto failed for orgId: $orgId, productId: $productId. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
//                emit(
//                    Resource.Error(
//                        errorBody ?: "Failed to upload product photo: ${response.code()}"
//                    )
//                )
//            }
//        } catch (e: HttpException) {
//            Log.e(TAG, "uploadProductPhoto HttpException for orgId: $orgId, productId: $productId. Message: ${e.localizedMessage}", e)
//            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
//        } catch (e: IOException) {
//            Log.e(TAG, "uploadProductPhoto IOException for orgId: $orgId, productId: $productId. Message: ${e.message}", e)
//            emit(Resource.Error("Failed to connect to the server."))
//        }
    }

    override fun deleteProductPhoto(
        orgId: String,
        productId: String,
        mediaId: String
    ): Flow<Resource<Unit>> = flow {
        Log.d(TAG, "deleteProductPhoto called for orgId: $orgId, productId: $productId, mediaId: $mediaId")
        emit(Resource.Loading())
        try {
            val response = apiService.deleteProductMediaFile(orgId, productId, mediaId)
            if (response.isSuccessful) {
                Log.d(TAG, "deleteProductPhoto successful for orgId: $orgId, productId: $productId, mediaId: $mediaId.")
                emit(Resource.Success(Unit))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "deleteProductPhoto failed for orgId: $orgId, productId: $productId, mediaId: $mediaId. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(
                    Resource.Error(
                        errorBody ?: "Failed to delete product photo: ${response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            Log.e(TAG, "deleteProductPhoto HttpException for orgId: $orgId, productId: $productId, mediaId: $mediaId. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "deleteProductPhoto IOException for orgId: $orgId, productId: $productId, mediaId: $mediaId. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun searchProductsCatalog(
        limit: Int,
        cursor: String?,
        query: String?,
        brand: String?,
        condition: String?,
        priceMin: Double?,
        priceMax: Double?
    ): Flow<Resource<CursorPage<ProductModel>>> = flow {
        Log.d(TAG, "searchProductsCatalog called with limit: $limit, cursor: $cursor, query: $query, brand: $brand, condition: $condition, priceMin: $priceMin, priceMax: $priceMax")
        emit(Resource.Loading())
        try {
            val response = apiService.searchProductsCatalog(
                limit = limit,
                cursor = cursor,
                q = query,
                brand = brand,
                condition = condition,
                priceMin = priceMin,
                priceMax = priceMax
            )
            if (response.isSuccessful && response.body() != null) {
                Log.d(TAG, "searchProductsCatalog successful. Items count: ${response.body()!!.items.size}")
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "searchProductsCatalog failed. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(
                    Resource.Error(
                        errorBody ?: "Failed to search products catalog: ${response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            Log.e(TAG, "searchProductsCatalog HttpException. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "searchProductsCatalog IOException. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun getProductsFeed(
        limit: Int,
        cursor: String?
    ): Flow<Resource<CursorPage<ProductModel>>> = flow {
        Log.d(TAG, "getProductsFeed called with limit: $limit, cursor: $cursor")
        emit(Resource.Loading())
        try {
            val response = apiService.getProductsFeed(
                limit = limit,
                cursor = cursor
            )
            if (response.isSuccessful && response.body() != null) {
                Log.d(TAG, "getProductsFeed successful. Items count: ${response.body()!!.items.size}")
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "getProductsFeed failed. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(
                    Resource.Error(
                        errorBody ?: "Failed to get products feed: ${response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            Log.e(TAG, "getProductsFeed HttpException. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "getProductsFeed IOException. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }

    override fun getProductDetails(productId: String): Flow<Resource<ProductModel>> = flow {
        Log.d(TAG, "getProductDetails called with productId: $productId")
        emit(Resource.Loading())
        try {
            val response = apiService.getProductDetails(productId = productId)
            if (response.isSuccessful && response.body() != null) {
                Log.d(TAG, "getProductDetails successful for productId: $productId.")
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "getProductDetails failed for productId: $productId. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(
                    Resource.Error(
                        errorBody ?: "Failed to get product details: ${response.code()}"
                    )
                )
            }
        } catch (e: HttpException) {
            Log.e(TAG, "getProductDetails HttpException for productId: $productId. Message: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Network error occurred."))
        } catch (e: IOException) {
            Log.e(TAG, "getProductDetails IOException for productId: $productId. Message: ${e.message}", e)
            emit(Resource.Error("Failed to connect to the server."))
        }
    }
}
