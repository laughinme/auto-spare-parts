package com.lapcevichme.templates.presentation.screen

import android.widget.Toast
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.fragment.app.FragmentActivity
import androidx.hilt.navigation.compose.hiltViewModel
import com.lapcevichme.templates.presentation.viewmodel.ConnectOnboardingViewModel
import com.lapcevichme.templates.presentation.viewmodel.OnboardingState


@Composable
fun ConnectOnboardingScreen(
    viewModel: ConnectOnboardingViewModel = hiltViewModel(),
    onOnboardingComplete: () -> Unit
) {
    val context = LocalContext.current
    val activity = context as? FragmentActivity

    // Подписываемся на StateFlow. Compose будет автоматически обновлять UI при изменении состояния.
    val onboardingState by viewModel.onboardingState.collectAsState()

    // Этот LaunchedEffect реагирует на изменение состояния.
    LaunchedEffect(onboardingState) {
        when (val state = onboardingState) {
            is OnboardingState.Success -> {
                Toast.makeText(context, "Регистрация завершена!", Toast.LENGTH_LONG).show()
                viewModel.resetState() // Сбрасываем состояние
                onOnboardingComplete() // Выполняем навигацию
            }
            is OnboardingState.Error -> {
                Toast.makeText(context, "Ошибка: ${state.message}", Toast.LENGTH_LONG).show()
                viewModel.resetState() // Сбрасываем состояние
            }
            else -> {
                // Ничего не делаем для Idle и Loading
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Регистрация продавца",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        if (activity == null) {
            Text(
                text = "Ошибка: Экран не может быть отображен вне FragmentActivity.",
                color = Color.Red,
                textAlign = TextAlign.Center
            )
        } else {
            val accountOnboardingController = remember {
                viewModel.getAccountOnboardingController(activity)
            }

            Button(
                onClick = {
                    viewModel.startLoading() // Устанавливаем состояние Loading
                    accountOnboardingController.show()
                },
                enabled = onboardingState != OnboardingState.Loading,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(text = "Начать регистрацию в Stripe", fontSize = 16.sp)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        if (onboardingState == OnboardingState.Loading) {
            CircularProgressIndicator()
        }
    }
}
