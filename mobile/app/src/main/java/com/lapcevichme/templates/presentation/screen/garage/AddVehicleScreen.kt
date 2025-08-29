package com.lapcevichme.templates.presentation.screen.garage

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.lapcevichme.templates.presentation.components.common.QuickSearchDropdown
import com.lapcevichme.templates.presentation.components.common.SearchableDropdown
import com.lapcevichme.templates.presentation.viewmodel.GarageEvent
import com.lapcevichme.templates.presentation.viewmodel.GarageViewModel
import com.lapcevichme.templates.presentation.viewmodel.SearchViewModel
import com.lapcevichme.templates.presentation.viewmodel.VehicleOperationStatus
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddVehicleScreen(
    navController: NavController,
    garageViewModel: GarageViewModel = hiltViewModel(),
    searchViewModel: SearchViewModel = hiltViewModel() // <-- Добавляем SearchViewModel
) {
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // --- Состояния из GarageViewModel (для сохранения) ---
    val vin by garageViewModel.vinInput.collectAsState()
    val comment by garageViewModel.commentInput.collectAsState()
    val operationStatus by garageViewModel.vehicleOperationStatus.collectAsState()

    // --- Состояния из SearchViewModel (для полей выбора) ---
    val makes by searchViewModel.vehiclesMakes.collectAsStateWithLifecycle()
    val selectedMake by searchViewModel.pickedVehiclesMake.collectAsStateWithLifecycle()
    val makeSearchQuery by searchViewModel.makeSearchQuery.collectAsStateWithLifecycle()

    val models by searchViewModel.vehiclesModels.collectAsStateWithLifecycle()
    val selectedModel by searchViewModel.pickedVehiclesModel.collectAsStateWithLifecycle()
    val modelSearchQuery by searchViewModel.modelSearchQuery.collectAsStateWithLifecycle()

    val years by searchViewModel.vehiclesYears.collectAsStateWithLifecycle()
    val selectedYear by searchViewModel.pickedVehiclesYear.collectAsStateWithLifecycle()

    // --- Локальные состояния для управления UI (раскрытие списков) ---
    var makeExpanded by remember { mutableStateOf(false) }
    var modelExpanded by remember { mutableStateOf(false) }
    var yearExpanded by remember { mutableStateOf(false) }

    // --- Обработка статуса операции (сохранение, ошибка) ---
    LaunchedEffect(operationStatus) {
        when (val status = operationStatus) {
            is VehicleOperationStatus.Success -> {
                scope.launch {
                    snackbarHostState.showSnackbar(status.message ?: "Автомобиль успешно добавлен")
                }
                garageViewModel.clearOperationStatus() // Сбрасываем статус
                navController.popBackStack() // Возвращаемся назад
            }
            is VehicleOperationStatus.Error -> {
                scope.launch {
                    snackbarHostState.showSnackbar(status.message)
                }
                garageViewModel.clearOperationStatus() // Сбрасываем статус
            }
            is VehicleOperationStatus.Loading -> { /* Показываем индикатор загрузки */ }
            VehicleOperationStatus.Idle -> { /* Ничего не делаем */ }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Добавить автомобиль") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Назад")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { garageViewModel.onEvent(GarageEvent.SubmitAddVehicleForm) }) {
                Text("Добавить")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // --- Поле выбора марки ---
            SearchableDropdown(
                label = "Марка*",
                searchQuery = makeSearchQuery,
                onSearchQueryChange = { newQuery ->
                    searchViewModel.onMakeSearchQueryChanged(newQuery)
                    makeExpanded = true
                },
                options = makes,
                optionToString = { it.makeName },
                onOptionSelected = { make ->
                    searchViewModel.onBrandSelected(make) // Обновляем текст и загружаем модели
                    garageViewModel.onMakeIdChanged(make.makeId) // Сохраняем ID
                },
                expanded = makeExpanded,
                onExpandedChange = { makeExpanded = it },
                modifier = Modifier.fillMaxWidth()
            )

            // --- Поле выбора модели ---
            SearchableDropdown(
                label = "Модель*",
                searchQuery = modelSearchQuery,
                onSearchQueryChange = { newQuery ->
                    searchViewModel.onModelSearchQueryChanged(newQuery)
                    modelExpanded = true
                },
                options = models,
                optionToString = { it.modelName },
                onOptionSelected = { model ->
                    searchViewModel.onModelSelected(model) // Обновляем текст и загружаем годы
                    garageViewModel.onModelIdChanged(model.modelId) // Сохраняем ID
                },
                expanded = modelExpanded,
                onExpandedChange = { modelExpanded = it },
                enabled = selectedMake != null, // Доступно только после выбора марки
                modifier = Modifier.fillMaxWidth()
            )

            // --- Поле выбора года ---
            val yearOptions = listOf("Неважно") + (years?.map { it.toString() }?.distinct()?.sortedDescending() ?: emptyList())
            QuickSearchDropdown(
                label = "Год*",
                options = yearOptions,
                selectedOption = selectedYear?.toString() ?: "Неважно",
                onOptionSelected = { yearString ->
                    val yearInt = yearString.toIntOrNull()
                    searchViewModel.onYearSelected(yearInt) // Обновляем текст
                    garageViewModel.onYearChanged(yearString.takeIf { it != "Неважно" }) // Сохраняем год или null
                },
                expanded = yearExpanded,
                onExpandedChange = { yearExpanded = it },
                enabled = selectedModel != null, // Доступно только после выбора модели
                modifier = Modifier.fillMaxWidth()
            )

            // --- Остальные поля ---
            OutlinedTextField(
                value = vin,
                onValueChange = { garageViewModel.onVinChanged(it) },
                label = { Text("VIN") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = comment,
                onValueChange = { garageViewModel.onCommentChanged(it) },
                label = { Text("Комментарий") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3
            )

            if (operationStatus is VehicleOperationStatus.Loading) {
                CircularProgressIndicator(modifier = Modifier.padding(top = 16.dp))
            }
        }
    }
}
