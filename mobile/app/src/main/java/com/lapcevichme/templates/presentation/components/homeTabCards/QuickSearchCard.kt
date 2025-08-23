package com.lapcevichme.templates.presentation.components.homeTabCards

import android.content.res.Configuration
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lapcevichme.templates.domain.model.garage.MakeModel
import com.lapcevichme.templates.domain.model.garage.VehicleModelInfo
import com.lapcevichme.templates.presentation.viewmodel.SearchViewModel
import com.lapcevichme.templates.ui.theme.PreviewTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickSearchCard(
    viewModel: SearchViewModel = hiltViewModel(),
    onNavigateToSearch: () -> Unit
) {
    // Collect states from ViewModel
    val makes by viewModel.vehiclesMakes.collectAsStateWithLifecycle()
    val selectedMake by viewModel.pickedVehiclesMake.collectAsStateWithLifecycle()
    val makeSearchQuery by viewModel.makeSearchQuery.collectAsStateWithLifecycle()

    val models by viewModel.vehiclesModels.collectAsStateWithLifecycle()
    val selectedModel by viewModel.pickedVehiclesModel.collectAsStateWithLifecycle()
    val modelSearchQuery by viewModel.modelSearchQuery.collectAsStateWithLifecycle()

    val years by viewModel.vehiclesYears.collectAsStateWithLifecycle()
    val selectedYear by viewModel.pickedVehiclesYear.collectAsStateWithLifecycle()

    val priceFrom by viewModel.priceMin.collectAsStateWithLifecycle()
    val priceTo by viewModel.priceMax.collectAsStateWithLifecycle()

    // State for dropdowns expanded status
    var brandExpanded by remember { mutableStateOf(false) }
    var modelExpanded by remember { mutableStateOf(false) }
    var yearExpanded by remember { mutableStateOf(false) }

    val yearOptions = listOf("Неважно") + (years?.map { it.toString() }?.distinct()?.sortedDescending() ?: emptyList())

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier
                .padding(horizontal = 24.dp, vertical = 32.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Быстрый поиск авто",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 24.dp)
            )

            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Brand Dropdown with Search
                    SearchableDropdown(
                        label = "Марка",
                        searchQuery = makeSearchQuery,
                        onSearchQueryChange = { newQuery ->
                            viewModel.onMakeSearchQueryChanged(newQuery)
                            brandExpanded = true // Keep it expanded while typing
                        },
                        options = makes, // Can be null while loading
                        optionToString = { it.makeName },
                        onOptionSelected = viewModel::onBrandSelected,
                        expanded = brandExpanded,
                        onExpandedChange = { brandExpanded = it },
                        modifier = Modifier.weight(1f)
                    )
                    // Model Dropdown with Search
                    SearchableDropdown(
                        label = "Модель",
                        searchQuery = modelSearchQuery,
                        onSearchQueryChange = { newQuery ->
                            viewModel.onModelSearchQueryChanged(newQuery)
                            modelExpanded = true // Keep it expanded while typing
                        },
                        options = models, // Can be null while loading
                        optionToString = { it.modelName },
                        onOptionSelected = viewModel::onModelSelected,
                        expanded = modelExpanded,
                        onExpandedChange = { modelExpanded = it },
                        enabled = selectedMake != null,
                        modifier = Modifier.weight(1f)
                    )
                }

                // Year Dropdown (Static)
                QuickSearchDropdown(
                    label = "Год",
                    options = yearOptions,
                    selectedOption = selectedYear?.toString() ?: "Неважно",
                    onOptionSelected = { year -> viewModel.onYearSelected(year.toIntOrNull()) },
                    expanded = yearExpanded,
                    onExpandedChange = { yearExpanded = it },
                    enabled = selectedModel != null,
                    modifier = Modifier.fillMaxWidth()
                )

                // Price Inputs
                Column {
                    Text(
                        "Цена, ₽",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(bottom = 4.dp)
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        OutlinedTextField(
                            value = priceFrom?.toString()?.removeSuffix(".0") ?: "",
                            onValueChange = { newPriceFromString ->
                                viewModel.onPriceFromChanged(newPriceFromString)
                            },
                            placeholder = { Text("от") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = priceTo?.toString()?.removeSuffix(".0") ?: "",
                            onValueChange = { newPriceToString ->
                                viewModel.onPriceToChanged(newPriceToString)
                            },
                            placeholder = { Text("до") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            singleLine = true
                        )
                    }
                }

                // Search Button
                Button(
                    onClick = {
                        viewModel.onQuickSearchClicked()
                        onNavigateToSearch()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
                ) {
                    Text(
                        "Найти",
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(vertical = 10.dp)
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun <T> SearchableDropdown(
    label: String,
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    options: List<T>?,
    optionToString: (T) -> String,
    onOptionSelected: (T) -> Unit,
    expanded: Boolean,
    onExpandedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    Column(modifier = modifier) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 4.dp)
        )
        ExposedDropdownMenuBox(
            expanded = expanded,
            onExpandedChange = { if (enabled) onExpandedChange(it) }
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = onSearchQueryChange,
                enabled = enabled,
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth()
                    .onFocusChanged {
                        if (it.isFocused) {
                            onExpandedChange(true)
                        }
                    },
                shape = RoundedCornerShape(8.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    disabledTextColor = MaterialTheme.colorScheme.onSurface,
                    disabledBorderColor = MaterialTheme.colorScheme.outline,
                    disabledTrailingIconColor = MaterialTheme.colorScheme.onSurfaceVariant
                )
            )

            ExposedDropdownMenu(
                expanded = expanded,
                onDismissRequest = { onExpandedChange(false) }
            ) {
                if (options != null) {
                    if (options.isNotEmpty()) {
                        options.forEach { option ->
                            DropdownMenuItem(
                                text = { Text(optionToString(option)) },
                                onClick = {
                                    onOptionSelected(option)
                                    onExpandedChange(false)
                                }
                            )
                        }
                    } else {
                        // Show "Nothing found" only if the user has typed something
                        if (searchQuery.isNotEmpty()) {
                            DropdownMenuItem(
                                text = { Text("Ничего не найдено") },
                                onClick = {},
                                enabled = false
                            )
                        }
                    }
                } else {
                    // Show "Loading..." when options are null
                    DropdownMenuItem(
                        text = { Text("Загрузка...") },
                        onClick = {},
                        enabled = false
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickSearchDropdown(
    label: String,
    options: List<String>,
    selectedOption: String,
    onOptionSelected: (String) -> Unit,
    expanded: Boolean,
    onExpandedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    Column(modifier = modifier) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 4.dp)
        )
        ExposedDropdownMenuBox(
            expanded = expanded,
            onExpandedChange = { if (enabled) onExpandedChange(it) }
        ) {
            OutlinedTextField(
                value = selectedOption,
                onValueChange = {},
                readOnly = true,
                enabled = enabled,
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth(),
                shape = RoundedCornerShape(8.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    disabledTextColor = MaterialTheme.colorScheme.onSurface,
                    disabledBorderColor = MaterialTheme.colorScheme.outline,
                    disabledTrailingIconColor = MaterialTheme.colorScheme.onSurfaceVariant
                )
            )
            ExposedDropdownMenu(
                expanded = expanded,
                onDismissRequest = { onExpandedChange(false) }
            ) {
                options.forEach { option ->
                    DropdownMenuItem(
                        text = { Text(option) },
                        onClick = {
                            onOptionSelected(option)
                            onExpandedChange(false)
                        }
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true, name = "Light Theme QuickSearchCard")
@Preview(
    showBackground = true,
    uiMode = Configuration.UI_MODE_NIGHT_YES,
    name = "Dark Theme QuickSearchCard"
)
@Composable
fun QuickSearchCardPreview() {
    PreviewTheme {
        QuickSearchCard(onNavigateToSearch = {})
    }
}
