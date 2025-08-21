package com.lapcevichme.templates.data.repository

import android.util.Log

private const val TAG = "UTILS"

fun okhttp3.ResponseBody.stringSafely(): String? {
    return try {
        this.string()
    } catch (e: Exception) {
        Log.e(TAG, "Error reading response body string", e)
        null
    }
}
