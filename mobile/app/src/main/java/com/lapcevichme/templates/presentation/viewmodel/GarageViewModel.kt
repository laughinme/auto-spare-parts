package com.lapcevichme.templates.presentation.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.VehicleCreate
import com.lapcevichme.templates.domain.model.VehicleModel
import com.lapcevichme.templates.domain.model.VehiclePatch
import com.lapcevichme.templates.domain.repository.GarageRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import javax.inject.Inject

const val GARAGE_VIEWMODEL_TAG = "GarageViewModel"

// --- СОБЫТИЯ ЭКРАНА ---
sealed interface GarageEvent {
    object OnRetryLoadVehicles : GarageEvent
    data class OnAddVehicle(val vehicleCreate: VehicleCreate) : GarageEvent // Retained for potential direct use
    data class OnLoadVehicleDetails(val vehicleId: String) : GarageEvent
    data class OnUpdateVehicle(val vehicleId: String, val vehiclePatch: VehiclePatch) : GarageEvent
    data class OnDeleteVehicle(val vehicleId: String) : GarageEvent

    // Events for Add Vehicle Form
    object SubmitAddVehicleForm : GarageEvent
    object ResetAddVehicleForm : GarageEvent
}

// --- СТАТУС ОПЕРАЦИЙ ---
sealed interface VehicleOperationStatus {
    object Idle : VehicleOperationStatus // This Idle is for operation status, not Resource state.
    object Loading : VehicleOperationStatus
    data class Success(val message: String? = null) : VehicleOperationStatus
    data class Error(val message: String) : VehicleOperationStatus
}

