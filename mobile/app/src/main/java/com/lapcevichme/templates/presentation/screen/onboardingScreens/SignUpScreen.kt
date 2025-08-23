package com.lapcevichme.templates.presentation.screen.onboardingScreens

import androidx.compose.foundation.layout.Arrangement
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
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.presentation.viewmodel.AuthEvent
import com.lapcevichme.templates.presentation.viewmodel.AuthViewModel
import com.lapcevichme.templates.presentation.viewmodel.OnboardingViewModel
import com.lapcevichme.templates.ui.theme.PreviewTheme
import kotlinx.coroutines.launch

@Composable
fun SignUpScreen(
    authViewModel: AuthViewModel = hiltViewModel(),
    onboardingViewModel: OnboardingViewModel = hiltViewModel(),
    onSignUpSuccess: (selectedRole: String?) -> Unit,
    onNavigateToSignIn: () -> Unit
) {
    val email by authViewModel.email.collectAsStateWithLifecycle()
    val password by authViewModel.password.collectAsStateWithLifecycle()
    val username by authViewModel.username.collectAsStateWithLifecycle()
    val signUpState by authViewModel.signUpState.collectAsStateWithLifecycle() // Используем signUpState
    val emailError by authViewModel.emailError.collectAsStateWithLifecycle()
    val passwordError by authViewModel.passwordError.collectAsStateWithLifecycle()
    val usernameError by authViewModel.usernameError.collectAsStateWithLifecycle()


    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val focusManager = LocalFocusManager.current
    // val context = LocalContext.current // Не используется

// В SignUpScreen.kt
// ...
    LaunchedEffect(signUpState) {
        when (val state = signUpState) {
            is Resource.Success -> {
                val currentRole = onboardingViewModel.role.value
                // ДОБАВЛЯЕМ ЛОГ ЗДЕСЬ
                android.util.Log.d("SignUpScreen_RoleDebug", "Role from OnboardingViewModel in SignUpScreen: $currentRole")
                onSignUpSuccess(currentRole)
            }
            is Resource.Error -> {
                scope.launch {
                    snackbarHostState.showSnackbar(state.message ?: "Ошибка регистрации")
                }
                authViewModel.onEvent(AuthEvent.ResetAuthState)
            }
            else -> Unit
        }
    }
// ...

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Регистрация", style = MaterialTheme.typography.headlineMedium)
            Spacer(modifier = Modifier.height(32.dp))

            OutlinedTextField(
                value = email,
                onValueChange = { authViewModel.onEvent(AuthEvent.EmailChanged(it)) }, // <-- ИЗМЕНЕНИЕ
                label = { Text("Email") },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                singleLine = true,
                isError = emailError != null,
                supportingText = { if (emailError != null) Text(emailError!!) }
            )
            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = username,
                onValueChange = { authViewModel.onEvent(AuthEvent.UsernameChanged(it)) }, // <-- ИЗМЕНЕНИЕ
                label = { Text("Имя пользователя") },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                singleLine = true,
                isError = usernameError != null,
                supportingText = { if (usernameError != null) Text(usernameError!!) }
            )
            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = password,
                onValueChange = { authViewModel.onEvent(AuthEvent.PasswordChanged(it)) }, // <-- ИЗМЕНЕНИЕ
                label = { Text("Пароль") },
                modifier = Modifier.fillMaxWidth(),
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(onDone = {
                    focusManager.clearFocus()
                    authViewModel.onEvent(AuthEvent.SignUpClicked) // <-- ИЗМЕНЕНИЕ
                }),
                singleLine = true,
                isError = passwordError != null,
                supportingText = { if (passwordError != null) Text(passwordError!!) }
            )
            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    focusManager.clearFocus()
                    authViewModel.onEvent(AuthEvent.SignUpClicked) // <-- ИЗМЕНЕНИЕ
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                enabled = signUpState !is Resource.Loading
            ) {
                if (signUpState is Resource.Loading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("Зарегистрироваться")
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            TextButton(onClick = onNavigateToSignIn) {
                Text("Уже есть аккаунт? Войти")
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun SignUpScreenPreview() {
    PreviewTheme {
        SignUpScreen(
            onSignUpSuccess = {},
            onNavigateToSignIn = {}
        )
    }
}
