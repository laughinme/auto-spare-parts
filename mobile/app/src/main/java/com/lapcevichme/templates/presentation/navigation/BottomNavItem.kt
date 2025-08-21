package com.lapcevichme.templates.presentation.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Face
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ShoppingCart
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
        icon = Icons.Default.ShoppingCart
    )
    object Garage : BottomNavItem(
        route = Routes.GARAGE_TAB, // Используем константу из Routes
        title = "Garage",
        icon = Icons.Default.Build
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

