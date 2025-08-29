package com.lapcevichme.templates.presentation.components.homeTabCards

import android.content.res.Configuration
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.lapcevichme.templates.R
import com.lapcevichme.templates.domain.model.MakeModel
import com.lapcevichme.templates.domain.model.MediaModel // Предполагаемый импорт для MediaModel, если он не в ProductModel
import com.lapcevichme.templates.domain.model.OrganizationShare // Предполагаемый импорт для OrganizationShare, если он не в ProductModel
import com.lapcevichme.templates.domain.model.ProductModel
import com.lapcevichme.templates.domain.model.enums.ProductCondition
import com.lapcevichme.templates.domain.model.enums.ProductOriginality
import com.lapcevichme.templates.domain.model.enums.ProductStatus
import com.lapcevichme.templates.domain.model.enums.StockType
import com.lapcevichme.templates.ui.theme.PreviewTheme

// It's good practice to have actual drawable resources for placeholders and errors
// import com.lapcevichme.templates.R // Assuming you have a placeholder in drawable

@Composable
fun SparePartCard(
    product: ProductModel, // Измененный параметр
    onClick: () -> Unit = {} // Добавлен onClick для навигации
) {
    // Используем значения из product:
    val imageUrl = product.media.firstOrNull()?.url ?: "https://upload.wikimedia.org/wikipedia/commons/7/79/Operation_Upshot-Knothole_-_Badger_001.jpg" // URL заглушки, если нет изображения
    val brand = product.make.makeName
    val productName = product.title
    val shopName = product.organization.name // Убрал безопасный доступ, т.к. organization не nullable в ProductModel
    val price = "${product.price} ₽" // Форматирование цены

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(160.dp)
            .padding(horizontal = 10.dp, vertical = 5.dp)
            .clickable(onClick = onClick), // Используем переданный onClick
        shape = MaterialTheme.shapes.large,
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth()
                .background(color = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            AsyncImage(
                model = ImageRequest.Builder(LocalContext.current)
                    .data(imageUrl)
                    .crossfade(true)
                    .placeholder(R.drawable.ic_launcher_background) // TODO Замени на свой плейсхолдер
                    .error(R.drawable.ic_launcher_foreground) // TODO Замени на свою картинку ошибки
                    .build(),
                contentDescription = productName,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxHeight()
                    .weight(0.35f)
                    .clip(MaterialTheme.shapes.large)
            )

            Spacer(modifier = Modifier.width(8.dp))

            Column(
                modifier = Modifier
                    .weight(0.65f)
                    .padding(12.dp)
                    .fillMaxHeight(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column { // Top content part
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = brand.uppercase(),
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.primary // Approx indigo-600
                            ),
                            letterSpacing = 0.5.sp // tracking-wide
                        )
                        // Если у вас есть рейтинг или что-то подобное, его можно вернуть сюда
                    }

                    Spacer(modifier = Modifier.height(4.dp)) // mb-2 (margin bottom from brand/rating row)

                    Text(
                        text = productName,
                        style = MaterialTheme.typography.titleMedium.copy( // text-base sm:text-lg
                            fontWeight = FontWeight.SemiBold
                        ),
                        maxLines = 2, // Allow for slightly longer titles
                        overflow = TextOverflow.Ellipsis,
                        lineHeight = 20.sp // leading-tight
                    )

                    Spacer(modifier = Modifier.height(2.dp)) // mt-1

                    Text(
                        text = shopName,
                        style = MaterialTheme.typography.bodySmall.copy(
                             color = MaterialTheme.colorScheme.onSurfaceVariant // text-gray-500
                        )
                    )
                }

                // Price (at the bottom due to SpaceBetween in parent Column)
                Text(
                    text = price,
                    style = MaterialTheme.typography.headlineSmall.copy( // text-xl sm:text-2xl
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface // text-gray-900
                    ),
                    modifier = Modifier.padding(top = 8.dp) // mt-3 from HTML structure
                )
            }
        }
    }
}

// Пример для @Preview, создаем фейковый ProductModel
private fun getPreviewProductModel(): ProductModel {
    return ProductModel(
        id = "preview_id",
        organization = OrganizationShare(
            id = "org_id",
            name = "Магазин Авто-Мир Preview",
            country = "RU",
            address = "Какой-то адрес Preview"
        ),
        createdAt = "2023-01-01T12:00:00Z",
        updatedAt = null,
        make = MakeModel(makeId = 1, makeName = "BMW"),
        partNumber = "Тормозной диск Preview",
        price = 3500.0,
        condition = ProductCondition.NEW, // Предполагается, что у вас есть такой enum
        description = "Описание для превью",
        status = ProductStatus.DRAFT, // Предполагается, что у вас есть такой enum
        media = listOf(
            MediaModel(
                id = "media_id_1",
                url = "https://example.com/image.jpg", // Замените на реальный URL или оставьте пустым для заглушки
                alt = null
            )
        ),
        title = "Geg",
        stockType = StockType.STOCK,
        quantityOnHand = 3,
        originality = ProductOriginality.OEM,
        allowCart = true,
        allowChat = false,
        isInStock = true,
        isBuyable = true,
    )
}


@Preview(showBackground = true, name = "SparePartCard Light Preview")
@Composable
fun SparePartCardPreview() {
    PreviewTheme {
        SparePartCard(product = getPreviewProductModel()) // TODO Миша сделай тут навигацию на экран товара
    }
}

@Preview(showBackground = true, uiMode = Configuration.UI_MODE_NIGHT_YES, name = "SparePartCard Dark Preview")
@Composable
fun SparePartCardDarkPreview() {
    PreviewTheme { // Example dark theme
         SparePartCard(product = getPreviewProductModel()) // TODO Миша сделай тут навигацию на экран товара
    }
}
