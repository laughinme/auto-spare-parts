package com.lapcevichme.templates.presentation.screen

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchResultScreen(query: String) { // Экран принимает поисковый запрос
    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Результаты поиска") })
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            // Тут будет твоя логика для отображения результатов поиска
            // А пока просто покажем, что запрос до нас дошел.
            Text(text = "Вы искали: '$query'")
        }
    }
}