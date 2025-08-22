package com.lapcevichme.templates.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import androidx.navigation.navigation
import com.lapcevichme.templates.presentation.screen.ConnectOnboardingScreen
import com.lapcevichme.templates.presentation.screen.SearchResultScreen // <-- ДОБАВЛЕН ИМПОРТ
import com.lapcevichme.templates.presentation.screen.tabs.SparePartCreateScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.GreetingScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.RolePickerScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.SignInScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.SignUpScreen
import com.lapcevichme.templates.presentation.screen.tabs.ChatTabScreen
import com.lapcevichme.templates.presentation.screen.tabs.GarageTabScreen
import com.lapcevichme.templates.presentation.screen.tabs.HomeTabScreen
import com.lapcevichme.templates.presentation.screen.tabs.ProfileTabScreen
import com.lapcevichme.templates.presentation.viewmodel.OnboardingViewModel

/**
 * Главный навигационный компонент приложения.
 * @param navController NavController для управления навигацией.
 * @param startDestination Стартовый маршрут-граф, который определяется в MainActivity.
 */

@Composable
fun AppNavigation(navController: NavHostController, startDestination: String) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        navigation(
            startDestination = Routes.GREETING,
            route = Routes.AUTH_GRAPH
        ) {
            composable(Routes.GREETING) {
                GreetingScreen(
                    onNavigateToSignUp = { navController.navigate(Routes.ROLE_PICKER) },
                    onNavigateToSignIn = { navController.navigate(Routes.SIGN_IN) }
                )
            }
            composable(Routes.ROLE_PICKER) {
                RolePickerScreen(
                    onNavigateToSignUp = { navController.navigate(Routes.SIGN_UP) },
                    onNavigateToSignIn = { navController.navigate(Routes.SIGN_IN) }
                )
            }
            composable(Routes.SIGN_IN) {
                SignInScreen(
                    onSignInSuccess = {
                        navController.navigate(Routes.MAIN_GRAPH) {
                            popUpTo(Routes.AUTH_GRAPH) { inclusive = true }
                        }
                    },
                    onNavigateToSignUp = {
                        navController.navigate(Routes.ROLE_PICKER) {
                            popUpTo(Routes.SIGN_IN) { inclusive = true }
                            launchSingleTop = true
                        }
                    }
                )
            }
            composable(Routes.SIGN_UP) {
                SignUpScreen(
                    onSignUpSuccess = { selectedRole ->
                        if (selectedRole == OnboardingViewModel.ROLE_SELLER) {
                            navController.navigate(Routes.STRIPE_ONBOARDING) {
                                popUpTo(Routes.AUTH_GRAPH) { inclusive = true }
                            }
                        } else {
                            navController.navigate(Routes.MAIN_GRAPH) {
                                popUpTo(Routes.AUTH_GRAPH) { inclusive = true }
                            }
                        }
                    },
                    onNavigateToSignIn = {
                        navController.navigate(Routes.SIGN_IN) {
                            popUpTo(Routes.SIGN_UP) { inclusive = true }
                            launchSingleTop = true
                        }
                    }
                )
            }
        }

        navigation(
            startDestination = Routes.HOME_TAB,
            route = Routes.MAIN_GRAPH
        ) {
            composable(Routes.HOME_TAB) {
                HomeTabScreen(
                    onNavigateToSearch = { searchText ->
                        // Кодируем текст, чтобы он безопасно передался в качестве аргумента
                        val encodedQuery = java.net.URLEncoder.encode(searchText, "UTF-8")
                        navController.navigate("${Routes.SEARCH_RESULT_BASE}/$encodedQuery")
                    }
                )
            }
            composable(Routes.GARAGE_TAB) { GarageTabScreen() }
            composable(Routes.CHAT_TAB) { ChatTabScreen() }
            composable(Routes.PROFILE_TAB) {
                ProfileTabScreen(
                    onLogoutSuccess = {
                        navController.navigate(Routes.AUTH_GRAPH) {
                            popUpTo(Routes.MAIN_GRAPH) {
                                inclusive = true
                            }
                        }
                    },
                    onNavigateToStripeOnboarding = {
                        navController.navigate(Routes.STRIPE_ONBOARDING)
                    }
                )
            }
            composable(Routes.ADD) {
                SparePartCreateScreen(
                    onNavigateBack = {
                        navController.popBackStack()
                    }
                )
            }

            composable(Routes.STRIPE_ONBOARDING) {
                ConnectOnboardingScreen(
                    onOnboardingComplete = {
                        navController.navigate(Routes.HOME_TAB) {
                            popUpTo(Routes.MAIN_GRAPH) { inclusive = true }
                            launchSingleTop = true
                        }
                    }
                )
            }

            // Новый экран результатов поиска
            composable(
                route = Routes.SEARCH_RESULT,
                arguments = listOf(navArgument("query") { type = NavType.StringType })
            ) { backStackEntry ->
                // Достаем аргумент из маршрута
                val query = backStackEntry.arguments?.getString("query") ?: ""
                // Передаем его в наш экран
                SearchResultScreen(query = query)
            }
        }
    }
}