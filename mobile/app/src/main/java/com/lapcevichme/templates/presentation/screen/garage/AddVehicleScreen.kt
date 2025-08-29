package com.lapcevichme.templates.presentation.screen.garage

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.lapcevichme.templates.presentation.viewmodel.GarageEvent
import com.lapcevichme.templates.presentation.viewmodel.GarageViewModel
import com.lapcevichme.templates.presentation.viewmodel.VehicleOperationStatus
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddVehicleScreen(
    navController: NavController,
    viewModel: GarageViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    val makeId by viewModel.selectedMakeId.collectAsState()
    val modelId by viewModel.selectedModelId.collectAsState()
    val year by viewModel.selectedYear.collectAsState()
    val vehicleTypeId by viewModel.selectedVehicleTypeId.collectAsState()
    val vin by viewModel.vinInput.collectAsState()
    val comment by viewModel.commentInput.collectAsState()

    val operationStatus by viewModel.vehicleOperationStatus.collectAsState()

    LaunchedEffect(operationStatus) {
        when (val status = operationStatus) {
            is VehicleOperationStatus.Success -> {
                scope.launch {
                    snackbarHostState.showSnackbar(status.message ?: "Operation successful")
                }
                viewModel.clearOperationStatus() // Reset status
                navController.popBackStack() // Navigate back
            }
            is VehicleOperationStatus.Error -> {
                scope.launch {
                    snackbarHostState.showSnackbar(status.message)
                }
                viewModel.clearOperationStatus() // Reset status
            }
            is VehicleOperationStatus.Loading -> {
                // Optionally show a loading indicator centrally
            }
            VehicleOperationStatus.Idle -> {
                // Do nothing
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Add New Vehicle") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { viewModel.onEvent(GarageEvent.SubmitAddVehicleForm) }) {
                Text("Add") // Or an Icon
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text("Enter Vehicle Details", style = MaterialTheme.typography.titleMedium)

            OutlinedTextField(
                value = makeId?.toString() ?: "",
                onValueChange = { value -> viewModel.onMakeIdChanged(value.toIntOrNull()) },
                label = { Text("Make ID*") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = modelId?.toString() ?: "",
                onValueChange = { value -> viewModel.onModelIdChanged(value.toIntOrNull()) },
                label = { Text("Model ID*") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth()
            )

            // For Year, you might want a dropdown with "Неважно" and numbers
            // For simplicity, using TextField here.
            OutlinedTextField(
                value = year ?: "",
                onValueChange = { viewModel.onYearChanged(it.ifBlank { null }) }, // Allow empty to represent "not set" before "Неважно" logic
                label = { Text("Year* (e.g., 2023 or 'Неважно')") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = vehicleTypeId?.toString() ?: "",
                onValueChange = { value -> viewModel.onVehicleTypeIdChanged(value.toIntOrNull()) },
                label = { Text("Vehicle Type ID*") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = vin,
                onValueChange = { viewModel.onVinChanged(it) },
                label = { Text("VIN") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = comment,
                onValueChange = { viewModel.onCommentChanged(it) },
                label = { Text("Comment") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3
            )

            if (operationStatus is VehicleOperationStatus.Loading) {
                CircularProgressIndicator(modifier = Modifier.padding(top = 16.dp))
            }
        }
    }
}
