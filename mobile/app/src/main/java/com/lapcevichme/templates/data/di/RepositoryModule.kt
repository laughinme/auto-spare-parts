package com.lapcevichme.templates.data.di

import com.lapcevichme.templates.data.repository.AppStripeRepositoryImpl
import com.lapcevichme.templates.data.repository.AuthRepositoryImpl
import com.lapcevichme.templates.data.repository.GeographyRepositoryImpl
import com.lapcevichme.templates.data.repository.ProductRepositoryImpl
import com.lapcevichme.templates.data.repository.UserRepositoryImpl
import com.lapcevichme.templates.domain.repository.AppStripeRepository
import com.lapcevichme.templates.domain.repository.AuthRepository
import com.lapcevichme.templates.domain.repository.GeographyRepository
import com.lapcevichme.templates.domain.repository.ProductRepository
import com.lapcevichme.templates.domain.repository.UserRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    @Singleton
    abstract fun bindAuthRepository(
        authRepositoryImpl: AuthRepositoryImpl
    ): AuthRepository

    @Binds
    @Singleton
    abstract fun bindProfileRepository(
        profileRepositoryImpl: UserRepositoryImpl
    ): UserRepository

    @Binds
    @Singleton
    abstract fun bindGeographyRepository(
        geographyRepositoryImpl: GeographyRepositoryImpl
    ): GeographyRepository

    @Binds
    @Singleton
    abstract fun bindAppStripeRepository(
        appStripeRepositoryImpl: AppStripeRepositoryImpl
    ): AppStripeRepository

    @Binds
    @Singleton
    abstract fun bindProductRepository(
        productRepositoryImpl: ProductRepositoryImpl
    ): ProductRepository
}