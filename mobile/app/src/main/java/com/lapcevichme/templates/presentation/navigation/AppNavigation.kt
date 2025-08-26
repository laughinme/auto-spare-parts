// AppNavigation.kt
package com.lapcevichme.templates.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navigation
import com.lapcevichme.templates.presentation.screen.ConnectOnboardingScreen
import com.lapcevichme.templates.presentation.screen.SearchResultScreen
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
import com.lapcevichme.templates.presentation.viewmodel.SearchViewModel

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
            // Эта вспомогательная функция получает ViewModel, привязанную к графу навигации
            @Composable
            fun sharedSearchViewModel(): SearchViewModel {
                val parentEntry = remember(navController.currentBackStackEntry) {
                    navController.getBackStackEntry(Routes.MAIN_GRAPH)
                }
                return hiltViewModel<SearchViewModel>(parentEntry)
            }

            composable(Routes.HOME_TAB) {
                // Получаем общую ViewModel
                val searchViewModel: SearchViewModel = sharedSearchViewModel()
                HomeTabScreen(
                    onNavigateToSearch = {
                        navController.navigate(Routes.SEARCH_RESULT)
                    },
                    // Передаём общую ViewModel на экран
                    searchViewModel = searchViewModel
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

            // Экран результатов поиска теперь тоже использует общую ViewModel
            composable(route = Routes.SEARCH_RESULT) {
                val searchViewModel: SearchViewModel = sharedSearchViewModel()
                SearchResultScreen(viewModel = searchViewModel)
            }
        }
    }
}
