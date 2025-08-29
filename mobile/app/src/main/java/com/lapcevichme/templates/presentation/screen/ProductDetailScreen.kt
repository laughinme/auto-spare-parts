package com.lapcevichme.templates.presentation.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.presentation.viewmodel.ProductDetailViewModel
import com.lapcevichme.templates.ui.theme.PreviewTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    productId: String,
    viewModel: ProductDetailViewModel = hiltViewModel()
) {
    val product by viewModel.product.collectAsStateWithLifecycle()
    val loading by viewModel.loading.collectAsStateWithLifecycle()
    val errorMessage by viewModel.errorMessage.collectAsStateWithLifecycle()

    // TODO: Здесь бы хорошо загружать продукт при инициализации или при изменении productId
    // ViewModel уже должен это делать через SavedStateHandle

    Scaffold(
        topBar = { TopAppBar(title = { Text("Product Details") }) }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when {
                loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                errorMessage != null -> {
                    Text("Error: $errorMessage", modifier = Modifier.align(Alignment.Center))
                }
                product != null -> {
                    ProductDetailContent(
                        product = product!!,
                        onAddToCartClick = viewModel::addProductToCart
                    )
                }
                else -> {
                    Text("Product not found", modifier = Modifier.align(Alignment.Center))
                }
            }
        }
    }
}

@Composable
fun ProductDetailContent(product: ProductModel, onAddToCartClick: (ProductModel) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        AsyncImage(
            model = product.media.firstOrNull()?.url ?: "",
            contentDescription = product.title,
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp),
            contentScale = ContentScale.Crop
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(text = product.title, style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(8.dp))
        Text(text = product.description ?: "None", style = MaterialTheme.typography.bodyLarge)
        Spacer(modifier = Modifier.height(8.dp))
        Text(text = "Price: ${product.price}", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = { onAddToCartClick(product) },
            modifier = Modifier.fillMaxWidth(),
            enabled = product.isInStock // Пример условия: кнопка активна, если товар в наличии
        ) {
            Text("Add to Cart")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ProductDetailScreenPreview() {
    PreviewTheme {
        // Для превью нужен мок или фейковый ProductDetailViewModel
        // Пока просто отобразим заглушку
        ProductDetailScreen(productId = "123")
    }
}