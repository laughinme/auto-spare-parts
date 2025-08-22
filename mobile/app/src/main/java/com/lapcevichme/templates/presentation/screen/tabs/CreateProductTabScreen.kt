package com.lapcevichme.templates.presentation.screen.tabs

import android.content.res.Configuration
import android.net.Uri // ADDED
import androidx.activity.compose.rememberLauncherForActivityResult // ADDED
import androidx.activity.result.PickVisualMediaRequest // ADDED
import androidx.activity.result.contract.ActivityResultContracts // ADDED
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable // ADDED
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Edit // ADDED
import androidx.compose.material.icons.filled.Delete // ADDED
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton // ADDED
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale // ADDED
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage // ADDED
import com.lapcevichme.templates.domain.model.enums.ProductCondition
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.presentation.viewmodel.SparePartCreateEvent
import com.lapcevichme.templates.presentation.viewmodel.SparePartCreateViewModel
import com.lapcevichme.templates.presentation.viewmodel.UiEvent
import com.lapcevichme.templates.ui.theme.PreviewTheme
import kotlinx.coroutines.flow.collectLatest


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SparePartCreateScreen(
    viewModel: SparePartCreateViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit
) {
    val brand by viewModel.brand.collectAsStateWithLifecycle()
    val partNumber by viewModel.partNumber.collectAsStateWithLifecycle()
    val conditionOptions = listOf("новый", "б/у")
    val selectedCondition by viewModel.condition.collectAsStateWithLifecycle()

    val price by viewModel.price.collectAsStateWithLifecycle()
    val description by viewModel.description.collectAsStateWithLifecycle()
    val selectedImageUris by viewModel.selectedImageUris.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    // ADDED: Launcher for picking an image
    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickMultipleVisualMedia(), // Для выбора нескольких изображений
        onResult = { uris: List<Uri> -> // Результат - список Uri
            uris.forEach { uri ->
                viewModel.onEvent(SparePartCreateEvent.OnImageSelected(uri))
            }
        }
    )

    LaunchedEffect(key1 = true) {
        viewModel.uiEvent.collectLatest { event ->
            when (event) {
                is UiEvent.ShowSnackbar -> {
                    snackbarHostState.showSnackbar(
                        message = event.message
                    )
                }
                else -> {}
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Добавление детали") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { OrganizationSection(viewModel = viewModel) }
            item {
                BasicInfoSection(
                    brand = brand,
                    onBrandChange = { viewModel.onEvent(SparePartCreateEvent.OnBrandChanged(it)) },
                    partNumber = partNumber,
                    onPartNumberChange = { viewModel.onEvent(SparePartCreateEvent.OnPartNumberChanged(it)) },
                    selectedCondition = when (selectedCondition) {
                        ProductCondition.NEW -> "новый"
                        ProductCondition.USED -> "б/у"
                        else -> null
                    },
                    onConditionSelected = { viewModel.onEvent(SparePartCreateEvent.OnConditionChanged(it)) },
                    conditionOptions = conditionOptions
                )
            }
            // MODIFIED: Pass selectedImageUri and launcher to PhotosSection
            item {
                PhotosSection(
                    // ЗАМЕНИТЕ selectedImageUri = selectedImageUri,
                    // НА ЭТО:
                    selectedImageUris = selectedImageUris,

                    // ЗАМЕНИТЕ onImageClick = { ... }
                    // НА ЭТО (переименуем для ясности и обновим вызов):
                    onAddImageClick = {
                        // Для PickMultipleVisualMedia достаточно просто запустить
                        // Можно указать тип медиа, если нужно (по умолчанию фото и видео)
                        imagePickerLauncher.launch(
                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                        )
                    },

                    // ЗАМЕНИТЕ onRemoveImageClick = { viewModel.onEvent(SparePartCreateEvent.OnImageSelected(null)) }
                    // НА ЭТО (теперь передаем конкретный Uri для удаления):
                    onRemoveImageClick = { uriToRemove ->
                        viewModel.onEvent(SparePartCreateEvent.OnImageRemoved(uriToRemove))
                    }
                )
            }
            item {
                PriceAndDescriptionSection(
                    price = price,
                    onPriceChange = { viewModel.onEvent(SparePartCreateEvent.OnPriceChanged(it)) },
                    description = description,
                    onDescriptionChange = { viewModel.onEvent(SparePartCreateEvent.OnDescriptionChanged(it)) }
                )
            }
            item {
                ActionButtons(
                    onPublishClick = { viewModel.onEvent(SparePartCreateEvent.OnCreateClick) },
                    onCancelClick = onNavigateBack
                )
            }
        }
    }
}

