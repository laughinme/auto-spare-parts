package com.lapcevichme.templates.presentation.screen.onboardingScreens

import android.content.res.Configuration
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.presentation.viewmodel.AuthEvent // <-- ИМПОРТ AuthEvent
import com.lapcevichme.templates.presentation.viewmodel.AuthViewModel
import com.lapcevichme.templates.ui.theme.PreviewTheme // Убедись, что это правильный импорт темы
import kotlinx.coroutines.launch

@Composable
fun SignInScreen(
    viewModel: AuthViewModel = hiltViewModel(),
    onSignInSuccess: () -> Unit,
    onNavigateToSignUp: () -> Unit
) {
    val email by viewModel.email.collectAsStateWithLifecycle()
    val password by viewModel.password.collectAsStateWithLifecycle()
    val signInState by viewModel.signInState.collectAsStateWithLifecycle() // Используем signInState
    val emailError by viewModel.emailError.collectAsStateWithLifecycle()
    val passwordError by viewModel.passwordError.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val focusManager = LocalFocusManager.current

    LaunchedEffect(key1 = signInState) {
        when (val state = signInState) {
            is Resource.Success -> {
                onSignInSuccess()
                // viewModel.onEvent(AuthEvent.ResetAuthState) // Опционально: сбросить состояние после успеха
            }
            is Resource.Error -> {
                scope.launch {
                    snackbarHostState.showSnackbar(
                        message = state.message ?: "Произошла неизвестная ошибка",
                        withDismissAction = true
                    )
                }
                viewModel.onEvent(AuthEvent.ResetAuthState) // Сбрасываем состояние, чтобы Snackbar не показывался снова
            }
            else -> Unit // Resource.Loading или null
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 32.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Вход", fontSize = 28.sp) // Изменено на "Вход" для единообразия
                Spacer(Modifier.height(40.dp))
                OutlinedTextField(
                    value = email,
                    onValueChange = { viewModel.onEvent(AuthEvent.EmailChanged(it)) }, // <-- ИЗМЕНЕНИЕ
                    label = { Text("Email") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    isError = emailError != null,
                    supportingText = { if (emailError != null) Text(emailError!!) },
                    enabled = signInState !is Resource.Loading,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                )
                Spacer(Modifier.height(16.dp))
                OutlinedTextField(
                    value = password,
                    onValueChange = { viewModel.onEvent(AuthEvent.PasswordChanged(it)) }, // <-- ИЗМЕНЕНИЕ
                    label = { Text("Пароль") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    isError = passwordError != null,
                    supportingText = { if (passwordError != null) Text(passwordError!!) },
                    enabled = signInState !is Resource.Loading,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
                    keyboardActions = KeyboardActions(onDone = {
                        focusManager.clearFocus()
                        viewModel.onEvent(AuthEvent.SignInClicked) // <-- ИЗМЕНЕНИЕ
                    })
                )
                Spacer(Modifier.height(32.dp))
                Button(
                    onClick = {
                        focusManager.clearFocus()
                        viewModel.onEvent(AuthEvent.SignInClicked) // <-- ИЗМЕНЕНИЕ
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = signInState !is Resource.Loading && emailError == null && passwordError == null
                ) {
                    if (signInState is Resource.Loading) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimary)
                    } else {
                        Text("Войти")
                    }
                }
                TextButton(
                    onClick = onNavigateToSignUp,
                    enabled = signInState !is Resource.Loading
                ) {
                    Text("Нет аккаунта? Зарегистрироваться")
                }
            }

            // Убрали отдельный CircularProgressIndicator, так как он теперь внутри кнопки
            // if (signInState is Resource.Loading) {
            //     CircularProgressIndicator()
            // }
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
fun SignInPreview() {
    PreviewTheme {
        SignInScreen(
            onSignInSuccess = {},
            onNavigateToSignUp = {}
        )
    }
}
