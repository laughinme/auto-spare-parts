package com.lapcevichme.templates.presentation.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapcevichme.templates.domain.model.OrganizationModel
import com.lapcevichme.templates.domain.model.enums.ProductCondition
import com.lapcevichme.templates.domain.model.ProductCreate
import com.lapcevichme.templates.domain.model.enums.ProductStatus
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.usecase.user.GetMyOrganizationsUseCase
import com.lapcevichme.templates.domain.usecase.product.CreateProductUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

const val SPARE_PART_CREATE_VIEWMODEL_TAG = "SparePartCreateViewModel"

// --- СОБЫТИЯ ЭКРАНА ---
sealed interface SparePartCreateEvent {
    data class OnPartNumberChanged(val partNumber: String) : SparePartCreateEvent
    data class OnBrandChanged(val brand: String) : SparePartCreateEvent
    data class OnDescriptionChanged(val description: String) : SparePartCreateEvent
    data class OnPriceChanged(val price: String) : SparePartCreateEvent
    data class OnConditionChanged(val condition: String) : SparePartCreateEvent
    data class OnStatusChanged(val status: String) : SparePartCreateEvent
    data class OnOrganizationSelected(val orgId: String) : SparePartCreateEvent
    object OnCreateClick : SparePartCreateEvent
}

// --- СОБЫТИЯ UI (ДЛЯ ОДНОРАЗОВЫХ ДЕЙСТВИЙ) ---
sealed interface UiEvent {
    data class ShowSnackbar(val message: String) : UiEvent
    object NavigateToHome : UiEvent
}

@HiltViewModel
class SparePartCreateViewModel @Inject constructor(
    private val createProductUseCase: CreateProductUseCase,
    private val getMyOrganizationsUseCase: GetMyOrganizationsUseCase
) : ViewModel() {

    private val _uiEvent = MutableSharedFlow<UiEvent>()
    val uiEvent = _uiEvent.asSharedFlow()

    private val _creationState = MutableStateFlow<Resource<Unit>?>(null)
    val creationState = _creationState.asStateFlow()

    private val _organizations = MutableStateFlow<Resource<List<OrganizationModel>>?>(null)
    val organizations = _organizations.asStateFlow()

    private val _selectedOrganizationId = MutableStateFlow<String?>(null)
    val selectedOrganizationId = _selectedOrganizationId.asStateFlow()

    private val _partNumber = MutableStateFlow("")
    val partNumber = _partNumber.asStateFlow()

    private val _brand = MutableStateFlow("")
    val brand = _brand.asStateFlow()

    private val _description = MutableStateFlow("")
    val description = _description.asStateFlow()

    private val _price = MutableStateFlow<String?>(null)
    val price = _price.asStateFlow()

    private val _condition = MutableStateFlow<ProductCondition?>(null)
    val condition = _condition.asStateFlow()

    private val _status = MutableStateFlow(ProductStatus.DRAFT)
    val status = _status.asStateFlow()

    init {
        Log.d(SPARE_PART_CREATE_VIEWMODEL_TAG, "Initialized ViewModel@${hashCode()}")
        loadOrganizations()
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
            is SparePartCreateEvent.OnPartNumberChanged -> _partNumber.value = event.partNumber
            is SparePartCreateEvent.OnBrandChanged -> _brand.value = event.brand
            is SparePartCreateEvent.OnDescriptionChanged -> _description.value = event.description
            is SparePartCreateEvent.OnPriceChanged -> _price.value = event.price
            is SparePartCreateEvent.OnConditionChanged -> {
                // ----- ИЗМЕНЕНИЕ ЗДЕСЬ -----
                // Добавлена логика для преобразования русской строки из UI в нужный enum.
                _condition.value = when (event.condition.lowercase()) {
                    "новый" -> ProductCondition.NEW
                    "б/у" -> ProductCondition.USED
                    else -> null
                }
            }
            is SparePartCreateEvent.OnStatusChanged -> {
                val foundStatus = ProductStatus.entries.find {
                    it.name.equals(event.status, ignoreCase = true)
                } ?: when (event.status.lowercase()) {
                    "черновик" -> ProductStatus.DRAFT
                    "опубликован" -> ProductStatus.PUBLISHED
                    "архивирован" -> ProductStatus.ARCHIVED
                    else -> null
                }
                if (foundStatus != null) {
                    _status.value = foundStatus
                }
            }
            is SparePartCreateEvent.OnOrganizationSelected -> {
                _selectedOrganizationId.value = event.orgId
            }
            SparePartCreateEvent.OnCreateClick -> createSparePartInternal()
        }
    }

    private fun createSparePartInternal() {
        viewModelScope.launch {
            val orgId = _selectedOrganizationId.value
            val currentPartNumber = _partNumber.value
            val currentBrand = _brand.value
            val currentPriceString = _price.value
            val currentCondition = _condition.value
            val currentStatus = _status.value

            var isValid = true
            var errorMessage = ""

            if (orgId == null) {
                isValid = false
                errorMessage = "Выберите организацию."
            } else if (currentBrand.isBlank()) {
                isValid = false
                errorMessage = "Бренд не может быть пустым."
            } else if (currentPartNumber.isBlank()) {
                isValid = false
                errorMessage = "Номер запчасти не может быть пустым."
            } else if (currentPriceString.isNullOrBlank() || currentPriceString.toDoubleOrNull() == null || currentPriceString.toDoubleOrNull()!! <= 0) {
                isValid = false
                errorMessage = "Укажите корректную цену."
            } else if (currentCondition == null) {
                isValid = false
                errorMessage = "Выберите состояние товара."
            }

            if (!isValid) {
                _uiEvent.emit(UiEvent.ShowSnackbar(errorMessage))
                _creationState.value = Resource.Error(errorMessage)
                return@launch
            }

            _creationState.value = Resource.Loading()

            try {
                val productCreateRequest = ProductCreate(
                    brand = currentBrand,
                    partNumber = currentPartNumber,
                    price = currentPriceString!!.toDouble(),
                    condition = currentCondition!!,
                    description = _description.value.takeIf { it.isNotBlank() },
                    status = currentStatus
                )

                createProductUseCase(orgId!!, productCreateRequest).collect { result ->
                    when (result) {
                        is Resource.Success -> {
                            _creationState.value = Resource.Success(Unit)
                            _uiEvent.emit(UiEvent.ShowSnackbar("Запчасть успешно создана! ID: ${result.data?.id ?: ""}"))
                            _uiEvent.emit(UiEvent.NavigateToHome)
                            clearInputFields()
                            Log.d(SPARE_PART_CREATE_VIEWMODEL_TAG, "Product created successfully.")
                        }
                        is Resource.Error -> {
                            val errorMsg = result.message ?: "Неизвестная ошибка при создании"
                            _creationState.value = Resource.Error(errorMsg)
                            _uiEvent.emit(UiEvent.ShowSnackbar(errorMsg))
                            Log.e(SPARE_PART_CREATE_VIEWMODEL_TAG, "Error creating product: $errorMsg")
                        }
                        is Resource.Loading -> {
                            _creationState.value = Resource.Loading()
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
        _partNumber.value = ""
        _brand.value = ""
        _description.value = ""
        _price.value = null
        _condition.value = null
        _status.value = ProductStatus.DRAFT
        _selectedOrganizationId.value = null
    }
}
