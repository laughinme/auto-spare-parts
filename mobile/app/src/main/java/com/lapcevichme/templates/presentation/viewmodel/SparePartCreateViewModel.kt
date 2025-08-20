package com.lapcevichme.templates.presentation.viewmodel

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

@HiltViewModel
class SparePartCreateViewModel @Inject constructor() : ViewModel() {

    //Название детали
    private val _partName = MutableStateFlow<String?>(null)
    val partName = _partName.asStateFlow()

    fun onNameChanged(name: String){
        _partName.value = name
    }

    //Состояние детали
    private val _selectedCondition = MutableStateFlow<String?>(null)
    val selectedCondition = _selectedCondition.asStateFlow()

    fun onConditionChanged(condition: String){
        _selectedCondition.value = condition
    }

    //Марка машина для детали
    private val _make = MutableStateFlow<String?>(null)
    val make = _make.asStateFlow()

    fun onMakeChanged(make: String){
        _make.value = make
    }

    //Модель машины для детали
    private val _model = MutableStateFlow<String?>(null)
    val model = _model.asStateFlow()

    fun onModelChanged(model: String){
        _model.value = model
    }

    //Год выпуска машины для детали
    private val _year = MutableStateFlow<String?>(null)
    val year = _year.asStateFlow()

    fun onYearChanged(year: String){
        _year.value = year
    }

    //цена детали
    private val _price = MutableStateFlow<String?>(null)
    val price = _price.asStateFlow()

    fun onPriceChanged(price: String){
        _price.value = price
    }

    //Описание для детали
    private val _description = MutableStateFlow<String?>(null)
    val description = _description.asStateFlow()

    fun onDescriptionChanged(description: String){
        _description.value = description
    }

}