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
                    onNavigateToSignUp = {
                        navController.navigate(Routes.ROLE_PICKER) {
                            popUpTo(Routes.SIGN_IN) { inclusive = true }
                            launchSingleTop = true
                        }
                    }
                )
            }
            // В AppNavigation.kt
// ...
            composable(Routes.SIGN_UP) {
                SignUpScreen(
                    onSignUpSuccess = { selectedRole ->
                        // ДОБАВЛЯЕМ ЛОГИ ЗДЕСЬ
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
// ...
        }

        // --- ГРАФ 2: СОЗДАНИЕ ПРОФИЛЯ (УДАЛЕН/ЗАКОММЕНТИРОВАН) ---
        /*
        navigation(
            startDestination = Routes.AGE_PICKER, // Старый startDestination
            route = Routes.PROFILE_CREATION_GRAPH
        ) {
            // composable(Routes.STRIPE_ONBOARDING) { ... } был здесь
        }
        */

        // --- ГРАФ 3: ОСНОВНОЕ ПРИЛОЖЕНИЕ ---
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
                SparePartCreateScreen(
//                    onCreatedSuccessfully = {
//                        navController.popBackStack()
//                    }
                )
            }

            // Stripe Onboarding как обычный экран в MAIN_GRAPH
            composable(Routes.STRIPE_ONBOARDING) {
                ConnectOnboardingScreen(
                    onOnboardingComplete = {
                        // После завершения Stripe Onboarding, если пользователь пришел сюда после регистрации,
                        // он должен попасть в MAIN_GRAPH. Если он пришел из Профиля, он должен вернуться в Профиль.
                        // Для сценария "после регистрации" -> MAIN_GRAPH:
                        navController.navigate(Routes.HOME_TAB) { // Явно навигируем на главный экран табов
                            popUpTo(Routes.MAIN_GRAPH) { inclusive = true } // Делает MAIN_GRAPH (содержащий HOME_TAB) корневым
                            launchSingleTop = true // Чтобы не создавать новый экземпляр HOME_TAB, если он уже в стеке
                        }
                    }
                )
            }
        }
    }
}
