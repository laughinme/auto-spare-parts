package com.lapcevichme.templates.presentation.components.homeTabCards

import android.content.res.Configuration
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lapcevichme.templates.ui.theme.PreviewTheme
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickSearchCard() {
    // State for dropdowns and text fields
    var brandExpanded by remember { mutableStateOf(false) }
    val brands = listOf("Любая", "Toyota", "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Lada (ВАЗ)")
    var selectedBrand by remember { mutableStateOf(brands[0]) }

    var modelExpanded by remember { mutableStateOf(false) }
    // Models would typically be dynamic based on brand; using a placeholder list for now.
    val models = listOf("Любая", "Camry", "Corolla", "X5", "3 Series", "C-Class", "E-Class", "A4", "A6", "Golf", "Passat", "Granta", "Vesta")
    var selectedModel by remember { mutableStateOf(models[0]) }

    val currentYear = Calendar.getInstance().get(Calendar.YEAR)
    val years = listOf("Неважно") + (currentYear downTo 1980).map { it.toString() }

    var yearFromExpanded by remember { mutableStateOf(false) }
    var selectedYearFrom by remember { mutableStateOf(years[0]) }

    var yearToExpanded by remember { mutableStateOf(false) }
    var selectedYearTo by remember { mutableStateOf(years[0]) }

    var priceFrom by remember { mutableStateOf("") }
    var priceTo by remember { mutableStateOf("") }

    Surface(
        modifier = Modifier.fillMaxWidth(), // To emulate body bg and centering for preview
        color = MaterialTheme.colorScheme.background // bg-gray-100
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp), // p-4 from body
            contentAlignment = Alignment.Center // flex items-center justify-center
        ) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .widthIn(max = 448.dp), // max-w-md (28rem = 448px)
                shape = RoundedCornerShape(16.dp), // rounded-2xl
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp), // shadow-lg
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface) // bg-white
            ) {
                Column(
                    modifier = Modifier
                        .padding(horizontal = 24.dp, vertical = 32.dp) // p-6 sm:p-8 (using 24dp horizontal, 32dp vertical)
                        .fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Быстрый поиск авто",
                        fontSize = 24.sp, // text-2xl
                        fontWeight = FontWeight.Bold, // font-bold
                        textAlign = TextAlign.Center, // text-center
                        color = MaterialTheme.colorScheme.onSurfaceVariant, // Equivalent for text-gray-800
                        modifier = Modifier.padding(bottom = 24.dp) // mb-6
                    )

                    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) { // space-y-4
                        // Brand and Model Row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(16.dp) // gap-4
                        ) {
                            // Brand Dropdown
                            QuickSearchDropdown(
                                label = "Марка",
                                options = brands,
                                selectedOption = selectedBrand,
                                onOptionSelected = { selectedBrand = it },
                                expanded = brandExpanded,
                                onExpandedChange = { brandExpanded = it },
                                modifier = Modifier.weight(1f)
                            )
                            // Model Dropdown
                            QuickSearchDropdown(
                                label = "Модель",
                                options = models, // Placeholder/example models
                                selectedOption = selectedModel,
                                onOptionSelected = { selectedModel = it },
                                expanded = modelExpanded,
                                onExpandedChange = { modelExpanded = it },
                                modifier = Modifier.weight(1f)
                            )
                        }

                        // Year From/To Row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(16.dp) // gap-4
                        ) {
                            QuickSearchDropdown(
                                label = "Год от",
                                options = years,
                                selectedOption = selectedYearFrom,
                                onOptionSelected = { selectedYearFrom = it },
                                expanded = yearFromExpanded,
                                onExpandedChange = { yearFromExpanded = it },
                                modifier = Modifier.weight(1f)
                            )
                            QuickSearchDropdown(
                                label = "Год до",
                                options = years,
                                selectedOption = selectedYearTo,
                                onOptionSelected = { selectedYearTo = it },
                                expanded = yearToExpanded,
                                onExpandedChange = { yearToExpanded = it },
                                modifier = Modifier.weight(1f)
                            )
                        }

                        // Price Inputs
                        Column {
                            Text(
                                "Цена, ₽",
                                fontSize = 14.sp, // text-sm
                                fontWeight = FontWeight.Medium, // font-medium
                                color = MaterialTheme.colorScheme.onSurfaceVariant, // text-gray-600
                                modifier = Modifier.padding(bottom = 4.dp) // mb-1
                            )
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(16.dp) // gap-4
                            ) {
                                OutlinedTextField(
                                    value = priceFrom,
                                    onValueChange = { priceFrom = it },
                                    placeholder = { Text("от") },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(8.dp), // rounded-lg
                                    singleLine = true
                                )
                                OutlinedTextField(
                                    value = priceTo,
                                    onValueChange = { priceTo = it },
                                    placeholder = { Text("до") },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(8.dp), // rounded-lg
                                    singleLine = true
                                )
                            }
                        }

                        // Search Button
                        Button(
                            onClick = { /* TODO: Implement search action */ },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 8.dp), // Additional top margin (mt-4 was in HTML, space-y covers some)
                            shape = RoundedCornerShape(8.dp), // rounded-lg
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB)) // bg-blue-600
                        ) {
                            Text(
                                "Найти",
                                fontWeight = FontWeight.Bold, // font-bold
                                color = Color.White,
                                modifier = Modifier.padding(vertical = 10.dp) // py-3 (12dp total, button adds some)
                            )
                        }
                    }
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
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        Text(
            text = label,
            fontSize = 14.sp, // text-sm
            fontWeight = FontWeight.Medium, // font-medium
            color = MaterialTheme.colorScheme.onSurfaceVariant, // text-gray-600
            modifier = Modifier.padding(bottom = 4.dp) // mb-1
        )
        ExposedDropdownMenuBox(
            expanded = expanded,
            onExpandedChange = onExpandedChange
        ) {
            OutlinedTextField(
                value = selectedOption,
                onValueChange = {},
                readOnly = true,
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth(),
                shape = RoundedCornerShape(8.dp), // rounded-lg
                singleLine = true
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
        QuickSearchCard()
    }
}
