package com.lapcevichme.templates.presentation.screen

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lapcevichme.templates.presentation.components.homeTabCards.SparePartCard
import com.lapcevichme.templates.presentation.viewmodel.SearchViewModel
import com.lapcevichme.templates.ui.theme.PreviewTheme

@Composable
fun SearchResultScreen(
    viewModel: SearchViewModel = hiltViewModel()
) {
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
        if (errorMessage != null) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                Text("Ошибка: $errorMessage")
                Button(
                    onClick = { viewModel.searchProducts() }, // Повторить первоначальный запрос
                    modifier = Modifier.padding(top = 8.dp)
                ) {
                    Text("Повторить")
                }
            }
        }

        LazyColumn(
            modifier = Modifier.weight(1f),
            state = listState
        ) {
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

            if (!loadingStatus && errorMessage == null && productFeed?.items.isNullOrEmpty()) {
                item {
                    Box(modifier = Modifier.fillParentMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Ничего не найдено")
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun SearchResultScreenPreview() {
    PreviewTheme {
        SearchResultScreen()
    }
}
