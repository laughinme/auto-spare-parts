package com.lapcevichme.templates.presentation.screen.onboardingScreens

import android.content.res.Configuration
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
// Убедись, что OnboardingViewModel импортирован, если константы в нем
import com.lapcevichme.templates.presentation.viewmodel.OnboardingViewModel
import com.lapcevichme.templates.ui.theme.PreviewTheme

@Composable
fun RolePickerScreen(
    viewModel: OnboardingViewModel = hiltViewModel(), // Используем OnboardingViewModel
    onNavigateToSignUp: () -> Unit,
    onNavigateToSignIn: () -> Unit
) {
    val selectedRole : String? by viewModel.role.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // --- Верхняя часть: Заголовок ---
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "Добро пожаловать!",
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Выберите вашу роль на платформе",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // --- Центральная часть: Карточки выбора ---
        Box(
            modifier = Modifier
                .weight(1.5f)
                .fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(modifier = Modifier.weight(1f)) {
                    RoleCard(
                        title = "Покупатель",
                        description = "Ищу запчасти для своих авто",
                        icon = "🛒",
                        isSelected = selectedRole == OnboardingViewModel.ROLE_BUYER, // Сравнение с константой
                        onClick = { viewModel.onRoleClicked(OnboardingViewModel.ROLE_BUYER) } // Используем константу
                    )
                }
                Box(modifier = Modifier.weight(1f)) {
                    RoleCard(
                        title = "Поставщик",
                        description = "Размещаю запчасти и обрабатываю заказы",
                        icon = "🏪",
                        isSelected = selectedRole == OnboardingViewModel.ROLE_SELLER, // Сравнение с константой
                        onClick = { viewModel.onRoleClicked(OnboardingViewModel.ROLE_SELLER) } // Используем константу
                    )
                }
            }
        }

        // --- Нижняя часть: Кнопка "Продолжить" и ссылка на Sign In ---
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(bottom = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Bottom
        ) {
            Button(
                modifier = Modifier
                    .height(56.dp)
                    .fillMaxWidth(0.9f),
                onClick = onNavigateToSignUp, // Навигация происходит по этой кнопке
                enabled = selectedRole != null // Кнопка активна, если роль выбрана
            ) {
                Text("Продолжить", fontSize = 18.sp)
            }
            Spacer(modifier = Modifier.height(16.dp))
            TextButton(onClick = onNavigateToSignIn) {
                Text("Already have an account? Sign In")
            }
        }
    }
}

@Composable
fun RoleCard(
    title: String,
    description: String,
    icon: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val borderColor = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
    val backgroundColor = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surface

    Card(
        modifier = Modifier
            .fillMaxSize()
            .clickable(onClick = onClick),
        shape = MaterialTheme.shapes.extraLarge,
        border = BorderStroke(if (isSelected) 2.dp else 1.dp, borderColor),
        colors = CardDefaults.cardColors(containerColor = backgroundColor)
    ) {
        Row(
            modifier = Modifier.padding(20.dp).fillMaxSize(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(text = icon, fontSize = 32.sp)
            Column {
                Text(text = title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = description, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Preview(showBackground = true, name = "Light Theme")
@Preview(
    showBackground = true,
    uiMode = Configuration.UI_MODE_NIGHT_YES,
    name = "Dark Theme"
)
@Composable
fun RolePickerScreenPreview() {
    PreviewTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            RolePickerScreen(
                onNavigateToSignUp = {},
                onNavigateToSignIn = {}
            )
        }
    }
}
