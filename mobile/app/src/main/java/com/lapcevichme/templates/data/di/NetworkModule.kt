package com.lapcevichme.templates.data.di

import android.content.Context
import com.lapcevichme.templates.BuildConfig
import com.lapcevichme.templates.data.remote.ApiService
import com.lapcevichme.templates.data.remote.TokenAuthenticator
import com.lapcevichme.templates.data.remote.TokenManager
import com.lapcevichme.templates.data.remote.TokenRefreshApiService
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Cache
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.File
import java.util.concurrent.TimeUnit
import javax.inject.Provider
import javax.inject.Qualifier
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideGson(): Gson {
        return GsonBuilder()
            .setDateFormat("yyyy-MM-dd")
            .create()
    }

    @Provides
    @Singleton
    fun provideCacheDir(@ApplicationContext context: Context): File {
        val cacheDir = File(context.cacheDir, "okhttp_cache")
        cacheDir.mkdirs()
        return cacheDir
    }

    @Provides
    @Singleton
    fun provideCache(cacheDir: File): Cache {
        val cacheSize = 10 * 1024 * 1024L // 10 MiB
        return Cache(cacheDir, cacheSize)
    }

    @Singleton
    @Provides
    fun provideTokenManager(@ApplicationContext context: Context): TokenManager {
        return TokenManager(context)
    }

    @Provides
    @Singleton
    fun provideLoggingInterceptor(): HttpLoggingInterceptor {
        return HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY else HttpLoggingInterceptor.Level.NONE
        }
    }

    @Provides
    @Singleton
    fun provideAuthInterceptor(tokenManager: TokenManager): Interceptor {
        return Interceptor { chain ->
            val accessToken = runBlocking {
                tokenManager.getAccessToken().first()
            }
            val request = chain.request().newBuilder()
            if (accessToken != null) {
                request.addHeader("Authorization", "Bearer $accessToken")
            }
            chain.proceed(request.build())
        }
    }

    @Provides
    @Singleton
    fun provideTokenAuthenticator(
        tokenManager: TokenManager,
        tokenRefreshService: Provider<TokenRefreshApiService>
    ): TokenAuthenticator {
        return TokenAuthenticator(tokenManager, tokenRefreshService)
    }

    @Qualifier
    @Retention(AnnotationRetention.BINARY)
    annotation class UnauthenticatedOkHttpClient

    @Provides
    @Singleton
    @UnauthenticatedOkHttpClient
    fun provideOkHttpClientForTokenRefresh(
        loggingInterceptor: HttpLoggingInterceptor,
        cache: Cache
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .cache(cache)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        loggingInterceptor: HttpLoggingInterceptor,
        authInterceptor: Interceptor,
        tokenAuthenticator: TokenAuthenticator,
        cache: Cache
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .authenticator(tokenAuthenticator)
            .cache(cache)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideTokenRefreshApiService(
        @UnauthenticatedOkHttpClient okHttpClient: OkHttpClient,
        gson: Gson
    ): TokenRefreshApiService {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
            .create(TokenRefreshApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideApiService(okHttpClient: OkHttpClient, gson: Gson): ApiService {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
            .create(ApiService::class.java)
    }
}
