package com.lapcevichme.templates.data.di

import com.lapcevichme.templates.BuildConfig
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Named
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    /**
     * Предоставляет публикуемый ключ Stripe как именованную зависимость.
     * Это позволяет избежать конфликтов, если в приложении будут другие
     * строковые зависимости.
     *
     * ВАЖНО: Никогда не храни ключ прямо в коде.
     * Лучше всего получать его из BuildConfig или другого безопасного места.
     */
    @Provides
    @Singleton
    @Named("StripePublishableKey")
    fun provideStripePublishableKey(): String {
        // Замени на получение ключа из безопасного источника
        // return BuildConfig.STRIPE_PUBLISHABLE_KEY
        return BuildConfig.STRIPE_PUBLISHABLE_KEY
    }
}
