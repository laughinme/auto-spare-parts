package com.lapcevichme.templates.data.repository

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
                emit(
                    Resource.Error(
                        response.message() ?: "Не удалось получить профиль"
                    )
                )
            }
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "Ошибка сети"))
        } catch (e: IOException) {
            emit(Resource.Error("Не удалось подключиться к серверу."))
        }
    }

    override fun updateFullProfile(
        profileData: UserProfileUpdate
    ): Flow<Resource<UserProfile>> = flow {
        emit(Resource.Loading())
        try {
            // --- ШАГ 1: Обновляем основные данные профиля ---
            val profileRequest = UserPatchRequest(
                username = profileData.username,
                profilePicUrl = profileData.profilePicUrl,
                bio = profileData.bio,
                languageCode = profileData.languageCode
            )

            val profileResponse = apiService.updateProfile(profileRequest)
            if (profileResponse.isSuccessful) {
                // --- УСПЕХ: Запрос прошел ---
                val updatedProfileDto = profileResponse.body()!!
                emit(Resource.Success(updatedProfileDto.toDomain()))
            } else {
                // --- ОШИБКА: Запрос не прошел ---
                emit(Resource.Error("Failed to update profile. Code: ${profileResponse.code()}"))
            }

        } catch (e: Exception) {
            e.printStackTrace()
            emit(Resource.Error(e.message ?: "An unknown error occurred"))
        }
    }

    override fun updateProfilePicture(file: File): Flow<Resource<UserProfile>> = flow {
        emit(Resource.Loading())
        try {
            // Создаем RequestBody из файла
            val extension = file.extension

            // 2. Получаем MIME-тип из расширения. Это надежнее.
            val mimeType =
                MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension) ?: "image/jpeg"

            // 3. Создаем RequestBody
            val requestFile = file.asRequestBody(mimeType.toMediaTypeOrNull())
            val body = MultipartBody.Part.createFormData("file", file.name, requestFile)

            val response = apiService.updateProfilePicture(body)
            if (response.isSuccessful) {
                val updatedProfile = response.body()?.toDomain()
                if (updatedProfile != null) {
                    emit(Resource.Success(updatedProfile))
                } else {
                    emit(Resource.Error("Empty response after picture upload"))
                }
            } else {
                emit(Resource.Error("Failed to upload picture. Code: ${response.code()}"))
            }
        } catch (e: Exception) {
            e.printStackTrace()
            emit(
                Resource.Error(
                    e.message ?: "An unknown error occurred while uploading picture"
                )
            )
        }
    }
}
