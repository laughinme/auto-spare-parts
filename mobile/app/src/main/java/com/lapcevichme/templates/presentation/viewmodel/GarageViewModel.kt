package com.lapcevichme.templates.presentation.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.garage.VehicleModel
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
    // TODO: Add events for pagination, search, filters, adding vehicle etc.
}

@HiltViewModel
class GarageViewModel @Inject constructor(
    private val garageRepository: GarageRepository
) : ViewModel() {

    // --- СОСТОЯНИЕ СПИСКА АВТОМОБИЛЕЙ ---
    private val _vehiclesState = MutableStateFlow<Resource<CursorPage<VehicleModel>>>(Resource.Loading())
    val vehiclesState = _vehiclesState.asStateFlow()

    // Можно добавить StateFlow для курсора, если нужна поддержка пагинации в UI
    // private val _nextCursor = MutableStateFlow<String?>(null)

    init {
        Log.d(GARAGE_VIEWMODEL_TAG, "Initialized ViewModel@${hashCode()}")
        loadVehicles()
    }

    fun onEvent(event: GarageEvent) {
        when (event) {
            GarageEvent.OnRetryLoadVehicles -> loadVehicles()
            // Handle other events
        }
    }

    private fun loadVehicles(cursor: String? = null, search: String? = null, makeId: Int? = null, modelId: Int? = null) {
        // Если это новый запрос (не пагинация), показываем общий лоадер
        if (cursor == null) {
            _vehiclesState.value = Resource.Loading()
        }

        garageRepository.getGarageVehicles(
            limit = 20, // or a const val
            cursor = cursor,
            search = search,
            makeId = makeId,
            modelId = modelId
        ).onEach { result ->
            if (result is Resource.Success && cursor != null) {
                // Логика для добавления к существующему списку при пагинации
                val currentItems = (_vehiclesState.value as? Resource.Success)?.data?.items ?: emptyList()
                val newItems = result.data?.items ?: emptyList()
                val combinedItems = currentItems + newItems
                _vehiclesState.value = Resource.Success(
                    CursorPage(
                        items = combinedItems,
                        nextCursor = result.data?.nextCursor
                    )
                )
            } else {
                 // Для первого запроса или ошибки просто устанавливаем результат
                _vehiclesState.value = result
            }

            if (result is Resource.Error) {
                Log.e(GARAGE_VIEWMODEL_TAG, "Error loading vehicles: ${result.message}")
            }
        }.launchIn(viewModelScope)
    }
}
