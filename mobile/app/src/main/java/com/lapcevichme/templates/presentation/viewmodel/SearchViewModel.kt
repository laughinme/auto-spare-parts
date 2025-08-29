package com.lapcevichme.templates.presentation.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapcevichme.templates.domain.model.CursorPage
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.MakeModel
import com.lapcevichme.templates.domain.model.VehicleModel
import com.lapcevichme.templates.domain.model.VehicleModelInfo
import com.lapcevichme.templates.domain.usecase.product.ProductSearchUseCase
import com.lapcevichme.templates.domain.usecase.vehicles.GetVehiclesMakesUseCase
import com.lapcevichme.templates.domain.usecase.vehicles.GetVehiclesModelsUseCase
import com.lapcevichme.templates.domain.usecase.vehicles.GetVehiclesYearsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SearchViewModel @Inject constructor(
    private val productSearchUseCase: ProductSearchUseCase,
    private val getVehiclesModelsUseCase: GetVehiclesModelsUseCase,
    private val getVehiclesMakesUseCase: GetVehiclesMakesUseCase,
    private val getVehiclesYearsUseCase: GetVehiclesYearsUseCase
) : ViewModel() {

    // --- Состояния для результатов поиска и пагинации ---
    private val _productFeed = MutableStateFlow<CursorPage<ProductModel>?>(null)
    val productFeed = _productFeed.asStateFlow()

    private val _loadingStatus = MutableStateFlow(false)
    val loadingStatus = _loadingStatus.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage = _errorMessage.asStateFlow()

    private val _lastCursor = MutableStateFlow<String?>(null)


    // --- Состояния для фильтров и полей ввода ---
    private val _searchQuery = MutableStateFlow<String?>(null)
    val searchQuery = _searchQuery.asStateFlow()

    private val _vehiclesMakes = MutableStateFlow<List<MakeModel>?>(null)
    val vehiclesMakes = _vehiclesMakes.asStateFlow()
    private val _pickedVehiclesMake = MutableStateFlow<MakeModel?>(null)
    val pickedVehiclesMake = _pickedVehiclesMake.asStateFlow()
    private val _makeSearchQuery = MutableStateFlow("")
    val makeSearchQuery = _makeSearchQuery.asStateFlow()

    private val _vehiclesModels = MutableStateFlow<List<VehicleModelInfo>?>(null)
    val vehiclesModels = _vehiclesModels.asStateFlow()
    private val _pickedVehiclesModel = MutableStateFlow<VehicleModelInfo?>(null)
    val pickedVehiclesModel = _pickedVehiclesModel.asStateFlow()
    private val _modelSearchQuery = MutableStateFlow("")
    val modelSearchQuery = _modelSearchQuery.asStateFlow()

    private val _vehiclesYears = MutableStateFlow<List<Int>?>(null)
    val vehiclesYears = _vehiclesYears.asStateFlow()
    private val _pickedVehiclesYear = MutableStateFlow<Int?>(null)
    val pickedVehiclesYear = _pickedVehiclesYear.asStateFlow()

    private val _priceMin = MutableStateFlow<Double?>(null)
    val priceMin = _priceMin.asStateFlow()
    private val _priceMax = MutableStateFlow<Double?>(null)
    val priceMax = _priceMax.asStateFlow()

    private val _condition = MutableStateFlow<String?>(null)
    val condition = _condition.asStateFlow()

    companion object {
        private const val TAG = "SearchViewModel"
    }

    init {
        // Debounced search for makes
        viewModelScope.launch {
            _makeSearchQuery.debounce(300).collect { query ->
                Log.d(TAG, "Make search query: $query")
                getVehiclesMakes(query)
            }
        }
        // Debounced search for models
        viewModelScope.launch {
            _modelSearchQuery.debounce(300).collect { query ->
                _pickedVehiclesMake.value?.let { make ->
                    Log.d(TAG, "Model search query: $query for make: ${make.makeName}")
                    getVehiclesModels(make.makeId, query)
                }
            }
        }
    }

    // --- НОВАЯ ФУНКЦИЯ ДЛЯ ИНИЦИАЛИЗАЦИИ ЭКРАНА РЕДАКТИРОВАНИЯ ---
    fun initializeWithVehicle(vehicle: VehicleModel) {
        // Устанавливаем выбранные значения
        _pickedVehiclesMake.value = vehicle.make
        _pickedVehiclesModel.value = vehicle.model
        _pickedVehiclesYear.value = vehicle.year

        // Устанавливаем текст в полях для поиска/отображения
        _makeSearchQuery.value = vehicle.make.makeName
        _modelSearchQuery.value = vehicle.model.modelName

        // Сразу подгружаем списки моделей и годов, чтобы они были доступны
        getVehiclesModels(vehicle.make.makeId, "")
        getVehiclesYears(vehicle.model.modelId)
    }

    // --- Основная функция поиска ---
    fun searchProducts(cursor: String? = null) {
        viewModelScope.launch {
            _loadingStatus.value = true
            val brand = _pickedVehiclesMake.value?.makeName
            val query = _searchQuery.value ?: _pickedVehiclesModel.value?.modelName
            val condition = _condition.value
            val priceMin = _priceMin.value
            val priceMax = _priceMax.value

            Log.d(TAG, "Searching products with params: brand=$brand, query=$query, condition=$condition, priceMin=$priceMin, priceMax=$priceMax, cursor=$cursor")

            productSearchUseCase(
                brand = brand,
                query = query,
                condition = condition,
                priceMin = priceMin,
                priceMax = priceMax,
                cursor = cursor
            ).collect { result ->
                when (result) {
                    is Resource.Success -> {
                        Log.d(TAG, "Search success. Data: ${result.data}")
                        result.data?.let { newPage ->
                            if (cursor != null) { // Добавляем к существующему списку
                                _productFeed.update { currentFeed ->
                                    val oldItems = currentFeed?.items ?: emptyList()
                                    newPage.copy(items = oldItems + newPage.items)
                                }
                            } else { // Это первая страница
                                _productFeed.value = newPage
                            }
                            _lastCursor.value = newPage.nextCursor
                        }
                        _errorMessage.value = null
                    }
                    is Resource.Error -> {
                        Log.e(TAG, "Search error: ${result.message}")
                        _errorMessage.value = result.message
                    }
                    is Resource.Loading -> { Log.d(TAG, "Search loading...")/* Already handled by _loadingStatus */ }
                }
                _loadingStatus.value = false
            }
        }
    }

    fun addNextPage() {
        if (_loadingStatus.value || _lastCursor.value == null) return
        searchProducts(cursor = _lastCursor.value)
    }

    // --- Обработчики UI ---
    fun onQuickSearchClicked() {
        _searchQuery.value = null // Очищаем текстовый поиск, если используется быстрый
        searchProducts(cursor = null)
    }

    fun onSearchClicked() {
        // Очищаем фильтры быстрого поиска, если используется текстовый
        _pickedVehiclesMake.value = null
        _pickedVehiclesModel.value = null
        _pickedVehiclesYear.value = null
        _priceMin.value = null
        _priceMax.value = null
        searchProducts(cursor = null)
    }

    // --- Функции для полей фильтра ---
    fun onSearchQueryChanged(query: String) { _searchQuery.value = query }
    fun onMakeSearchQueryChanged(query: String) {
        _makeSearchQuery.value = query
        if (_pickedVehiclesMake.value?.makeName != query) { _pickedVehiclesMake.value = null }
    }
    fun onModelSearchQueryChanged(query: String) {
        _modelSearchQuery.value = query
        if (_pickedVehiclesModel.value?.modelName != query) { _pickedVehiclesModel.value = null }
    }
    fun onBrandSelected(make: MakeModel) {
        _pickedVehiclesMake.value = make
        _makeSearchQuery.value = make.makeName
        _vehiclesMakes.value = null
        _pickedVehiclesModel.value = null
        _vehiclesModels.value = null
        _modelSearchQuery.value = ""
        _pickedVehiclesYear.value = null
        _vehiclesYears.value = null
        getVehiclesModels(make.makeId, "")
    }
    fun onModelSelected(model: VehicleModelInfo) {
        _pickedVehiclesModel.value = model
        _modelSearchQuery.value = model.modelName
        _vehiclesModels.value = null
        _pickedVehiclesYear.value = null
        _vehiclesYears.value = null
        getVehiclesYears(model.modelId)
    }
    fun onYearSelected(year: Int?) { _pickedVehiclesYear.value = year }
    fun onPriceFromChanged(price: String) { _priceMin.value = price.toDoubleOrNull() }
    fun onPriceToChanged(price: String) { _priceMax.value = price.toDoubleOrNull() }

    // --- Загрузка данных для фильтров ---
    private fun getVehiclesMakes(query: String) {
        viewModelScope.launch {
            getVehiclesMakesUseCase(query = query.ifBlank { null }).collect { result ->
                if (result is Resource.Success) _vehiclesMakes.value = result.data
            }
        }
    }
    private fun getVehiclesModels(makeId: Int, query: String) {
        viewModelScope.launch {
            getVehiclesModelsUseCase(makeId = makeId, query = query.ifBlank { null }).collect { result ->
                if (result is Resource.Success) _vehiclesModels.value = result.data
            }
        }
    }
    private fun getVehiclesYears(modelId: Int) {
        viewModelScope.launch {
            getVehiclesYearsUseCase(modelId).collect { result ->
                if (result is Resource.Success) _vehiclesYears.value = result.data
            }
        }
    }
}
