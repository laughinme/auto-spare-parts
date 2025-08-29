package com.lapcevichme.templates.presentation.viewmodel

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapcevichme.templates.domain.model.MakeModel
import com.lapcevichme.templates.domain.model.OrganizationModel
import com.lapcevichme.templates.domain.model.ProductCreate
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.model.enums.ProductCondition
import com.lapcevichme.templates.domain.model.enums.ProductOriginality
import com.lapcevichme.templates.domain.model.enums.ProductStatus
import com.lapcevichme.templates.domain.model.enums.StockType
import com.lapcevichme.templates.domain.usecase.product.CreateProductUseCase
import com.lapcevichme.templates.domain.usecase.user.GetMyOrganizationsUseCase
import com.lapcevichme.templates.domain.usecase.vehicles.GetVehiclesMakesUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.launch
import javax.inject.Inject

const val SPARE_PART_CREATE_VIEWMODEL_TAG = "SparePartCreateViewModel"

sealed interface SparePartCreateEvent {
    data class OnTitleChanged(val title: String) : SparePartCreateEvent
    data class OnPartNumberChanged(val partNumber: String) : SparePartCreateEvent
    data class OnMakeSearchQueryChanged(val query: String) : SparePartCreateEvent
    data class OnMakeSelected(val make: MakeModel) : SparePartCreateEvent
    data class OnDescriptionChanged(val description: String) : SparePartCreateEvent
    data class OnPriceChanged(val price: String) : SparePartCreateEvent
    data class OnQuantityChanged(val quantity: String) : SparePartCreateEvent
    data class OnConditionChanged(val condition: ProductCondition) : SparePartCreateEvent
    data class OnOriginalityChanged(val originality: ProductOriginality) : SparePartCreateEvent
    data class OnStockTypeChanged(val stockType: StockType) : SparePartCreateEvent
    data class OnStatusChanged(val status: ProductStatus) : SparePartCreateEvent
    data class OnAllowCartChanged(val allowed: Boolean) : SparePartCreateEvent
    data class OnAllowChatChanged(val allowed: Boolean) : SparePartCreateEvent
    data class OnOrganizationSelected(val orgId: String) : SparePartCreateEvent
    data class OnImageSelected(val uri: Uri) : SparePartCreateEvent
    data class OnImageRemoved(val uri: Uri) : SparePartCreateEvent
    object OnCreateClick : SparePartCreateEvent
}

sealed interface UiEvent {
    data class ShowSnackbar(val message: String) : UiEvent
    object NavigateToHome : UiEvent
}

