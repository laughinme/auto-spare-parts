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
    data class OnDeleteVehicle(val vehicleId: String) : GarageEvent

    // Events for Add/Edit Vehicle Form
    object SubmitAddVehicleForm : GarageEvent
    data class SubmitEditVehicleForm(val vehicleId: String) : GarageEvent
    data class LoadVehicleForEditing(val vehicleId: String) : GarageEvent
    object ResetForm : GarageEvent
}

// --- СТАТУС ОПЕРАЦИЙ ---
sealed interface VehicleOperationStatus {
    object Idle : VehicleOperationStatus
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

    // --- СОСТОЯНИЕ ФОРМЫ ADD/EDIT ---
    private val _selectedMakeId = MutableStateFlow<Int?>(null)
    val selectedMakeId = _selectedMakeId.asStateFlow()

    private val _selectedModelId = MutableStateFlow<Int?>(null)
    val selectedModelId = _selectedModelId.asStateFlow()

    private val _selectedYear = MutableStateFlow<String?>(null)
    val selectedYear = _selectedYear.asStateFlow()

    private val _vinInput = MutableStateFlow("")
    val vinInput = _vinInput.asStateFlow()

    private val _commentInput = MutableStateFlow("")
    val commentInput = _commentInput.asStateFlow()

    init {
        Log.d(GARAGE_VIEWMODEL_TAG, "Initialized ViewModel@${hashCode()}")
        loadVehicles()
    }

    fun onEvent(event: GarageEvent) {
        when (event) {
            GarageEvent.OnRetryLoadVehicles -> loadVehicles()
            is GarageEvent.OnDeleteVehicle -> deleteVehicle(event.vehicleId)
            is GarageEvent.LoadVehicleForEditing -> loadVehicleForEditing(event.vehicleId)
            GarageEvent.SubmitAddVehicleForm -> handleSubmitAddVehicleForm()
            is GarageEvent.SubmitEditVehicleForm -> handleSubmitEditVehicleForm(event.vehicleId)
            GarageEvent.ResetForm -> resetFormFields()
        }
    }

    // --- Управление списком в гараже ---
    private fun loadVehicles(cursor: String? = null) {
        if (cursor == null) {
            _vehiclesState.value = Resource.Loading()
        }
        garageRepository.getGarageVehicles(limit = 20, cursor = cursor)
            .onEach { result ->
                _vehiclesState.value = result
                if (result is Resource.Error) Log.e(GARAGE_VIEWMODEL_TAG, "Error loading vehicles: ${result.message}")
            }.launchIn(viewModelScope)
    }

    private fun deleteVehicle(vehicleId: String) {
        garageRepository.deleteVehicle(vehicleId)
            .onEach { result ->
                if (result is Resource.Success) {
                    loadVehicles() // Reload the list on success
                }
            }.launchIn(viewModelScope)
    }

    // --- Логика для формы добавления/редактирования ---
    private fun loadVehicleForEditing(vehicleId: String) {
        resetFormFields() // Очищаем поля перед загрузкой новых данных
        garageRepository.getVehicle(vehicleId)
            .onEach { result ->
                _selectedVehicleState.value = result
                if (result is Resource.Success) {
                    result.data?.let { vehicle ->
                        // Заполняем поля формы данными из загруженной машины
                        _selectedMakeId.value = vehicle.make.makeId
                        _selectedModelId.value = vehicle.model.modelId
                        _selectedYear.value = vehicle.year.toString()
                        _vinInput.value = vehicle.vin ?: ""
                        _commentInput.value = vehicle.comment ?: ""
                    }
                }
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
                        resetFormFields()
                        VehicleOperationStatus.Success("Автомобиль добавлен")
                    }
                    is Resource.Error -> VehicleOperationStatus.Error(result.message ?: "Ошибка добавления")
                }
            }.launchIn(viewModelScope)
    }

    private fun updateVehicle(vehicleId: String, vehiclePatch: VehiclePatch) {
        _vehicleOperationStatus.value = VehicleOperationStatus.Loading
        garageRepository.updateVehicle(vehicleId, vehiclePatch)
            .onEach { result ->
                _vehicleOperationStatus.value = when (result) {
                    is Resource.Loading -> VehicleOperationStatus.Loading
                    is Resource.Success -> {
                        loadVehicles()
                        VehicleOperationStatus.Success("Изменения сохранены")
                    }
                    is Resource.Error -> VehicleOperationStatus.Error(result.message ?: "Ошибка обновления")
                }
            }.launchIn(viewModelScope)
    }


    // --- Обработчики полей и кнопок ---
    fun onMakeIdChanged(id: Int?) { _selectedMakeId.value = id }
    fun onModelIdChanged(id: Int?) { _selectedModelId.value = id }
    fun onYearChanged(year: String?) { _selectedYear.value = year }
    fun onVinChanged(vin: String) { _vinInput.value = vin }
    fun onCommentChanged(comment: String) { _commentInput.value = comment }

    private fun handleSubmitAddVehicleForm() {
        val (vehicleCreate, error) = createVehicleFromState()
        if (error != null) {
            _vehicleOperationStatus.value = VehicleOperationStatus.Error(error)
            return
        }
        addVehicle(vehicleCreate!!)
    }

    private fun handleSubmitEditVehicleForm(vehicleId: String) {
        val (vehiclePatch, error) = createVehiclePatchFromState()
        if (error != null) {
            _vehicleOperationStatus.value = VehicleOperationStatus.Error(error)
            return
        }
        updateVehicle(vehicleId, vehiclePatch!!)
    }

    // --- Вспомогательные функции ---
    private fun createVehicleFromState(): Pair<VehicleCreate?, String?> {
        val makeId = _selectedMakeId.value
        val modelId = _selectedModelId.value
        val yearString = _selectedYear.value

        if (makeId == null) return Pair(null, "Выберите марку")
        if (modelId == null) return Pair(null, "Выберите модель")
        if (yearString.isNullOrEmpty() || yearString == "Неважно") return Pair(null, "Выберите год")

        val yearInt = yearString.toIntOrNull() ?: return Pair(null, "Некорректный год")

        return Pair(
            VehicleCreate(
                makeId = makeId,
                modelId = modelId,
                year = yearInt,
                vehicleTypeId = null, // Not used
                vin = _vinInput.value.trim().ifEmpty { null },
                comment = _commentInput.value.trim().ifEmpty { null }
            ), null
        )
    }

    private fun createVehiclePatchFromState(): Pair<VehiclePatch?, String?> {
        val (vehicleCreate, error) = createVehicleFromState()
        if (error != null) {
            return Pair(null, error)
        }
        return Pair(
            VehiclePatch(
                makeId = vehicleCreate!!.makeId,
                modelId = vehicleCreate.modelId,
                year = vehicleCreate.year,
                vehicleTypeId = vehicleCreate.vehicleTypeId,
                vin = vehicleCreate.vin,
                comment = vehicleCreate.comment
            ), null
        )
    }

    private fun resetFormFields() {
        _selectedMakeId.value = null
        _selectedModelId.value = null
        _selectedYear.value = null
        _vinInput.value = ""
        _commentInput.value = ""
        _selectedVehicleState.value = null // Сбрасываем и загруженную машину
    }

    fun clearOperationStatus() {
        _vehicleOperationStatus.value = VehicleOperationStatus.Idle
    }
}
