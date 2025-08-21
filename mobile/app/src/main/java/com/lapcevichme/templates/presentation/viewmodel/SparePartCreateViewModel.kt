package com.lapcevichme.templates.presentation.viewmodel

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

@HiltViewModel
class SparePartCreateViewModel @Inject constructor() : ViewModel() {

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
    private val _selectedCondition = MutableStateFlow<String?>(null)
    val selectedCondition = _selectedCondition.asStateFlow()

    fun onConditionChanged(condition: String) {
        _selectedCondition.value = condition
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
    private val _status = MutableStateFlow<String?>("draft") // Default to "draft"
    val status = _status.asStateFlow()

    fun onStatusChanged(status: String) {
        _status.value = status
    }

    fun onCancelClicked(){
        //TODO Сделать закрытие экрана добавления детали и переход на HomeTabScreen
    }

    fun onCreateClicked() {
        //TODO Сделать создание детали и переход на HomeTabScreen
    }

}