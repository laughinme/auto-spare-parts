package com.lapcevichme.templates.presentation.screen

import android.app.Activity
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
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
import com.stripe.android.connect.AccountOnboardingListener


@Composable
fun ConnectOnboardingScreen(
    viewModel: ConnectOnboardingViewModel = hiltViewModel(),
    onOnboardingComplete: () -> Unit
) {
    val context = LocalContext.current
    // Безопасно получаем Activity
    val activity = context as? Activity

    var isLoading by remember { mutableStateOf(false) }
    var statusMessage by remember { mutableStateOf<String?>(null) }

    // --- UI Разметка ---
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

        // Проверяем, доступна ли Activity. Если нет, показываем ошибку.
        if (activity == null) {
            Text(
                text = "Ошибка: Экран не может быть отображен вне Activity.",
                color = Color.Red,
                textAlign = TextAlign.Center
            )
        } else {
            // Создаем контроллер только если Activity доступна
            val accountOnboardingController = remember {
                viewModel.embeddedComponentManager.createAccountOnboardingController(activity as FragmentActivity)
            }

            // Устанавливаем listener один раз
            LaunchedEffect(accountOnboardingController) {
                accountOnboardingController.listener = object : AccountOnboardingListener {
                    // Убираем `override`, как и просил lint
                    fun onFinish() {
                        isLoading = false
                        Toast.makeText(context, "Регистрация завершена!", Toast.LENGTH_LONG).show()
                        onOnboardingComplete()
                    }

                    fun onCancel() {
                        isLoading = false
                        statusMessage = "Процесс регистрации отменен."
                    }

                    override fun onLoadError(error: Throwable) {
                        isLoading = false
                        statusMessage = "Ошибка: ${error.message}"
                    }
                }
            }

            Button(
                onClick = {
                    isLoading = true
                    statusMessage = null
                    accountOnboardingController.show()
                },
                enabled = !isLoading,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(text = "Начать регистрацию в Stripe", fontSize = 16.sp)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        if (isLoading) {
            CircularProgressIndicator()
        }

        statusMessage?.let {
            Text(
                text = it,
                color = Color.Red,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 8.dp)
            )
        }
    }
}
