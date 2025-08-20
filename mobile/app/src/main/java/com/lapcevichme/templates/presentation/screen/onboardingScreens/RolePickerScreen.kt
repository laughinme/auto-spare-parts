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
import androidx.compose.material3.TextButton // Added
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
import com.lapcevichme.templates.presentation.viewmodel.OnboardingViewModel
import com.lapcevichme.templates.ui.theme.PreviewTheme // Added for consistent preview

@Composable
fun RolePickerScreen(
    viewModel: OnboardingViewModel = hiltViewModel(),
    onNavigateToSignUp: () -> Unit,
    onNavigateToSignIn: () -> Unit
) {
    val selectedRole : String? by viewModel.role.collectAsStateWithLifecycle()
    // val roles = listOf("Buyer", "Seller") // roles list is not directly used in UI rendering, only for logic in VM

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
                .weight(1.5f) // Даем больше места для карточек
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
                        isSelected = selectedRole == "Buyer",
                        onClick = { viewModel.onRoleClicked("Buyer") }
                    )
                }
                Box(modifier = Modifier.weight(1f)) {
                    RoleCard(
                        title = "Поставщик",
                        description = "Размещаю запчасти и обрабатываю заказы",
                        icon = "🏪",
                        isSelected = selectedRole == "Seller",
                        onClick = { viewModel.onRoleClicked("Seller") }
                    )
                }
            }
        }

        // --- Нижняя часть: Кнопка "Продолжить" и ссылка на Sign In ---
        Column( // Changed Box to Column to accommodate TextButton
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(bottom = 24.dp), // Adjusted padding
            horizontalAlignment = Alignment.CenterHorizontally, // Center content in the column
            verticalArrangement = Arrangement.Bottom // Align to bottom
        ) {
            Button(
                modifier = Modifier
                    .height(56.dp)
                    .fillMaxWidth(0.9f),
                onClick = onNavigateToSignUp, // Changed from {}
                enabled = selectedRole != null
            ) {
                Text("Продолжить", fontSize = 18.sp)
            }
            Spacer(modifier = Modifier.height(16.dp)) // Added spacer
            TextButton(onClick = onNavigateToSignIn) { // Added TextButton
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
            .fillMaxSize() // Consider using .aspectRatio(1.5f) or similar for better card shape if needed
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
            Text(text = icon, fontSize = 32.sp) // Emoji icons might render differently on various devices/OS versions
            Column {
                Text(text = title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = description, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}


// --- Preview ---

@Preview(showBackground = true, name = "Light Theme")
@Preview(
    showBackground = true,
    uiMode = Configuration.UI_MODE_NIGHT_YES,
    name = "Dark Theme"
)
@Composable
fun RolePickerScreenPreview() {
    PreviewTheme { // Wrapped with PreviewTheme for consistency
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            RolePickerScreen(
                onNavigateToSignUp = {}, // Added dummy lambda
                onNavigateToSignIn = {}  // Added dummy lambda
            )
        }
    }
}

