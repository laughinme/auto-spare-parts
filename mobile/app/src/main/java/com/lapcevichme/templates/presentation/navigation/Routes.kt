package com.lapcevichme.templates.presentation.navigation

/**
 * Объект для хранения всех маршрутов навигации.
 */
object Routes {
    // --- ГРАФЫ НАВИГАЦИИ ---
    const val AUTH_GRAPH = "auth_graph"
    const val PROFILE_CREATION_GRAPH = "profile_creation_graph"
    const val MAIN_GRAPH = "main_graph"


    // --- ЭКРАНЫ ГРАФА АУТЕНТИФИКАЦИИ (AUTH_GRAPH) ---
    const val GREETING = "greeting"
    const val SIGN_IN = "sign_in"
    const val SIGN_UP = "sign_up"
    const val ROLE_PICKER = "role_picker"


    // --- ЭКРАНЫ ГРАФА СОЗДАНИЯ ПРОФИЛЯ (PROFILE_CREATION_GRAPH) ---
    const val AGE_PICKER = "age_picker"
    const val GENDER_PICKER = "gender_picker"
    const val CITY_PICKER = "city_picker"
    const val STRIPE_ONBOARDING = "stripe_onboarding"

    // --- ЭКРАНЫ ОСНОВНОГО ГРАФА (MAIN_GRAPH) ---
    // Маршруты для вкладок Bottom Navigation Bar
    const val HOME_TAB = "home_tab"
    const val FRIENDS_TAB = "friends_tab"
    const val CHAT_TAB = "chat_tab"
    const val PROFILE_TAB = "profile_tab"

    // Маршрут для экрана добавления
    const val ADD = "add"
}

