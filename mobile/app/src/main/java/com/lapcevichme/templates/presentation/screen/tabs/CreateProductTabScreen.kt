package com.lapcevichme.templates.presentation.screen.tabs

import android.content.res.Configuration
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.lapcevichme.templates.domain.model.MakeModel
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.enums.ProductCondition
import com.lapcevichme.templates.domain.model.enums.ProductOriginality
import com.lapcevichme.templates.domain.model.enums.StockType
import com.lapcevichme.templates.presentation.viewmodel.SparePartCreateEvent
import com.lapcevichme.templates.presentation.viewmodel.SparePartCreateViewModel
import com.lapcevichme.templates.presentation.viewmodel.UiEvent
import com.lapcevichme.templates.ui.theme.PreviewTheme
import kotlinx.coroutines.flow.collectLatest

// ... (остальной код SparePartCreateScreen остается без изменений) ...
// ... (BasicInfoSection, MakeSelector, PriceAndDescriptionSection и другие) ...

// ИЗМЕНЕНИЯ ТОЛЬКО В AdditionalInfoSection

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdditionalInfoSection(viewModel: SparePartCreateViewModel) {
    val stockType by viewModel.stockType.collectAsStateWithLifecycle()
    val originality by viewModel.originality.collectAsStateWithLifecycle()
    val allowCart by viewModel.allowCart.collectAsStateWithLifecycle()

    var stockTypeExpanded by remember { mutableStateOf(false) }
    var originalityExpanded by remember { mutableStateOf(false) }

    SectionCard(title = "4. Дополнительно") {
        // Выбор наличия
        ExposedDropdownMenuBox(
            expanded = stockTypeExpanded,
            onExpandedChange = { stockTypeExpanded = !it }
        ) {
            OutlinedTextField(
                // ИЗМЕНЕНО: Текст для новых значений
                value = when (stockType) {
                    StockType.STOCK -> "На складе"
                    StockType.UNIQUE -> "Под заказ"
                },
                onValueChange = {},
                readOnly = true,
                label = { Text("Наличие") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = stockTypeExpanded) },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth()
            )
            ExposedDropdownMenu(
                expanded = stockTypeExpanded,
                onDismissRequest = { stockTypeExpanded = false }
            ) {
                DropdownMenuItem(
                    // ИЗМЕНЕНО: Текст и передаваемое значение
                    text = { Text("На складе") },
                    onClick = {
                        viewModel.onEvent(SparePartCreateEvent.OnStockTypeChanged(StockType.STOCK))
                        stockTypeExpanded = false
                    }
                )
                DropdownMenuItem(
                    // ИЗМЕНЕНО: Текст и передаваемое значение
                    text = { Text("Под заказ") },
                    onClick = {
                        viewModel.onEvent(SparePartCreateEvent.OnStockTypeChanged(StockType.UNIQUE))
                        stockTypeExpanded = false
                    }
                )
            }
        }
        Spacer(Modifier.height(16.dp))
        // Выбор оригинальности
        ExposedDropdownMenuBox(
            expanded = originalityExpanded,
            onExpandedChange = { originalityExpanded = !it }
        ) {
            OutlinedTextField(
                // ИЗМЕНЕНО: Текст для новых значений
                value = when (originality) {
                    ProductOriginality.OEM -> "Оригинал (OEM)"
                    ProductOriginality.AFTERMARKET -> "Аналог (Aftermarket)"
                },
                onValueChange = {},
                readOnly = true,
                label = { Text("Оригинальность") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = originalityExpanded) },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth()
            )
            ExposedDropdownMenu(
                expanded = originalityExpanded,
                onDismissRequest = { originalityExpanded = false }
            ) {
                DropdownMenuItem(
                    // ИЗМЕНЕНО: Текст и передаваемое значение
                    text = { Text("Оригинал (OEM)") },
                    onClick = {
                        viewModel.onEvent(SparePartCreateEvent.OnOriginalityChanged(ProductOriginality.OEM))
                        originalityExpanded = false
                    }
                )
                DropdownMenuItem(
                    // ИЗМЕНЕНО: Текст и передаваемое значение
                    text = { Text("Аналог (Aftermarket)") },
                    onClick = {
                        viewModel.onEvent(SparePartCreateEvent.OnOriginalityChanged(ProductOriginality.AFTERMARKET))
                        originalityExpanded = false
                    }
                )
            }
        }
        Spacer(Modifier.height(16.dp))
        // Переключатель "Разрешить добавление в корзину"
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .clickable { viewModel.onEvent(SparePartCreateEvent.OnAllowCartChanged(!allowCart)) }
                .padding(vertical = 8.dp)
        ) {
            Text("Разрешить добавление в корзину", modifier = Modifier.weight(1f))
            Switch(
                checked = allowCart,
                onCheckedChange = { viewModel.onEvent(SparePartCreateEvent.OnAllowCartChanged(it)) }
            )
        }
    }
}


