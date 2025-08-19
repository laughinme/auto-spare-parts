package com.lapcevichme.templates.presentation.navigation

import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.size
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavDestination
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.currentBackStackEntryAsState

/**
 * Нижняя панель навигации (BottomAppBar), которая отображается на главных экранах.
 * Размещается в Scaffold в MainActivity.
 */
@Composable
fun AppBottomAppBar(navController: NavHostController) {
    val navItems = listOf(
        BottomNavItem.Home,
        BottomNavItem.Friends,
        BottomNavItem.Chat,
        BottomNavItem.Profile
    )
    val leftItems = navItems.subList(0, navItems.size / 2)
    val rightItems = navItems.subList(navItems.size / 2, navItems.size)

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    BottomAppBar(
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 8.dp
    ) {
        // Левая группа иконок
        leftItems.forEach { screen ->
            BottomAppBarItem(
                modifier = Modifier.weight(1f),
                screen = screen,
                currentDestination = currentDestination,
                navController = navController
            )
        }

        // Невидимый Spacer в центре, который создает место для FAB.
        Spacer(Modifier.weight(1f))

        // Правая группа иконок
        rightItems.forEach { screen ->
            BottomAppBarItem(
                modifier = Modifier.weight(1f),
                screen = screen,
                currentDestination = currentDestination,
                navController = navController
            )
        }
    }
}

/**
 * Элемент навигации для BottomAppBar.
 */
@Composable
private fun RowScope.BottomAppBarItem(
    modifier: Modifier = Modifier,
    screen: BottomNavItem,
    currentDestination: NavDestination?,
    navController: NavHostController
) {
    val isSelected = currentDestination?.hierarchy?.any { it.route == screen.route } == true

    IconButton(
        modifier = modifier,
        onClick = {
            navController.navigate(screen.route) {
                popUpTo(navController.graph.findStartDestination().id) {
                    saveState = true
                }
                launchSingleTop = true
                restoreState = true
            }
        }) {
        Icon(
            imageVector = screen.icon,
            contentDescription = screen.title,
            modifier = Modifier.size(28.dp),
            tint = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
