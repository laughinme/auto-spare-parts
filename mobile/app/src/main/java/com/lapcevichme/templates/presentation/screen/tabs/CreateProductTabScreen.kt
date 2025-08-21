package com.lapcevichme.templates.presentation.screen.tabs

import android.content.res.Configuration
import android.net.Uri // ADDED
import androidx.activity.compose.rememberLauncherForActivityResult // ADDED
import androidx.activity.result.PickVisualMediaRequest // ADDED
import androidx.activity.result.contract.ActivityResultContracts // ADDED
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
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
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
    val selectedImageUri by viewModel.selectedImageUri.collectAsStateWithLifecycle() // ADDED

    val snackbarHostState = remember { SnackbarHostState() }

    // ADDED: Launcher for picking an image
    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri: Uri? ->
            viewModel.onEvent(SparePartCreateEvent.OnImageSelected(uri))
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
                    selectedImageUri = selectedImageUri,
                    onImageClick = {
                        imagePickerLauncher.launch(
                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                        )
                    },
                    onRemoveImageClick = {
                        viewModel.onEvent(SparePartCreateEvent.OnImageSelected(null))
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
    selectedImageUri: Uri?,
    onImageClick: () -> Unit,
    onRemoveImageClick: () -> Unit
) {
    SectionCard(title = "3. Фотографии") {
        if (selectedImageUri == null) {
            // The 'stroke' variable with PathEffect for dashed border is removed
            // as Modifier.border() doesn't directly use it for a dashed effect.
            // A custom Canvas would be needed for a true dashed border.
            Box(
                Modifier
                    .fillMaxWidth()
                    .height(150.dp)
                    .border( // CORRECTED: Solid border
                        width = 2.dp, // Defined width
                        brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.outline), // Using brush
                        shape = RoundedCornerShape(12.dp)
                    )
                    .clickable { onImageClick() }, // Make the whole box clickable
                contentAlignment = Alignment.Center
            ) {
                // The inner Box with a redundant border has been removed.
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Upload Icon",
                        modifier = Modifier.size(48.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text("Нажмите для загрузки", color = MaterialTheme.colorScheme.primary)
                    Text("PNG, JPG до 10MB", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        } else {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp) // Increased height for selected image
                    .clip(RoundedCornerShape(12.dp)) // Clip image to rounded corners
            ) {
                AsyncImage(
                    model = selectedImageUri,
                    contentDescription = "Выбранное изображение",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop // Crop to fill bounds
                )
                Row( // Buttons to change or remove image
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    IconButton(onClick = onImageClick) { // Edit button
                        Icon(Icons.Filled.Edit, contentDescription = "Изменить фото", tint = MaterialTheme.colorScheme.surface)
                    }
                    IconButton(onClick = onRemoveImageClick) { // Delete button
                        Icon(Icons.Filled.Delete, contentDescription = "Удалить фото", tint = MaterialTheme.colorScheme.surface)
                    }
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