// ... (Весь остальной код SparePartCreateScreen остается таким же, как в предыдущем ответе)
// Я приложу полный код файла ниже для удобства копирования.

// ПОЛНЫЙ КОД SparePartCreateScreen.kt
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SparePartCreateScreen(
    viewModel: SparePartCreateViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit
) {
    val title by viewModel.title.collectAsStateWithLifecycle()
    val makeSearchQuery by viewModel.makeSearchQuery.collectAsStateWithLifecycle()
    val makes by viewModel.vehiclesMakes.collectAsStateWithLifecycle()
    val pickedMake by viewModel.pickedVehiclesMake.collectAsStateWithLifecycle()
    val partNumber by viewModel.partNumber.collectAsStateWithLifecycle()
    val condition by viewModel.condition.collectAsStateWithLifecycle()
    val price by viewModel.price.collectAsStateWithLifecycle()
    val quantity by viewModel.quantity.collectAsStateWithLifecycle()
    val description by viewModel.description.collectAsStateWithLifecycle()
    val selectedImageUris by viewModel.selectedImageUris.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val creationState by viewModel.creationState.collectAsState()

    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickMultipleVisualMedia(),
        onResult = { uris: List<Uri> ->
            uris.forEach { uri ->
                viewModel.onEvent(SparePartCreateEvent.OnImageSelected(uri))
            }
        }
    )

    LaunchedEffect(key1 = true) {
        viewModel.uiEvent.collectLatest { event ->
            when (event) {
                is UiEvent.ShowSnackbar -> snackbarHostState.showSnackbar(message = event.message)
                is UiEvent.NavigateToHome -> onNavigateBack() // Или навигация на главный экран
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
        Box(modifier = Modifier.fillMaxSize()) {
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
                        title = title,
                        onTitleChange = { viewModel.onEvent(SparePartCreateEvent.OnTitleChanged(it)) },
                        makeSearchQuery = makeSearchQuery,
                        onMakeSearchQueryChange = { viewModel.onEvent(SparePartCreateEvent.OnMakeSearchQueryChanged(it)) },
                        makes = makes,
                        onMakeSelected = { viewModel.onEvent(SparePartCreateEvent.OnMakeSelected(it)) },
                        pickedMake = pickedMake,
                        partNumber = partNumber,
                        onPartNumberChange = { viewModel.onEvent(SparePartCreateEvent.OnPartNumberChanged(it)) },
                        selectedCondition = condition,
                        onConditionSelected = { viewModel.onEvent(SparePartCreateEvent.OnConditionChanged(it)) }
                    )
                }
                item {
                    PhotosSection(
                        selectedImageUris = selectedImageUris,
                        onAddImageClick = {
                            imagePickerLauncher.launch(
                                PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                            )
                        },
                        onRemoveImageClick = { uriToRemove ->
                            viewModel.onEvent(SparePartCreateEvent.OnImageRemoved(uriToRemove))
                        }
                    )
                }
                item {
                    PriceAndDescriptionSection(
                        price = price,
                        onPriceChange = { viewModel.onEvent(SparePartCreateEvent.OnPriceChanged(it)) },
                        quantity = quantity,
                        onQuantityChange = { viewModel.onEvent(SparePartCreateEvent.OnQuantityChanged(it)) },
                        description = description,
                        onDescriptionChange = { viewModel.onEvent(SparePartCreateEvent.OnDescriptionChanged(it)) }
                    )
                }
                item {
                    AdditionalInfoSection(viewModel = viewModel)
                }
                item {
                    ActionButtons(
                        isPublishing = creationState is Resource.Loading,
                        onPublishClick = { viewModel.onEvent(SparePartCreateEvent.OnCreateClick) },
                        onCancelClick = onNavigateBack
                    )
                }
            }
            if (creationState is Resource.Loading) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center)
                )
            }
        }
    }
}