@HiltViewModel
class SparePartCreateViewModel @Inject constructor(
    @ApplicationContext private val applicationContext: Context,
    private val createProductUseCase: CreateProductUseCase,
    private val getMyOrganizationsUseCase: GetMyOrganizationsUseCase,
    private val getVehiclesMakesUseCase: GetVehiclesMakesUseCase
) : ViewModel() {

    private val _uiEvent = MutableSharedFlow<UiEvent>()
    val uiEvent = _uiEvent.asSharedFlow()

    private val _creationState = MutableStateFlow<Resource<ProductModel>?>(null)
    val creationState = _creationState.asStateFlow()

    private val _organizations = MutableStateFlow<Resource<List<OrganizationModel>>?>(null)
    val organizations = _organizations.asStateFlow()

    private val _selectedOrganizationId = MutableStateFlow<String?>(null)
    val selectedOrganizationId = _selectedOrganizationId.asStateFlow()

    // --- Поля для ProductCreate ---
    private val _title = MutableStateFlow("")
    val title = _title.asStateFlow()

    private val _partNumber = MutableStateFlow("")
    val partNumber = _partNumber.asStateFlow()

    private val _price = MutableStateFlow("")
    val price = _price.asStateFlow()

    private val _quantity = MutableStateFlow("1")
    val quantity = _quantity.asStateFlow()

    private val _condition = MutableStateFlow(ProductCondition.NEW)
    val condition = _condition.asStateFlow()

    // ИЗМЕНЕНО: Начальное значение для Originality
    private val _originality = MutableStateFlow(ProductOriginality.OEM)
    val originality = _originality.asStateFlow()

    // ИЗМЕНЕНО: Начальное значение для StockType
    private val _stockType = MutableStateFlow(StockType.STOCK)
    val stockType = _stockType.asStateFlow()

    private val _description = MutableStateFlow("")
    val description = _description.asStateFlow()

    private val _status = MutableStateFlow(ProductStatus.PUBLISHED)
    val status = _status.asStateFlow()

    private val _allowCart = MutableStateFlow(true)
    val allowCart = _allowCart.asStateFlow()

    private val _allowChat = MutableStateFlow(true)
    val allowChat = _allowChat.asStateFlow()
    // --- ---

    private val _selectedImageUris = MutableStateFlow<List<Uri>>(emptyList())
    val selectedImageUris = _selectedImageUris.asStateFlow()

    // --- Для выбора марки ---
    private val _vehiclesMakes = MutableStateFlow<List<MakeModel>?>(null)
    val vehiclesMakes = _vehiclesMakes.asStateFlow()

    private val _pickedVehiclesMake = MutableStateFlow<MakeModel?>(null)
    val pickedVehiclesMake = _pickedVehiclesMake.asStateFlow()

    private val _makeSearchQuery = MutableStateFlow("")
    val makeSearchQuery = _makeSearchQuery.asStateFlow()
    // --- ---

    init {
        Log.d(SPARE_PART_CREATE_VIEWMODEL_TAG, "Initialized ViewModel@${hashCode()}")
        loadOrganizations()

        viewModelScope.launch {
            _makeSearchQuery.debounce(300).collect { query ->
                if (_pickedVehiclesMake.value?.makeName != query) {
                    _pickedVehiclesMake.value = null
                    getVehiclesMakes(query)
                }
            }
        }
    }
    private fun getVehiclesMakes(query: String) {
        viewModelScope.launch {
            getVehiclesMakesUseCase(query = query.ifBlank { null }).collect { result ->
                if (result is Resource.Success) {
                    _vehiclesMakes.value = result.data
                } else if (result is Resource.Error) {
                    Log.e(SPARE_PART_CREATE_VIEWMODEL_TAG, "Error loading makes for query '$query': ${result.message}")
                }
            }
        }
    }


    private fun loadOrganizations() {
        viewModelScope.launch {
            _organizations.value = Resource.Loading()
            try {
                getMyOrganizationsUseCase().collect { result ->
                    _organizations.value = result
                    if (result is Resource.Success && result.data?.size == 1) {
                        _selectedOrganizationId.value = result.data.first().id
                    }
                }
            } catch (e: Exception) {
                _organizations.value = Resource.Error(e.message ?: "Failed to load organizations")
                Log.e(SPARE_PART_CREATE_VIEWMODEL_TAG, "Error loading organizations", e)
            }
        }
    }

    fun onEvent(event: SparePartCreateEvent) {
        when (event) {
            is SparePartCreateEvent.OnTitleChanged -> _title.value = event.title
            is SparePartCreateEvent.OnPartNumberChanged -> _partNumber.value = event.partNumber
            is SparePartCreateEvent.OnMakeSearchQueryChanged -> _makeSearchQuery.value = event.query
            is SparePartCreateEvent.OnMakeSelected -> {
                _pickedVehiclesMake.value = event.make
                _makeSearchQuery.value = event.make.makeName
                _vehiclesMakes.value = null
            }
            is SparePartCreateEvent.OnDescriptionChanged -> _description.value = event.description
            is SparePartCreateEvent.OnPriceChanged -> _price.value = event.price
            is SparePartCreateEvent.OnQuantityChanged -> _quantity.value = event.quantity
            is SparePartCreateEvent.OnConditionChanged -> _condition.value = event.condition
            is SparePartCreateEvent.OnOriginalityChanged -> _originality.value = event.originality
            is SparePartCreateEvent.OnStockTypeChanged -> _stockType.value = event.stockType
            is SparePartCreateEvent.OnStatusChanged -> _status.value = event.status
            is SparePartCreateEvent.OnAllowCartChanged -> _allowCart.value = event.allowed
            is SparePartCreateEvent.OnAllowChatChanged -> _allowChat.value = event.allowed
            is SparePartCreateEvent.OnOrganizationSelected -> _selectedOrganizationId.value = event.orgId
            is SparePartCreateEvent.OnImageSelected -> _selectedImageUris.value += event.uri
            is SparePartCreateEvent.OnImageRemoved -> _selectedImageUris.value -= event.uri
            is SparePartCreateEvent.OnCreateClick -> createSparePartInternal()
        }
    }

    private fun createSparePartInternal() {
        viewModelScope.launch {
            val orgId = _selectedOrganizationId.value
            val currentMake = _pickedVehiclesMake.value

            if (orgId == null) {
                _uiEvent.emit(UiEvent.ShowSnackbar("Выберите организацию."))
                return@launch
            }
            if (_title.value.isBlank()) {
                _uiEvent.emit(UiEvent.ShowSnackbar("Название не может быть пустым."))
                return@launch
            }
            if (currentMake == null) {
                _uiEvent.emit(UiEvent.ShowSnackbar("Выберите марку автомобиля."))
                return@launch
            }
            if (_partNumber.value.isBlank()) {
                _uiEvent.emit(UiEvent.ShowSnackbar("Номер детали не может быть пустым."))
                return@launch
            }
            val priceDouble = _price.value.toDoubleOrNull()
            if (priceDouble == null || priceDouble <= 0) {
                _uiEvent.emit(UiEvent.ShowSnackbar("Укажите корректную цену."))
                return@launch
            }
            val quantityInt = _quantity.value.toIntOrNull()
            if (quantityInt == null || quantityInt <= 0) {
                _uiEvent.emit(UiEvent.ShowSnackbar("Укажите корректное количество."))
                return@launch
            }

            _creationState.value = Resource.Loading()

            val photosList = mutableListOf<Pair<ByteArray, String>>()
            _selectedImageUris.value.forEach { uri ->
                try {
                    val photoBytes = applicationContext.contentResolver.openInputStream(uri)?.use { it.readBytes() }
                    val mimeType = applicationContext.contentResolver.getType(uri)
                    if (photoBytes != null && mimeType != null) {
                        photosList.add(photoBytes to mimeType)
                    }
                } catch (e: Exception) {
                    Log.e(SPARE_PART_CREATE_VIEWMODEL_TAG, "Error processing image URI: $uri", e)
                }
            }

            val productCreateRequest = ProductCreate(
                title = _title.value,
                makeId = currentMake.makeId,
                partNumber = _partNumber.value,
                price = _price.value,
                stockType = _stockType.value,
                quantity = quantityInt,
                condition = _condition.value,
                originality = _originality.value,
                description = _description.value.takeIf { it.isNotBlank() },
                status = _status.value,
                allowCart = _allowCart.value,
                allowChat = _allowChat.value
            )

            try {
                createProductUseCase(orgId, productCreateRequest, if (photosList.isNotEmpty()) photosList else null)
                    .collect { result ->
                        _creationState.value = result
                        when (result) {
                            is Resource.Success -> {
                                _uiEvent.emit(UiEvent.ShowSnackbar("Запчасть успешно создана!"))
                                _uiEvent.emit(UiEvent.NavigateToHome)
                                clearInputFields()
                            }
                            is Resource.Error -> {
                                _uiEvent.emit(UiEvent.ShowSnackbar(result.message ?: "Ошибка создания"))
                            }
                            is Resource.Loading -> { /* Статус уже обновлен */
                            }
                        }
                    }
            } catch (e: Exception) {
                val errorMsg = e.message ?: "Ошибка при вызове CreateProductUseCase"
                _creationState.value = Resource.Error(errorMsg)
                _uiEvent.emit(UiEvent.ShowSnackbar(errorMsg))
                Log.e(SPARE_PART_CREATE_VIEWMODEL_TAG, "Exception in createProductUseCase: $errorMsg", e)
            }
        }
    }

    private fun clearInputFields() {
        _title.value = ""
        _partNumber.value = ""
        _makeSearchQuery.value = ""
        _pickedVehiclesMake.value = null
        _description.value = ""
        _price.value = ""
        _quantity.value = "1"
        _condition.value = ProductCondition.NEW
        _originality.value = ProductOriginality.OEM
        _stockType.value = StockType.STOCK
        _status.value = ProductStatus.PUBLISHED
        _allowCart.value = true
        _allowChat.value = true
        _selectedImageUris.value = emptyList()
    }
}