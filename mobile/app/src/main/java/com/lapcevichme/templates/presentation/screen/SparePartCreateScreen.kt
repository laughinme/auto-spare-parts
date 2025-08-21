package com.example.partmarketplace

import android.content.res.Configuration
import androidx.compose.foundation.border
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
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lapcevichme.templates.domain.model.ProductCondition
import com.lapcevichme.templates.presentation.viewmodel.SparePartCreateViewModel
import com.lapcevichme.templates.presentation.viewmodel.UiEvent
import com.lapcevichme.templates.ui.theme.PreviewTheme
import kotlinx.coroutines.flow.collectLatest

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SparePartCreateScreen(
    viewModel: SparePartCreateViewModel = hiltViewModel()
) {
    val brand by viewModel.brand.collectAsStateWithLifecycle()
    val partNumber by viewModel.partNumber.collectAsStateWithLifecycle()
    val conditionOptions = listOf("новый", "б/у")
    val selectedCondition by viewModel.selectedCondition.collectAsStateWithLifecycle()

    val price by viewModel.price.collectAsStateWithLifecycle()
    val description by viewModel.description.collectAsStateWithLifecycle()
    // val status by viewModel.status.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(key1 = true) {
        viewModel.uiEvent.collectLatest {
            event ->
            when (event) {
                is UiEvent.ShowSnackbar -> {
                    snackbarHostState.showSnackbar(
                        message = event.message
                    )
                }
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
            item {
                BasicInfoSection(
                    brand = brand,
                    onBrandChange = { viewModel.onBrandChanged(it!!) },
                    partNumber = partNumber,
                    onPartNumberChange = { viewModel.onPartNumberChanged(it!!) },
                    selectedCondition = when(selectedCondition) {
                        ProductCondition.NEW -> "новый"
                        ProductCondition.USED -> "б/у"
                        else -> null
                    },
                    onConditionSelected = { viewModel.onConditionChanged(it!!) },
                    conditionOptions = conditionOptions
                )
            }
            item { PhotosSection() } // Assuming photos are still needed
            item { PriceAndDescriptionSection(price, { viewModel.onPriceChanged(it!!) }, description, { viewModel.onDescriptionChanged(it!!) }) }
            item { ActionButtons(onPublishClick = { viewModel.onCreateClicked() }) }
        }
    }
}

@Composable
fun BasicInfoSection(
    brand: String?,
    onBrandChange: (String?) -> Unit,
    partNumber: String?,
    onPartNumberChange: (String?) -> Unit,
    selectedCondition: String?,
    onConditionSelected: (String?) -> Unit,
    conditionOptions: List<String>
) {
    SectionCard(title = "1. Основная информация") {
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
                    Text(text = option, modifier = Modifier.padding(start = 4.dp)) // Displaying condition options like "new", "used"
                }
            }
        }
    }
}

@Composable
fun PhotosSection() { // Assuming this section remains as is for now
    SectionCard(title = "2. Фотографии") {
        val stroke = Stroke(
            width = 4f,
            pathEffect = PathEffect.dashPathEffect(floatArrayOf(20f, 10f), 0f)
        )
        Box(
            Modifier
                .fillMaxWidth()
                .height(150.dp)
                .border(
                    width = 2.dp,
                    color = MaterialTheme.colorScheme.outline,
                    shape = RoundedCornerShape(12.dp)
                ),
            contentAlignment = Alignment.Center
        ) {
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
    }
}


@Composable
fun PriceAndDescriptionSection(
    price: String?,
    onPriceChange: (String?) -> Unit,
    description: String?,
    onDescriptionChange: (String?) -> Unit
) {
    SectionCard(title = "3. Цена и описание") { // Updated section number
        OutlinedTextField(
            value = price ?: "",
            onValueChange = onPriceChange,
            label = { Text("Цена") },
            leadingIcon = { Text("₽") }, // Consider if currency symbol is fixed or part of price
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
fun ActionButtons(onPublishClick: () -> Unit) { // Added onPublishClick parameter
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End)
    ) {
        OutlinedButton(onClick = { /* TODO: Handle cancel */ }) {
            Text("Отмена")
        }
        Button(onClick = onPublishClick) { // Use the passed lambda
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


@Preview(showBackground = true, name = "Light Theme SparePartCreateScreen")
@Preview(
    showBackground = true,
    uiMode = Configuration.UI_MODE_NIGHT_YES,
    name = "Dark Theme SparePartCreateScreen"
)
@Composable
fun SparePartCreateScreenPreview() { // Renamed preview function for clarity
    PreviewTheme {
        SparePartCreateScreen()
    }
}