@Composable
fun BasicInfoSection(
    title: String,
    onTitleChange: (String) -> Unit,
    makeSearchQuery: String,
    onMakeSearchQueryChange: (String) -> Unit,
    makes: List<MakeModel>?,
    onMakeSelected: (MakeModel) -> Unit,
    pickedMake: MakeModel?,
    partNumber: String,
    onPartNumberChange: (String) -> Unit,
    selectedCondition: ProductCondition,
    onConditionSelected: (ProductCondition) -> Unit
) {
    SectionCard(title = "1. Основная информация") {
        OutlinedTextField(
            value = title,
            onValueChange = onTitleChange,
            label = { Text("Название объявления") },
            placeholder = { Text("Например, Фара левая") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(16.dp))
        MakeSelector(
            query = makeSearchQuery,
            onQueryChange = onMakeSearchQueryChange,
            suggestions = makes,
            onSuggestionSelected = onMakeSelected,
            pickedMake = pickedMake
        )
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = partNumber,
            onValueChange = onPartNumberChange,
            label = { Text("Номер детали") },
            placeholder = { Text("Например, 12345-67890") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text("Состояние", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Row(Modifier.fillMaxWidth()) {
            ProductCondition.entries.forEach { option ->
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
                    Text(text = when(option) {
                        ProductCondition.NEW -> "Новый"
                        ProductCondition.USED -> "Б/у"
                    }, modifier = Modifier.padding(start = 4.dp))
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MakeSelector(
    query: String,
    onQueryChange: (String) -> Unit,
    suggestions: List<MakeModel>?,
    onSuggestionSelected: (MakeModel) -> Unit,
    pickedMake: MakeModel?
) {
    var expanded by remember(suggestions) { mutableStateOf(!suggestions.isNullOrEmpty()) }

    ExposedDropdownMenuBox(
        expanded = expanded && pickedMake == null,
        onExpandedChange = { expanded = it }
    ) {
        OutlinedTextField(
            value = query,
            onValueChange = onQueryChange,
            label = { Text("Марка автомобиля") },
            modifier = Modifier
                .menuAnchor()
                .fillMaxWidth(),
            singleLine = true
        )
        if (pickedMake == null) {
            ExposedDropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false }
            ) {
                suggestions?.forEach { make ->
                    DropdownMenuItem(
                        text = { Text(make.makeName) },
                        onClick = {
                            onSuggestionSelected(make)
                            expanded = false
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun PriceAndDescriptionSection(
    price: String,
    onPriceChange: (String) -> Unit,
    quantity: String,
    onQuantityChange: (String) -> Unit,
    description: String,
    onDescriptionChange: (String) -> Unit
) {
    SectionCard(title = "3. Цена и описание") {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            OutlinedTextField(
                value = price,
                onValueChange = onPriceChange,
                label = { Text("Цена") },
                leadingIcon = { Text("₽") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.weight(1f),
                singleLine = true
            )
            OutlinedTextField(
                value = quantity,
                onValueChange = onQuantityChange,
                label = { Text("Кол-во") },
                trailingIcon = { Text("шт.") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.weight(1f),
                singleLine = true
            )
        }
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = description,
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
fun ActionButtons(
    isPublishing: Boolean,
    onPublishClick: () -> Unit,
    onCancelClick: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End)
    ) {
        OutlinedButton(onClick = onCancelClick, enabled = !isPublishing) {
            Text("Отмена")
        }
        Button(onClick = onPublishClick, enabled = !isPublishing) {
            Text("Опубликовать")
        }
    }
}


@Composable
fun OrganizationSection(viewModel: SparePartCreateViewModel) {
    SectionCard(title = "Организация") {
        OrganizationSelector(viewModel = viewModel)
    }
}


@Composable
fun PhotosSection(
    selectedImageUris: List<Uri>,
    onAddImageClick: () -> Unit,
    onRemoveImageClick: (Uri) -> Unit
) {
    SectionCard(title = "2. Фотографии") {
        if (selectedImageUris.isNotEmpty()) {
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(selectedImageUris) { uri ->
                    Box(
                        modifier = Modifier
                            .size(100.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        AsyncImage(
                            model = uri,
                            contentDescription = "Выбранное изображение",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
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
                                tint = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                    }
                }
            }
        }

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(if (selectedImageUris.isEmpty()) 150.dp else 80.dp)
                .border(
                    width = 2.dp,
                    brush = SolidColor(MaterialTheme.colorScheme.outline),
                    shape = RoundedCornerShape(12.dp)
                )
                .clickable(onClick = onAddImageClick)
                .padding(16.dp),
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
            null -> {
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
        SparePartCreateScreen(onNavigateBack = {})
    }
}