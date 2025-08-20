package com.lapcevichme.templates.presentation.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navigation
import com.lapcevichme.templates.presentation.screen.ConnectOnboardingScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.GreetingScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.RolePickerScreen // Assuming RolePickerScreen is now correctly imported
import com.lapcevichme.templates.presentation.screen.onboardingScreens.SignInScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.SignUpScreen
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
                RolePickerScreen( // Using the actual RolePickerScreen now
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
                    onNavigateToSignUp = { navController.navigate(Routes.ROLE_PICKER) } // Changed to ROLE_PICKER
                )
            }
            composable(Routes.SIGN_UP) {
                SignUpScreen(
                    onSignUpSuccess = {
                        navController.navigate(Routes.PROFILE_CREATION_GRAPH) {
                            popUpTo(Routes.AUTH_GRAPH) { inclusive = true }
                        }
                    },
                    onNavigateToSignIn = { navController.navigate(Routes.SIGN_IN) }
                )
            }
        }

        // --- ГРАФ 2: СОЗДАНИЕ ПРОФИЛЯ ---
        navigation(
            startDestination = Routes.AGE_PICKER, // TODO: Update startDestination if AGE_PICKER is removed or commented out
            route = Routes.PROFILE_CREATION_GRAPH
        ) {
            // composable(Routes.AGE_PICKER) {
            //     AgePickerScreen(
            //         onNext = { navController.navigate(Routes.GENDER_PICKER) }
            //     )
            // }
            // composable(Routes.GENDER_PICKER) {
            //     GenderPickerScreen(
            //         onNext = { navController.navigate(Routes.CITY_PICKER) }
            //     )
            // }
            // composable(Routes.CITY_PICKER) {
            //     CityScreen(
            //         // Теперь переходим на экран Stripe
            //         onProfileComplete = { navController.navigate(Routes.STRIPE_ONBOARDING) }
            //     )
            // }
            composable(Routes.STRIPE_ONBOARDING) { // Assuming this is the main part of profile creation now
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
            composable(Routes.HOME_TAB) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(text = "Home Screen (Placeholder)")
                }
            }
            // composable(Routes.FRIENDS_TAB) { FriendsTabScreen() }
            // composable(Routes.CHAT_TAB) { ChatTabScreen() }
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
            // composable(Routes.ADD) {
            //     AddScreen(
            //         onCreatedSuccessfully = {
            //             navController.popBackStack()
            //         }
            //     )
            // }
        }
    }
}

