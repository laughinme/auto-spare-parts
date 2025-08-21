package com.lapcevichme.templates.data.repository

import android.util.Log
import android.webkit.MimeTypeMap
import com.lapcevichme.templates.data.remote.ApiService
import com.lapcevichme.templates.data.remote.dto.UserPatchRequest
import com.lapcevichme.templates.data.remote.dto.toDomain
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.UserProfile
import com.lapcevichme.templates.domain.model.UserProfileUpdate
import com.lapcevichme.templates.domain.repository.UserRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import retrofit2.HttpException
import java.io.File
import java.io.IOException
import javax.inject.Inject

private const val TAG = "UserRepositoryImpl"

class UserRepositoryImpl @Inject constructor(
    private val apiService: ApiService
) : UserRepository {

    override fun getProfile(): Flow<Resource<UserProfile>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.getMe()
            if (response.isSuccessful && response.body() != null) {
                emit(Resource.Success(response.body()!!.toDomain()))
            } else {
                Log.e(TAG, "GetProfile failed: Code: ${response.code()}, Message: ${response.message()}, ErrorBody: ${response.errorBody()?.stringSafely()}") // <--- ДОБАВЛЕНО
                emit(
                    Resource.Error(
                        response.message() ?: "Не удалось получить профиль"
                    )
                )
            }
        } catch (e: HttpException) {
            Log.e(TAG, "GetProfile HttpException: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Ошибка сети"))
        } catch (e: IOException) {
            Log.e(TAG, "GetProfile IOException: ${e.message}", e)
            emit(Resource.Error("Не удалось подключиться к серверу."))
        }
    }

    override fun updateFullProfile(
        profileData: UserProfileUpdate
    ): Flow<Resource<UserProfile>> = flow {
        emit(Resource.Loading())
        try {
            val profileRequest = UserPatchRequest(
                username = profileData.username,
                profilePicUrl = profileData.profilePicUrl,
                bio = profileData.bio,
                languageCode = profileData.languageCode
            )
            Log.d(TAG, "Updating full profile with data: $profileRequest")

            val profileResponse = apiService.updateProfile(profileRequest)
            if (profileResponse.isSuccessful) {
                val updatedProfileDto = profileResponse.body()!!
                Log.d(TAG, "UpdateFullProfile successful: $updatedProfileDto")
                emit(Resource.Success(updatedProfileDto.toDomain()))
            } else {
                Log.e(TAG, "UpdateFullProfile failed: Code: ${profileResponse.code()}, Message: ${profileResponse.message()}, ErrorBody: ${profileResponse.errorBody()?.stringSafely()}") // <--- ИЗМЕНЕНО
                emit(Resource.Error("Failed to update profile. Code: ${profileResponse.code()}"))
            }

        } catch (e: HttpException) {
            Log.e(TAG, "UpdateFullProfile HttpException: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Ошибка сети при обновлении профиля"))
        } catch (e: IOException) {
            Log.e(TAG, "UpdateFullProfile IOException: ${e.message}", e)
            emit(Resource.Error("Не удалось подключиться к серверу для обновления профиля."))
        } catch (e: Exception) {
            Log.e(TAG, "UpdateFullProfile Exception: ${e.message}", e)
            e.printStackTrace()
            emit(Resource.Error(e.message ?: "An unknown error occurred"))
        }
    }

    override fun updateProfilePicture(file: File): Flow<Resource<UserProfile>> = flow {
        Log.d(TAG, "updateProfilePicture called with file: ${file.path}")
        emit(Resource.Loading())
        try {
            val extension = file.extension
            Log.d(TAG, "File extension: $extension")

            val mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension) ?: "image/jpeg"
            Log.d(TAG, "MIME type: $mimeType")
            Log.d(TAG, "File name for multipart: ${file.name}")
            Log.d(TAG, "File exists: ${file.exists()}, File size: ${file.length()} bytes")


            val requestFile = file.asRequestBody(mimeType.toMediaTypeOrNull())
            val body = MultipartBody.Part.createFormData("file", file.name, requestFile)

            Log.d(TAG, "Attempting to upload profile picture...")
            val response = apiService.updateProfilePicture(body)

            Log.d(TAG, "UpdateProfilePicture response: Code: ${response.code()}, Message: ${response.message()}")

            if (response.isSuccessful) {
                val updatedProfile = response.body()?.toDomain()
                if (updatedProfile != null) {
                    Log.d(TAG, "Profile picture updated successfully: $updatedProfile")
                    emit(Resource.Success(updatedProfile))
                } else {
                    Log.e(TAG, "Empty response body after picture upload. Code: ${response.code()}")
                    emit(Resource.Error("Empty response after picture upload"))
                }
            } else {
                val errorBody = response.errorBody()?.stringSafely()
                Log.e(TAG, "Failed to upload picture. Code: ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                emit(Resource.Error("Failed to upload picture. Code: ${response.code()}. Details: $errorBody"))
            }
        } catch (e: HttpException) { // <--- ДОБАВЛЕНО
            Log.e(TAG, "UpdateProfilePicture HttpException: ${e.localizedMessage}", e)
            emit(Resource.Error(e.localizedMessage ?: "Ошибка сети при загрузке изображения"))
        } catch (e: IOException) { // <--- ДОБАВЛЕНО
            Log.e(TAG, "UpdateProfilePicture IOException: ${e.message}", e)
            emit(Resource.Error("Не удалось подключиться к серверу для загрузки изображения."))
        } catch (e: Exception) {
            Log.e(TAG, "Unknown error in updateProfilePicture: ${e.message}", e)
            e.printStackTrace()
            emit(
                Resource.Error(
                    e.message ?: "An unknown error occurred while uploading picture"
                )
            )
        }
    }
}