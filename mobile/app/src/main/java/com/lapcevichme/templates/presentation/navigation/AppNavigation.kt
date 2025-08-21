package com.lapcevichme.templates.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navigation
import com.example.partmarketplace.SparePartCreateScreen
import com.lapcevichme.templates.presentation.screen.ConnectOnboardingScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.GreetingScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.RolePickerScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.SignInScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.SignUpScreen
import com.lapcevichme.templates.presentation.screen.tabs.ChatTabScreen
import com.lapcevichme.templates.presentation.screen.tabs.GarageTabScreen
import com.lapcevichme.templates.presentation.screen.tabs.HomeTabScreen
import com.lapcevichme.templates.presentation.screen.tabs.ProfileTabScreen

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
        // --- ГРАФ 1: АУТЕНТИФИКАЦИЯ ---
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
                    // ИЗ   МЕНЕНИЕ 1: Правильный переход назад к выбору роли
                    onNavigateToSignUp = {
                        navController.navigate(Routes.ROLE_PICKER) {
                            // Удаляем SignInScreen из стека
                            popUpTo(Routes.SIGN_IN) { inclusive = true }
                            // Гарантируем, что не создадим копию RolePickerScreen
                            launchSingleTop = true
                        }
                    }
                )
            }
            composable(Routes.SIGN_UP) {
                SignUpScreen(
                    onSignUpSuccess = {
                        navController.navigate(Routes.PROFILE_CREATION_GRAPH) {
                            popUpTo(Routes.AUTH_GRAPH) { inclusive = true }
                        }
                    },
                    // ИЗМЕНЕНИЕ 2: Правильный переход на экран входа
                    onNavigateToSignIn = {
                        navController.navigate(Routes.SIGN_IN) {
                            // Удаляем SignUpScreen из стека
                            popUpTo(Routes.SIGN_UP) { inclusive = true }
                            // Гарантируем, что не создадим копию SignInScreen
                            launchSingleTop = true
                        }
                    }
                )
            }
        }

        // --- ГРАФ 2: СОЗДАНИЕ ПРОФИЛЯ ---
        navigation(
            startDestination = Routes.AGE_PICKER, // TODO: Update startDestination
            route = Routes.PROFILE_CREATION_GRAPH
        ) {
            // ... (остальной код без изменений)
            composable(Routes.STRIPE_ONBOARDING) {
                ConnectOnboardingScreen(
                    onOnboardingComplete = {
                        navController.navigate(Routes.MAIN_GRAPH) {
                            popUpTo(Routes.PROFILE_CREATION_GRAPH) {
                                inclusive = true
                            }
                        }
                    }
                )
            }
        }

        // --- ГРАФ 3: ОСНОВНОЕ ПРИЛОЖЕНИЕ ---
        navigation(
            startDestination = Routes.HOME_TAB,
            route = Routes.MAIN_GRAPH
        ) {
            // ... (остальной код без изменений)
            composable(Routes.HOME_TAB) {
                HomeTabScreen()
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
                    }
                )
            }
            composable(Routes.ADD) {
                SparePartCreateScreen(
//                    onCreatedSuccessfully = {
//                        navController.popBackStack()
//                    }
                )
            }
        }
    }
}