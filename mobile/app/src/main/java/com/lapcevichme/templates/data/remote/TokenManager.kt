package com.lapcevichme.templates.data.remote

import android.content.Context
import android.util.Log
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth_prefs")

class TokenManager(private val context: Context) {

    companion object {
        private val KEY_ACCESS_TOKEN = stringPreferencesKey("access_token")
        private val KEY_REFRESH_TOKEN = stringPreferencesKey("refresh_token")
    }

    /**
     * Асинхронно сохраняет токены в DataStore.
     */
    suspend fun saveTokens(accessToken: String, refreshToken: String?) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ACCESS_TOKEN] = accessToken
            if (refreshToken != null) {
                prefs[KEY_REFRESH_TOKEN] = refreshToken
            } else {
                prefs.remove(KEY_REFRESH_TOKEN)
            }
        }
    }

    /**
     * Возвращает Flow с access token. Flow будет эммитить новое значение при его изменении.
     */
    fun getAccessToken(): Flow<String?> {
        Log.d("TokenManager", "getAccessToken Flow created") // Лог создания Flow
        return context.dataStore.data.map { prefs ->
            val token = prefs[KEY_ACCESS_TOKEN]
            Log.d("TokenManager", "Access token from DataStore: $token") // Лог каждого значения из DataStore
            token
        }
    }

    /**
     * Возвращает Flow с refresh token.
     */
    fun getRefreshToken(): Flow<String?> {
        return context.dataStore.data.map { prefs ->
            prefs[KEY_REFRESH_TOKEN]
        }
    }

    /**
     * Приостанавливающая функция для получения первого доступного refresh token.
     * Удобно для использования в синхронных блоках, как Authenticator.
     */
    suspend fun getFirstRefreshToken(): String? {
        return getRefreshToken().firstOrNull()
    }

    /**
     * Асинхронно очищает все сохраненные токены.
     */
    suspend fun clearTokens() {
        context.dataStore.edit { prefs ->
            prefs.remove(KEY_ACCESS_TOKEN)
            prefs.remove(KEY_REFRESH_TOKEN)
        }
    }
}