@HiltViewModel
class GarageViewModel @Inject constructor(
    private val garageRepository: GarageRepository
) : ViewModel() {

    // --- СОСТОЯНИЕ СПИСКА АВТОМОБИЛЕЙ ---
    private val _vehiclesState = MutableStateFlow<Resource<CursorPage<VehicleModel>>>(Resource.Loading())
    val vehiclesState = _vehiclesState.asStateFlow()

    // --- СОСТОЯНИЕ ВЫБРАННОГО АВТОМОБИЛЯ (для деталей/редактирования) ---
    private val _selectedVehicleState = MutableStateFlow<Resource<VehicleModel>?>(null)
    val selectedVehicleState = _selectedVehicleState.asStateFlow()

    // --- СОСТОЯНИЕ ОПЕРАЦИЙ (ADD/UPDATE/DELETE) ---
    private val _vehicleOperationStatus = MutableStateFlow<VehicleOperationStatus>(VehicleOperationStatus.Idle)
    val vehicleOperationStatus = _vehicleOperationStatus.asStateFlow()

    // --- ADD VEHICLE FORM STATE ---
    // These will now store IDs or simple strings, assuming UI handles fetching/displaying actual MakeModel etc.
    private val _selectedMakeId = MutableStateFlow<Int?>(null)
    val selectedMakeId = _selectedMakeId.asStateFlow()

    private val _selectedModelId = MutableStateFlow<Int?>(null)
    val selectedModelId = _selectedModelId.asStateFlow()

    private val _selectedYear = MutableStateFlow<String?>(null) // String to include "Неважно"
    val selectedYear = _selectedYear.asStateFlow()

    private val _selectedVehicleTypeId = MutableStateFlow<Int?>(null)
    val selectedVehicleTypeId = _selectedVehicleTypeId.asStateFlow()

    private val _vinInput = MutableStateFlow("")
    val vinInput = _vinInput.asStateFlow()

    private val _commentInput = MutableStateFlow("")
    val commentInput = _commentInput.asStateFlow()

    init {
        Log.d(GARAGE_VIEWMODEL_TAG, "Initialized ViewModel@${hashCode()}")
        loadVehicles() // Load garage list
    }

    fun onEvent(event: GarageEvent) {
        when (event) {
            GarageEvent.OnRetryLoadVehicles -> loadVehicles()
            is GarageEvent.OnAddVehicle -> addVehicle(event.vehicleCreate)
            is GarageEvent.OnLoadVehicleDetails -> loadVehicleDetails(event.vehicleId)
            is GarageEvent.OnUpdateVehicle -> updateVehicle(event.vehicleId, event.vehiclePatch)
            is GarageEvent.OnDeleteVehicle -> deleteVehicle(event.vehicleId)
            GarageEvent.SubmitAddVehicleForm -> handleSubmitAddVehicleForm()
            GarageEvent.ResetAddVehicleForm -> resetAddVehicleFormFields()
        }
    }

    // --- Garage List Management ---
    private fun loadVehicles(cursor: String? = null, search: String? = null, makeId: Int? = null, modelId: Int? = null) {
        if (cursor == null) {
            _vehiclesState.value = Resource.Loading()
        }
        garageRepository.getGarageVehicles(20, cursor, search, makeId, modelId)
            .onEach { result ->
                if (result is Resource.Success && cursor != null) {
                    val currentItems = (_vehiclesState.value as? Resource.Success)?.data?.items ?: emptyList()
                    val newItems = result.data?.items ?: emptyList()
                    _vehiclesState.value = Resource.Success(
                        CursorPage(items = currentItems + newItems, nextCursor = result.data?.nextCursor)
                    )
                } else {
                    _vehiclesState.value = result
                }
                if (result is Resource.Error) Log.e(GARAGE_VIEWMODEL_TAG, "Error loading vehicles: ${result.message}")
            }.launchIn(viewModelScope)
    }

    private fun addVehicle(vehicleCreate: VehicleCreate) {
        _vehicleOperationStatus.value = VehicleOperationStatus.Loading
        garageRepository.addVehicleToGarage(vehicleCreate)
            .onEach { result ->
                _vehicleOperationStatus.value = when (result) {
                    is Resource.Loading -> VehicleOperationStatus.Loading
                    is Resource.Success -> {
                        loadVehicles()
                        resetAddVehicleFormFields() // Reset form on success
                        VehicleOperationStatus.Success("Vehicle added successfully")
                    }
                    is Resource.Error -> VehicleOperationStatus.Error(result.message ?: "Failed to add vehicle")
                    // Removed Resource.Idle case
                }
            }.launchIn(viewModelScope)
    }

    private fun loadVehicleDetails(vehicleId: String) {
        garageRepository.getVehicle(vehicleId)
            .onEach { _selectedVehicleState.value = it } // This it is Resource<VehicleModel> from repo
            .launchIn(viewModelScope)
    }

    private fun updateVehicle(vehicleId: String, vehiclePatch: VehiclePatch) {
        _vehicleOperationStatus.value = VehicleOperationStatus.Loading
        garageRepository.updateVehicle(vehicleId, vehiclePatch)
            .onEach { result ->
                _vehicleOperationStatus.value = when (result) {
                    is Resource.Loading -> VehicleOperationStatus.Loading
                    is Resource.Success -> {
                        loadVehicles()
                        result.data?.let { _selectedVehicleState.value = Resource.Success(it) }
                        VehicleOperationStatus.Success("Vehicle updated successfully")
                    }
                    is Resource.Error -> VehicleOperationStatus.Error(result.message ?: "Failed to update vehicle")
                    // Removed Resource.Idle case
                }
            }.launchIn(viewModelScope)
    }

    private fun deleteVehicle(vehicleId: String) {
        _vehicleOperationStatus.value = VehicleOperationStatus.Loading
        garageRepository.deleteVehicle(vehicleId)
            .onEach { result ->
                _vehicleOperationStatus.value = when (result) {
                    is Resource.Loading -> VehicleOperationStatus.Loading
                    is Resource.Success -> {
                        loadVehicles()
                        if ((_selectedVehicleState.value as? Resource.Success)?.data?.id == vehicleId) {
                            _selectedVehicleState.value = null
                        }
                        VehicleOperationStatus.Success("Vehicle deleted successfully")
                    }
                    is Resource.Error -> VehicleOperationStatus.Error(result.message ?: "Failed to delete vehicle")
                    // Removed Resource.Idle case
                }
            }.launchIn(viewModelScope)
    }

    // --- Add Vehicle Form Specific Functions ---
    fun onMakeIdChanged(id: Int?) { _selectedMakeId.value = id }
    fun onModelIdChanged(id: Int?) { _selectedModelId.value = id }
    fun onYearChanged(year: String?) { _selectedYear.value = year }
    fun onVehicleTypeIdChanged(id: Int?) { _selectedVehicleTypeId.value = id }
    fun onVinChanged(vin: String) { _vinInput.value = vin }
    fun onCommentChanged(comment: String) { _commentInput.value = comment }

    private fun handleSubmitAddVehicleForm() {
        val makeId = _selectedMakeId.value
        val modelId = _selectedModelId.value
        val yearString = _selectedYear.value
        val vehicleTypeId = _selectedVehicleTypeId.value
        val vin = _vinInput.value.trim()
        val comment = _commentInput.value.trim()

        if (makeId == null) {
            _vehicleOperationStatus.value = VehicleOperationStatus.Error("Please select a make")
            return
        }
        if (modelId == null) {
            _vehicleOperationStatus.value = VehicleOperationStatus.Error("Please select a model")
            return
        }

        // --- MODIFIED YEAR VALIDATION ---
        if (yearString.isNullOrEmpty() || yearString == "Неважно") {
            _vehicleOperationStatus.value = VehicleOperationStatus.Error("Please select a valid year")
            return
        }
        val yearInt: Int
        try {
            yearInt = yearString.toInt()
        } catch (e: NumberFormatException) {
            _vehicleOperationStatus.value = VehicleOperationStatus.Error("Invalid year format")
            return
        }
        // --- END OF MODIFIED YEAR VALIDATION ---

        if (vehicleTypeId == null) {
            _vehicleOperationStatus.value = VehicleOperationStatus.Error("Please select a vehicle type")
            return
        }

        val vehicleCreate = VehicleCreate(
            makeId = makeId,
            modelId = modelId,
            year = yearInt, // Now yearInt is guaranteed to be a non-null Int
            vehicleTypeId = vehicleTypeId,
            vin = vin.ifEmpty { null },
            comment = comment.ifEmpty { null }
        )
        addVehicle(vehicleCreate)
    }

    private fun resetAddVehicleFormFields() {
        _selectedMakeId.value = null
        _selectedModelId.value = null
        _selectedYear.value = null
        _selectedVehicleTypeId.value = null
        _vinInput.value = ""
        _commentInput.value = ""
        // No lists to reset here anymore
    }

    fun clearOperationStatus() {
        _vehicleOperationStatus.value = VehicleOperationStatus.Idle
    }
}