@Composable
fun OrganizationSection(viewModel: SparePartCreateViewModel) {
    SectionCard(title = "1. Организация") {
        OrganizationSelector(viewModel = viewModel)
    }
}

@Composable
fun BasicInfoSection(
    brand: String?,
    onBrandChange: (String) -> Unit,
    partNumber: String?,
    onPartNumberChange: (String) -> Unit,
    selectedCondition: String?,
    onConditionSelected: (String) -> Unit,
    conditionOptions: List<String>
) {
    SectionCard(title = "2. Основная информация") {
        OutlinedTextField(
            value = brand ?: "",
            onValueChange = onBrandChange,
            label = { Text("Бренд") },
            placeholder = { Text("Например, Toyota") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = partNumber ?: "",
            onValueChange = onPartNumberChange,
            label = { Text("Номер детали") },
            placeholder = { Text("Например, 12345-67890") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text("Состояние", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Row(Modifier.fillMaxWidth()) {
            conditionOptions.forEach { option ->
                Row(
                    Modifier
                        .selectable(
                            selected = (option == selectedCondition),
                            onClick = { onConditionSelected(option) }
                        )
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(
                        selected = (option == selectedCondition),
                        onClick = { onConditionSelected(option) }
                    )
                    Text(text = option, modifier = Modifier.padding(start = 4.dp))
                }
            }
        }
    }
}

// MODIFIED: PhotosSection to handle image selection and display
@Composable
fun PhotosSection(
    selectedImageUris: List<Uri>,
    onAddImageClick: () -> Unit,
    onRemoveImageClick: (Uri) -> Unit
) {
    SectionCard(title = "3. Фотографии") {
        // Отображение выбранных изображений
        if (selectedImageUris.isNotEmpty()) {
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp), // Отступ перед кнопкой добавления
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(selectedImageUris) { uri ->
                    Box(
                        modifier = Modifier
                            .size(100.dp) // Размер превью
                            .clip(RoundedCornerShape(12.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant) // Фон на случай долгой загрузки
                    ) {
                        AsyncImage(
                            model = uri,
                            contentDescription = "Выбранное изображение",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop // Обрезать для заполнения
                        )
                        IconButton(
                            onClick = { onRemoveImageClick(uri) },
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(4.dp)
                                .background(
                                    color = MaterialTheme.colorScheme.scrim.copy(alpha = 0.7f),
                                    shape = CircleShape
                                )
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Close,
                                contentDescription = "Удалить фото",
                                tint = MaterialTheme.colorScheme.onPrimaryContainer // Или другой контрастный цвет
                            )
                        }
                    }
                }
            }
        }

        // Область для добавления изображений
        // Отображается всегда, но может менять вид/текст
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(if (selectedImageUris.isEmpty()) 150.dp else 80.dp) // Выше, если пусто
                .border(
                    width = 2.dp,
                    brush = SolidColor(MaterialTheme.colorScheme.outline), // Используем SolidColor для кисти
                    shape = RoundedCornerShape(12.dp)
                )
                .clickable { onAddImageClick() }
                .padding(16.dp), // Внутренний отступ для контента
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Добавить фото",
                    modifier = Modifier.size(if (selectedImageUris.isEmpty()) 40.dp else 28.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = if (selectedImageUris.isEmpty()) "Нажмите для загрузки фото" else "Добавить еще фото",
                    color = MaterialTheme.colorScheme.primary,
                    style = if (selectedImageUris.isEmpty()) MaterialTheme.typography.bodyLarge else MaterialTheme.typography.bodyMedium
                )
                if (selectedImageUris.isEmpty()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "PNG, JPG до 10MB",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}


@Composable
fun PriceAndDescriptionSection(
    price: String?,
    onPriceChange: (String) -> Unit,
    description: String?,
    onDescriptionChange: (String) -> Unit
) {
    SectionCard(title = "4. Цена и описание") {
        OutlinedTextField(
            value = price ?: "",
            onValueChange = onPriceChange,
            label = { Text("Цена") },
            leadingIcon = { Text("₽") },
            trailingIcon = { Text("RUB") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = description ?: "",
            onValueChange = onDescriptionChange,
            label = { Text("Описание") },
            placeholder = { Text("Расскажите подробнее о детали...") },
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp)
        )
    }
}

@Composable
fun ActionButtons(onPublishClick: () -> Unit, onCancelClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End)
    ) {
        OutlinedButton(onClick = onCancelClick) {
            Text("Отмена")
        }
        Button(onClick = onPublishClick) {
            Text("Опубликовать")
        }
    }
}


@Composable
fun SectionCard(title: String, content: @Composable ColumnScope.() -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold, fontSize = 18.sp)
            Spacer(modifier = Modifier.height(16.dp))
            content()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrganizationSelector(
    viewModel: SparePartCreateViewModel
) {
    val organizationsResource by viewModel.organizations.collectAsState()
    val selectedOrgId by viewModel.selectedOrganizationId.collectAsState()

    var expanded by remember { mutableStateOf(false) }

    val selectedOrganizationName = remember(selectedOrgId, organizationsResource) {
        (organizationsResource as? Resource.Success)?.data?.find { it.id == selectedOrgId }?.name ?: ""
    }

    Column {
        when (val resource = organizationsResource) {
            is Resource.Loading -> {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
                    CircularProgressIndicator()
                }
            }
            is Resource.Success -> {
                val organizationsList = resource.data
                if (organizationsList.isNullOrEmpty()) {
                    Text("Список организаций пуст. Пожалуйста, сначала создайте организацию.")
                } else {
                    ExposedDropdownMenuBox(
                        expanded = expanded,
                        onExpandedChange = { expanded = !expanded },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        OutlinedTextField(
                            value = selectedOrganizationName,
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Выберите организацию") },
                            trailingIcon = {
                                ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded)
                            },
                            modifier = Modifier
                                .menuAnchor()
                                .fillMaxWidth()
                        )
                        ExposedDropdownMenu(
                            expanded = expanded,
                            onDismissRequest = { expanded = false },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            organizationsList.forEach { organization ->
                                DropdownMenuItem(
                                    text = { Text(organization.name) },
                                    onClick = {
                                        viewModel.onEvent(
                                            SparePartCreateEvent.OnOrganizationSelected(
                                                organization.id
                                            )
                                        )
                                        expanded = false
                                    },
                                    contentPadding = ExposedDropdownMenuDefaults.ItemContentPadding
                                )
                            }
                        }
                    }
                }
            }
            is Resource.Error -> {
                Text(
                    "Ошибка загрузки организаций: ${resource.message}",
                    color = MaterialTheme.colorScheme.error
                )
                Button(onClick = { /* viewModel.loadOrganizations() */ }) {
                    Text("Попробовать снова")
                }
            }
            null -> { // Should ideally be handled by Resource.Loading or initial state
                Text("Загрузка списка организаций...")
            }
        }
    }
}


@Preview(showBackground = true, name = "Light Theme SparePartCreateScreen")
@Preview(
    showBackground = true,
    uiMode = Configuration.UI_MODE_NIGHT_YES,
    name = "Dark Theme SparePartCreateScreen"
)
@Composable
fun SparePartCreateScreenPreview() {
    PreviewTheme {
        // ViewModel instance for preview might require a fake/mock implementation
        // For simplicity, passing a default hiltViewModel might work in some preview contexts
        // or you'd need to mock the ViewModel and its state for reliable previews.
        SparePartCreateScreen(onNavigateBack = {})
    }
}
