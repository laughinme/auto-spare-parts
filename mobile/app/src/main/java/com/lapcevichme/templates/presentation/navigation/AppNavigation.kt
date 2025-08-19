package com.lapcevichme.templates.presentation.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navigation
import com.lapcevichme.templates.presentation.screen.ConnectOnboardingScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.AgePickerScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.CityScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.GenderPickerScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.GreetingScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.SignInScreen
import com.lapcevichme.templates.presentation.screen.onboardingScreens.SignUpScreen

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
                    onNavigateToSignUp = { navController.navigate(Routes.SIGN_UP) }
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
            startDestination = Routes.AGE_PICKER,
            route = Routes.PROFILE_CREATION_GRAPH
        ) {
            composable(Routes.AGE_PICKER) {
                AgePickerScreen(
                    onNext = { navController.navigate(Routes.GENDER_PICKER) }
                )
            }
            composable(Routes.GENDER_PICKER) {
                GenderPickerScreen(
                    onNext = { navController.navigate(Routes.CITY_PICKER) }
                )
            }
            composable(Routes.CITY_PICKER) {
                CityScreen(
                    // Теперь переходим на экран Stripe
                    onProfileComplete = { navController.navigate(Routes.STRIPE_ONBOARDING) }
                )
            }

            // Добавляем новый экран в граф
            composable(Routes.STRIPE_ONBOARDING) {
                ConnectOnboardingScreen(
                    onOnboardingComplete = {
                        // После успешного онбординга переходим в основное приложение
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
            startDestination = Routes.HOME_TAB, // Стартовый экран - вкладка "Home"
            route = Routes.MAIN_GRAPH
        ) {
            // Экраны вкладок
            composable(Routes.HOME_TAB) {
                // TODO: Замените эту заглушку на ваш реальный HomeTabScreen()
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(text = "Home Screen (Placeholder)")
                }
            }
//            composable(Routes.FRIENDS_TAB) { FriendsTabScreen() }
//            composable(Routes.CHAT_TAB) { ChatTabScreen() }
//            composable(Routes.PROFILE_TAB) { ProfileTabScreen(
//                onLogoutSuccess = {
//                    // Переходим на граф аутентификации, очищая весь стек
//                    // до основного графа. Пользователь не сможет вернуться назад.
//                    navController.navigate(Routes.AUTH_GRAPH) {
//                        popUpTo(Routes.MAIN_GRAPH) {
//                            inclusive = true
//                        }
//                    }
//                }
//            ) }

            // Экран добавления ___
//            composable(Routes.ADD) {
//                AddScreen(
//                    onCreatedSuccessfully = {
//                        // После успешного создания возвращаемся назад
//                        navController.popBackStack()
//                    }
//                )
//            }
        }
    }
}
