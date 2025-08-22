package com.lapcevichme.templates.presentation.viewmodel

import androidx.lifecycle.ViewModel
import com.lapcevichme.templates.domain.repository.UserRepository
import com.lapcevichme.templates.domain.usecase.product.ProductSearchUseCase
import com.lapcevichme.templates.domain.usecase.user.LogoutUseCase
import com.lapcevichme.templates.domain.usecase.user.UpdateProfilePictureUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import javax.inject.Inject

@HiltViewModel
class SearchResultViewModel @Inject constructor(
    productSearchUseCase: ProductSearchUseCase
) : ViewModel() {
    //private val _searchResult = MutableStateFlow()
}