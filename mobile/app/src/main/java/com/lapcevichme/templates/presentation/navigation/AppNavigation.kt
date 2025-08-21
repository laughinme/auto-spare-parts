package com.lapcevichme.templates.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navigation
import com.lapcevichme.templates.presentation.screen.ConnectOnboardingScreen // Убедись, что импорт есть
import com.lapcevichme.templates.presentation.screen.tabs.SparePartCreateScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.GreetingScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.RolePickerScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.SignInScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.SignUpScreen
import com.lapcevichme.templates.presentation.screen.tabs.ChatTabScreen
import com.lapcevichme.templates.presentation.screen.tabs.GarageTabScreen
import com.lapcevichme.templates.presentation.screen.tabs.HomeTabScreen
import com.lapcevichme.templates.presentation.screen.tabs.ProfileTabScreen
import com.lapcevichme.templates.presentation.viewmodel.OnboardingViewModel // <-- ДОБАВЛЕН ИМПОРТ

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
                        android.util.Log.d("AppNavigation_RoleDebug", "Role received in AppNavigation: '$selectedRole'")
                        android.util.Log.d("AppNavigation_RoleDebug", "Comparing with OnboardingViewModel.ROLE_SELLER ('${OnboardingViewModel.ROLE_SELLER}')")

                        if (selectedRole == OnboardingViewModel.ROLE_SELLER) {
                            android.util.Log.d("AppNavigation_RoleDebug", "Condition MET: Navigating to STRIPE_ONBOARDING")
                            navController.navigate(Routes.STRIPE_ONBOARDING) {
                                popUpTo(Routes.AUTH_GRAPH) { inclusive = true }
                            }
                        } else {
                            android.util.Log.d("AppNavigation_RoleDebug", "Condition NOT MET: Navigating to MAIN_GRAPH. Actual role was: '$selectedRole'")
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
                    },
                    onNavigateToStripeOnboarding = {
                        navController.navigate(Routes.STRIPE_ONBOARDING)
                    }
                )
            }
            composable(Routes.ADD) {
                // 5. ПЕРЕДАЕМ navController.popBackStack() В КАЧЕСТВЕ ДЕЙСТВИЯ
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
        }
    }
}
