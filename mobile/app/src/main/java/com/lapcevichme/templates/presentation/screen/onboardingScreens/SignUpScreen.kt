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
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.presentation.viewmodel.AuthViewModel
import com.lapcevichme.templates.ui.theme.PreviewTheme
import kotlinx.coroutines.launch

@Composable
fun SignUpScreen(
    viewModel: AuthViewModel = hiltViewModel(),
    onSignUpSuccess: () -> Unit,
    onNavigateToSignIn: () -> Unit
) {
    val email by viewModel.email.collectAsStateWithLifecycle()
    val password by viewModel.password.collectAsStateWithLifecycle()
    val authState by viewModel.authState.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    LaunchedEffect(key1 = authState) {
        when (val state = authState) {
            is Resource.Success -> {
                onSignUpSuccess()
            }
            is Resource.Error -> {
                scope.launch {
                    snackbarHostState.showSnackbar(
                        message = state.message ?: "Произошла неизвестная ошибка",
                        withDismissAction = true
                    )
                }
            }
            else -> Unit
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
                Text("Sign Up", fontSize = 28.sp)
                Spacer(Modifier.height(40.dp))
                OutlinedTextField(
                    value = email,
                    onValueChange = { viewModel.onEmailChanged(newEmail = it) },
                    label = { Text("Email") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    enabled = authState !is Resource.Loading
                )
                Spacer(Modifier.height(16.dp))
                OutlinedTextField(
                    value = password,
                    onValueChange = { viewModel.onPasswordChanged(newPassword = it) },
                    label = { Text("Password") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    enabled = authState !is Resource.Loading
                )
                Spacer(Modifier.height(32.dp))
                Button(
                    onClick = { viewModel.onSignUpClicked() },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = authState !is Resource.Loading
                ) {
                    Text("Sign Up")
                }
                TextButton(onClick = onNavigateToSignIn, enabled = authState !is Resource.Loading) {
                    Text("Already have an account? Sign In")
                }
            }

            if (authState is Resource.Loading) {
                CircularProgressIndicator()
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
fun SignUpPreview() {
    PreviewTheme {
        SignUpScreen(
            onSignUpSuccess = {},
            onNavigateToSignIn = {}
        )
    }
}