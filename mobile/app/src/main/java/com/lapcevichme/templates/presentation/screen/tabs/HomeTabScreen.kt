package com.lapcevichme.templates.presentation.screen.tabs

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lapcevichme.templates.presentation.components.homeTabCards.QuickSearchCard
import com.lapcevichme.templates.presentation.components.homeTabCards.SparePartCard
import com.lapcevichme.templates.presentation.viewmodel.HomeTabViewModel
import com.lapcevichme.templates.presentation.viewmodel.SearchViewModel
import com.lapcevichme.templates.ui.theme.PreviewTheme


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeTabScreen(
    onNavigateToSearch: () -> Unit,
    viewModel: HomeTabViewModel = hiltViewModel(),
    searchViewModel: SearchViewModel // Теперь принимается как параметр
) {
    val searchQuery by searchViewModel.searchQuery.collectAsStateWithLifecycle()
    val keyboardController = LocalSoftwareKeyboardController.current
    val loadingStatus by viewModel.loadingStatus.collectAsStateWithLifecycle()
    val errorMessage by viewModel.errorMessage.collectAsStateWithLifecycle()
    val productFeed by viewModel.productFeed.collectAsStateWithLifecycle()

    val listState = rememberLazyListState()

    val isScrolledToEnd by remember {
        derivedStateOf {
            val lastVisibleItem = listState.layoutInfo.visibleItemsInfo.lastOrNull()
            lastVisibleItem != null && lastVisibleItem.index == listState.layoutInfo.totalItemsCount - 1
        }
    }

    LaunchedEffect(isScrolledToEnd) {
        if (isScrolledToEnd && !loadingStatus && productFeed != null) {
            viewModel.addNextPage()
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        OutlinedTextField(
            value = searchQuery ?: "",
            onValueChange = { searchViewModel.onSearchQueryChanged(query = it) },
            label = { Text("Search") },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Filled.Search,
                    contentDescription = "Search Icon",
                    modifier = Modifier.clickable {
                        keyboardController?.hide()
                        searchViewModel.onSearchClicked()
                        if (searchQuery != null) {
                            onNavigateToSearch()
                        }
                    }
                )
            },
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
            keyboardActions = KeyboardActions(
                onSearch = {
                    keyboardController?.hide()
                    searchViewModel.onSearchClicked()
                    if (searchQuery != null) {
                        onNavigateToSearch()
                    }
                }
            )
        )
        LazyColumn(
            modifier = Modifier.weight(1f),
            state = listState
        ) {

            item {
                QuickSearchCard(
                    onNavigateToSearch = onNavigateToSearch,
                    viewModel = searchViewModel
                )
            }

            if (errorMessage != null) {
                item {
                    Column {
                        Text("Ошибка загрузки")
                        Button(
                            onClick = {
                                viewModel.loadProductFeed()
                            },
                            modifier = Modifier.padding(16.dp)
                        ){
                            Text("Повторить загрузку")
                        }
                    }
                }
            }

            productFeed?.items?.let { items ->
                items(items.size) { index ->
                    val product = items[index]
                    SparePartCard(
                        brand = product.brand,
                        price = product.price.toString(),
                        productName = product.partNumber,
                        imageUrl = product.media.firstOrNull()?.url ?: "",
                        shopName = product.organization!!.name
                    )
                }
            }

            if (loadingStatus) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator()
                    }
                }
            }

            if (!loadingStatus && errorMessage == null && productFeed == null) {
                item {
                    Text("Стёпа бот")
                }
            }
        }
    }
}

@Preview(showBackground = true, name = "SparePartCard Light Preview")
@Composable
fun HomeTabScreenLightPreview() {
    PreviewTheme {
        // Для превью создаём отдельный экземпляр, это нормально
        HomeTabScreen(onNavigateToSearch = {}, searchViewModel = hiltViewModel())
    }
}

@Preview(showBackground = true, uiMode = android.content.res.Configuration.UI_MODE_NIGHT_YES, name = "SparePartCard Dark Preview")
@Composable
fun HomeTabScreenDarkPreview() {
    PreviewTheme {
        HomeTabScreen(onNavigateToSearch = {}, searchViewModel = hiltViewModel())
    }
}
