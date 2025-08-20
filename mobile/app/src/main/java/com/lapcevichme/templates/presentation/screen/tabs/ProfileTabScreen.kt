package com.lapcevichme.templates.presentation.screen.tabs

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.example.hackathon.domain.util.uriToFile
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.presentation.viewmodel.ProfileEvent
import com.lapcevichme.templates.presentation.viewmodel.ProfileViewModel
import kotlinx.coroutines.launch
import com.lapcevichme.templates.R

// --- STATEFUL COMPONENT (HOLDER) ---

@Composable
fun ProfileTabScreen(
    viewModel: ProfileViewModel = hiltViewModel(),
    onLogoutSuccess: () -> Unit
) {
    // Собираем все состояния из ViewModel
    val profileState by viewModel.profileState.collectAsStateWithLifecycle()
    val logoutState by viewModel.logoutState.collectAsStateWithLifecycle()
    val username by viewModel.username.collectAsStateWithLifecycle()
    val bio by viewModel.bio.collectAsStateWithLifecycle()
    val language by viewModel.language.collectAsStateWithLifecycle()
    val avatarUrl by viewModel.avatarUrl.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    LaunchedEffect(key1 = true) {
        viewModel.snackbarEvent.collect { message ->
            scope.launch {
                snackbarHostState.showSnackbar(message)
            }
        }
    }

    // Launcher для выбора изображения
    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            uriToFile(context, it)?.let { file ->
                viewModel.onEvent(ProfileEvent.OnPictureSelected(file))
            }
        }
    }

    // Отслеживаем состояние выхода для навигации
    LaunchedEffect(key1 = logoutState) {
        if (logoutState is Resource.Success) {
            onLogoutSuccess()
        }
    }

    // Показываем Snackbar при ошибках
    LaunchedEffect(key1 = profileState, key2 = logoutState) {
        val profileError = (profileState as? Resource.Error)?.message
        val logoutError = (logoutState as? Resource.Error)?.message
        val errorMessage = profileError ?: logoutError
        if (errorMessage != null) {
            scope.launch { snackbarHostState.showSnackbar(errorMessage) }
        }
    }

    ProfileScreenContent(
        profileResource = profileState,
        snackbarHostState = snackbarHostState,
        username = username,
        bio = bio,
        language = language,
        avatarUrl = avatarUrl,
        onEvent = viewModel::onEvent,
        onAvatarClick = { imagePickerLauncher.launch("image/*") }
    )
}

// --- STATELESS COMPONENT (PURE UI) ---

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreenContent(
    profileResource: Resource<out Any>,
    snackbarHostState: SnackbarHostState,
    username: String,
    bio: String,
    language: String,
    avatarUrl: String?,
    onEvent: (ProfileEvent) -> Unit,
    onAvatarClick: () -> Unit
) {
    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        topBar = { TopAppBar(title = { Text("Профиль") }) }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            when (profileResource) {
                is Resource.Loading -> CircularProgressIndicator()
                is Resource.Error -> {
                    Button(onClick = { onEvent(ProfileEvent.OnRetry) }) {
                        Text("Попробовать снова")
                    }
                }
                is Resource.Success -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(rememberScrollState())
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // --- Аватар ---
                        Box(
                            modifier = Modifier
                                .size(120.dp)
                                .clickable { onAvatarClick() },
                            contentAlignment = Alignment.BottomEnd
                        ) {
                            AsyncImage(
                                model = avatarUrl,
                                contentDescription = "Аватар",
                                modifier = Modifier
                                    .fillMaxSize()
                                    .clip(CircleShape)
                                    .border(2.dp, MaterialTheme.colorScheme.primary, CircleShape),
                                contentScale = ContentScale.Crop,
                                placeholder = painterResource(id = R.drawable.ic_launcher_background),
                                error = painterResource(id = R.drawable.ic_launcher_background)
                            )
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = "Редактировать",
                                modifier = Modifier
                                    .size(32.dp)
                                    .background(MaterialTheme.colorScheme.surface, CircleShape)
                                    .padding(4.dp)
                            )
                        }

                        // --- Основные поля ---
                        OutlinedTextField(value = username, onValueChange = { onEvent(ProfileEvent.OnUsernameChange(it)) }, label = { Text("Имя пользователя") }, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = bio, onValueChange = { onEvent(ProfileEvent.OnBioChange(it)) }, label = { Text("О себе") }, modifier = Modifier.fillMaxWidth().height(120.dp))
                        OutlinedTextField(value = language, onValueChange = { onEvent(ProfileEvent.OnLanguageChange(it)) }, label = { Text("Язык (напр. ru)") }, modifier = Modifier.fillMaxWidth())


                        // --- Кнопки действий ---
                        Button(onClick = { onEvent(ProfileEvent.OnSaveClick) }, modifier = Modifier.fillMaxWidth()) {
                            Text("Сохранить изменения")
                        }
                        OutlinedButton(
                            onClick = { onEvent(ProfileEvent.OnLogoutClick) },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error),
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.error)
                        ) {
                            Text("Выйти из аккаунта")
                        }
                    }
                }
            }
        }
    }
}
