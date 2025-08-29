package com.lapcevichme.templates.presentation.screen.tabs

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
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.MakeModel
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.VehicleModel
import com.lapcevichme.templates.domain.model.VehicleModelInfo
// Предполагается, что GarageCarCard принимает com.lapcevichme.templates.domain.model.VehicleModel
import com.lapcevichme.templates.presentation.components.garageTab.GarageCarCard
import com.lapcevichme.templates.presentation.viewmodel.GarageEvent
import com.lapcevichme.templates.presentation.viewmodel.GarageViewModel
import com.lapcevichme.templates.ui.theme.PreviewTheme

@Composable
fun GarageTabScreen(
    viewModel: GarageViewModel = hiltViewModel(),
    onNavigateToAddVehicle: () -> Unit // <-- Новый параметр
) {
    val vehiclesState by viewModel.vehiclesState.collectAsStateWithLifecycle()

    GarageTabContent(
        vehiclesState = vehiclesState,
        onEvent = viewModel::onEvent,
        onNavigateToAddVehicle = onNavigateToAddVehicle // <-- Передаем дальше
    )
}

@Composable
private fun GarageTabContent(
    vehiclesState: Resource<CursorPage<VehicleModel>>,
    onEvent: (GarageEvent) -> Unit,
    onNavigateToAddVehicle: () -> Unit // <-- Новый параметр
) {
    Scaffold(
        floatingActionButton = { // <-- Добавляем FAB
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
                                .padding(horizontal = 16.dp, vertical = 8.dp)
                        ) {
                            items(vehiclesPage.items, key = { it.id }) { car ->
                                GarageCarCard(car = car) // Убедитесь, что GarageCarCard принимает VehicleModel
                                Spacer(modifier = Modifier.height(8.dp))
                            }
                            // TODO: Добавить логику для подгрузки данных, если vehiclesPage.nextCursor != null
                            // Например, можно добавить специальный item в конце списка, который будет
                            // вызывать onEvent(GarageEvent.LoadNextPage(vehiclesPage.nextCursor))
                            // при его появлении на экране.
                        }
                    } else {
                        Column(
                            modifier = Modifier.align(Alignment.Center).padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Text(text = "Ваш гараж пуст")
                            Spacer(modifier = Modifier.height(16.dp))
                            Text("Нажмите "+", чтобы добавить автомобиль")
                        }
                    }
                }
            }
        }
    }
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
            onNavigateToAddVehicle = {}
        )
    }
}

@Preview(showBackground = true, name = "Empty State")
@Composable
fun GarageTabScreenPreview_Empty() {
    PreviewTheme {
        GarageTabContent(
            vehiclesState = Resource.Success(
                CursorPage(
                    items = emptyList(),
                    nextCursor = null
                )
            ),
            onEvent = {},
            onNavigateToAddVehicle = {}
        )
    }
}

@Preview(showBackground = true, name = "Error State")
@Composable
fun GarageTabScreenPreview_Error() {
    PreviewTheme {
        GarageTabContent(
            vehiclesState = Resource.Error("Произошла ошибка сети. Пожалуйста, попробуйте снова."),
            onEvent = {},
            onNavigateToAddVehicle = {}
        )
    }
}

@Preview(showBackground = true, name = "Loading State")
@Composable
fun GarageTabScreenPreview_Loading() {
    PreviewTheme {
        GarageTabContent(
            vehiclesState = Resource.Loading(),
            onEvent = {},
            onNavigateToAddVehicle = {}
        )
    }
}
//
//@Preview(showBackground = true, name = "Idle State")
//@Composable
//fun GarageTabScreenPreview_Idle() {
//    PreviewTheme {
//        GarageTabContent(
//            vehiclesState = Resource.Idle(),
//            onEvent = {}
//        )
//    }
//}
