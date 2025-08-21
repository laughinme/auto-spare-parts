package com.lapcevichme.templates.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lapcevichme.templates.domain.model.ProductCondition
import com.lapcevichme.templates.domain.model.ProductCreate
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.ProductStatus
import com.lapcevichme.templates.domain.model.Resource
import com.lapcevichme.templates.domain.usecase.CreateProductUseCase
import com.lapcevichme.templates.domain.usecase.GetOrgIdUseCase
import com.lapcevichme.templates.domain.usecase.SparePartCreateUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class UiEvent {
    data class ShowSnackbar(val message: String) : UiEvent()
    // Можно добавить другие события, например, навигацию
}

@HiltViewModel
class SparePartCreateViewModel @Inject constructor(
    private val getOrgIdUseCase: GetOrgIdUseCase,
    private val createProductUseCase: CreateProductUseCase
) : ViewModel() {

    private val _uiEvent = MutableSharedFlow<UiEvent>()
    val uiEvent = _uiEvent.asSharedFlow()

    //Марка (бренд) детали
    private val _brand = MutableStateFlow<String?>(null)
    val brand = _brand.asStateFlow()

    fun onBrandChanged(brand: String) {
        _brand.value = brand
    }

    //Номер детали
    private val _partNumber = MutableStateFlow<String?>(null)
    val partNumber = _partNumber.asStateFlow()

    fun onPartNumberChanged(partNumber: String) {
        _partNumber.value = partNumber
    }

    //Состояние детали
    private val _selectedCondition = MutableStateFlow<ProductCondition?>(null)
    val selectedCondition = _selectedCondition.asStateFlow()

    fun onConditionChanged(condition: String) {
        _selectedCondition.value = when(condition) {
            "новый" -> ProductCondition.NEW
            "б/у" -> ProductCondition.USED
            else -> null
        }
    }

    //цена детали
    private val _price = MutableStateFlow<String?>(null)
    val price = _price.asStateFlow()

    fun onPriceChanged(price: String) {
        _price.value = price
    }

    //Описание для детали
    private val _description = MutableStateFlow<String?>(null)
    val description = _description.asStateFlow()

    fun onDescriptionChanged(description: String) {
        _description.value = description
    }

    //Статус детали
    private val _status = MutableStateFlow<ProductStatus?>(ProductStatus.DRAFT) // Default to "draft"
    val status = _status.asStateFlow()

    fun onStatusChanged(status: String) {
        _status.value = when(status) {
            "черновик" -> ProductStatus.DRAFT
            "опубликован" -> ProductStatus.PUBLISHED
            "архивирован" -> ProductStatus.ARCHIVED
            else -> null
        }
    }

    fun onCancelClicked(){
        //TODO Сделать закрытие экрана и переход на HomeTabScreen
    }

    fun onCreateClicked() {
        when(null) {
            _brand.value -> {
                _uiEvent.tryEmit(UiEvent.ShowSnackbar("Введите марку детали"))
                return
            }

            _partNumber.value -> {
                _uiEvent.tryEmit(UiEvent.ShowSnackbar("Введите номер детали"))
                return
            }

            _selectedCondition.value -> {
                _uiEvent.tryEmit(UiEvent.ShowSnackbar("Выберите состояние детали"))
                return
            }

            _price.value -> {
                _uiEvent.tryEmit(UiEvent.ShowSnackbar("Введите цену детали"))
                return
            }
            else -> {
                viewModelScope.launch {
                    val orgId = getOrgIdUseCase() ?: run {
                        _uiEvent.emit(UiEvent.ShowSnackbar("Не удалось получить ID организации"))
                        return@launch
                    }

                    createProductUseCase(orgId = orgId, product = ProductCreate(
                        brand = _brand.value!!,
                        partNumber = _partNumber.value!!,
                        condition = _selectedCondition.value!!,
                        price = _price.value!!.toDouble(),
                        description = _description.value,
                        status = _status.value!!
                    )).collect { result ->
                        when (result) {
                            is Resource.Success -> {
                                // Успешное создание детали
                                _uiEvent.emit(UiEvent.ShowSnackbar("Деталь успешно создана!"))

                                // Очистка полей после создания детали
                                _brand.value = null
                                _partNumber.value = null
                                _selectedCondition.value = null
                                _price.value = null
                                _description.value = null
                                _status.value = ProductStatus.DRAFT
                            }
                            is Resource.Error -> {
                                // Ошибка при создании детали
                                _uiEvent.emit(UiEvent.ShowSnackbar("Ошибка при создании детали: ${result.message}"))
                            }

                            is Resource.Loading -> {
                                // Загрузка в процессе, можно показать индикатор загрузки
                                // Но в данном случае мы просто продолжаем выполнение
                            }
                        }
                    }
                }
            }
        }
    }
}