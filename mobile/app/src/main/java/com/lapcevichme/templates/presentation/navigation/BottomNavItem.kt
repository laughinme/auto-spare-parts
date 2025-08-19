package com.lapcevichme.templates.presentation.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Face
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.ui.graphics.vector.ImageVector

/**
 * Sealed class для описания элементов Bottom Navigation Bar.
 * Каждый объект представляет одну вкладку.
 */
sealed class BottomNavItem(
    val route: String,
    val title: String,
    val icon: ImageVector
) {
    object Home : BottomNavItem(
        route = Routes.HOME_TAB, // Используем константу из Routes
        title = "Home",
        icon = Icons.Default.Home
    )
    object Friends : BottomNavItem(
        route = Routes.FRIENDS_TAB, // Используем константу из Routes
        title = "Friends",
        icon = Icons.Default.Face
    )
    object Chat : BottomNavItem(
        route = Routes.CHAT_TAB, // Используем константу из Routes
        title = "Chat",
        icon = Icons.Default.Email
    )
    object Profile : BottomNavItem(
        route = Routes.PROFILE_TAB, // Используем константу из Routes
        title = "Profile",
        icon = Icons.Default.Person
    )
}

