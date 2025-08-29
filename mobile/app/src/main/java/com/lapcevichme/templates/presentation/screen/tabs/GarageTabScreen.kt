package com.lapcevichme.templates.presentation.screen.tabs

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SwipeToDismissBox
import androidx.compose.material3.SwipeToDismissBoxValue
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberSwipeToDismissBoxState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.MakeModel
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.VehicleModel
import com.lapcevichme.templates.domain.model.VehicleModelInfo
import com.lapcevichme.templates.presentation.components.garageTab.GarageCarCard
import com.lapcevichme.templates.presentation.viewmodel.GarageEvent
import com.lapcevichme.templates.presentation.viewmodel.GarageViewModel
import com.lapcevichme.templates.ui.theme.PreviewTheme

@Composable
fun GarageTabScreen(
    viewModel: GarageViewModel = hiltViewModel(),
    onNavigateToAddVehicle: () -> Unit,
    onNavigateToEditVehicle: (String) -> Unit // <-- Новый параметр для навигации на экран редактирования
) {
    val vehiclesState by viewModel.vehiclesState.collectAsStateWithLifecycle()

    GarageTabContent(
        vehiclesState = vehiclesState,
        onEvent = viewModel::onEvent,
        onNavigateToAddVehicle = onNavigateToAddVehicle,
        onNavigateToEditVehicle = onNavigateToEditVehicle // <-- Передаем дальше
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun GarageTabContent(
    vehiclesState: Resource<CursorPage<VehicleModel>>,
    onEvent: (GarageEvent) -> Unit,
    onNavigateToAddVehicle: () -> Unit,
    onNavigateToEditVehicle: (String) -> Unit // <-- Новый параметр
) {
    var vehicleToDelete by remember { mutableStateOf<VehicleModel?>(null) }

    vehicleToDelete?.let { vehicle ->
        DeleteConfirmationDialog(
            vehicleName = "${vehicle.make.makeName} ${vehicle.model.modelName}",
            onConfirm = {
                onEvent(GarageEvent.OnDeleteVehicle(vehicle.id))
                vehicleToDelete = null
            },
            onDismiss = {
                vehicleToDelete = null
            }
        )
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(onClick = onNavigateToAddVehicle) {
                Icon(Icons.Filled.Add, contentDescription = "Add Vehicle")
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize()
        ) {
            when (vehiclesState) {
                is Resource.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }

                is Resource.Error -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center).padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(text = vehiclesState.message ?: "Не удалось загрузить автомобили")
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(onClick = { onEvent(GarageEvent.OnRetryLoadVehicles) }) {
                            Text("Повторить")
                        }
                    }
                }

                is Resource.Success -> {
                    val vehiclesPage = vehiclesState.data
                    if (vehiclesPage != null && vehiclesPage.items.isNotEmpty()) {
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(vertical = 8.dp)
                        ) {
                            items(vehiclesPage.items, key = { it.id }) { car ->
                                val dismissState = rememberSwipeToDismissBoxState()

                                if (dismissState.currentValue == SwipeToDismissBoxValue.EndToStart) {
                                    LaunchedEffect(Unit) {
                                        vehicleToDelete = car
                                        dismissState.reset()
                                    }
                                }

                                SwipeToDismissBox(
                                    state = dismissState,
                                    enableDismissFromStartToEnd = false,
                                    backgroundContent = {
                                        val color by animateColorAsState(
                                            targetValue = if (dismissState.targetValue == SwipeToDismissBoxValue.EndToStart) Color.Red.copy(alpha = 0.8f) else Color.Transparent,
                                            label = "background color animation"
                                        )
                                        val scale by animateFloatAsState(
                                            targetValue = if (dismissState.targetValue == SwipeToDismissBoxValue.EndToStart) 1.2f else 0.8f,
                                            label = "icon scale animation"
                                        )

                                        Box(
                                            Modifier
                                                .fillMaxSize()
                                                .background(color)
                                                .padding(horizontal = 20.dp),
                                            contentAlignment = Alignment.CenterEnd
                                        ) {
                                            Icon(
                                                Icons.Default.Delete,
                                                contentDescription = "Delete Icon",
                                                modifier = Modifier.scale(scale),
                                                tint = Color.White
                                            )
                                        }
                                    }
                                ) {
                                    // --- ВЫЗОВ ОБНОВЛЕННОЙ КАРТОЧКИ ---
                                    GarageCarCard(
                                        car = car,
                                        onEditClick = { onNavigateToEditVehicle(car.id) } // <-- Передаем ID машины для редактирования
                                    )
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                            }
                        }
                    } else {
                        Column(
                            modifier = Modifier.align(Alignment.Center).padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Text(text = "Ваш гараж пуст")
                            Spacer(modifier = Modifier.height(16.dp))
                            Text("Нажмите \"+\", чтобы добавить автомобиль")
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DeleteConfirmationDialog(
    vehicleName: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Подтвердите удаление") },
        text = { Text("Вы уверены, что хотите удалить $vehicleName из вашего гаража?") },
        confirmButton = {
            TextButton(onClick = onConfirm) { Text("Удалить") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Отмена") }
        }
    )
}


// region Previews
@Preview(showBackground = true, name = "Success State")
@Composable
fun GarageTabScreenPreview_Success() {
    PreviewTheme {
        GarageTabContent(
            vehiclesState = Resource.Success(
                CursorPage(
                    items = listOf(
                        VehicleModel(createdAt = "2023-01-01T10:00:00Z", updatedAt = null, id = "vehicle1", userId = "user1", make = MakeModel(1, "Tesla"), model = VehicleModelInfo(1,1, "Model S"), year = 2022, vehicleType = null, vin = "VIN123XYZ", comment = "My Tesla"),
                        VehicleModel(createdAt = "2023-02-15T12:30:00Z", updatedAt = null, id = "vehicle2", userId = "user1", make = MakeModel(2, "BMW"), model = VehicleModelInfo(2,2, "M5"), year = 2023, vehicleType = null, vin = "VIN456ABC", comment = "Fast Car")
                    ),
                    nextCursor = "some_next_cursor_token"
                )
            ),
            onEvent = {},
            onNavigateToAddVehicle = {},
            onNavigateToEditVehicle = {}
        )
    }
}