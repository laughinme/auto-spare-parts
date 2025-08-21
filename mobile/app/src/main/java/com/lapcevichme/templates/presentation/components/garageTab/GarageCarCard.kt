package com.lapcevichme.templates.presentation.components.garageTab


import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

// 1. Создаем data class для представления данных автомобиля
data class Car(
    val id: Int,
    val name: String,
    val vin: String,
    val imageUrl: String? = null // Ссылка на изображение (пока не используется)
)

@Composable
fun GarageCarCard(
    car: Car,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        shape = MaterialTheme.shapes.medium
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Изображение автомобиля
            // TODO: Заменить на реальную загрузку изображений из car.imageUrl
            // Например, с помощью библиотеки Coil:
            // AsyncImage(
            //     model = car.imageUrl,
            //     contentDescription = car.name,
            //     modifier = Modifier.size(64.dp),
            //     contentScale = ContentScale.Crop,
            //     placeholder = painterResource(id = R.drawable.ic_car_placeholder), // Заглушка
            //     error = painterResource(id = R.drawable.ic_car_placeholder) // Картинка при ошибке
            // )
            Image(
                imageVector = Icons.Default.Warning, // Временная иконка-заглушка
                contentDescription = "Car image",
                modifier = Modifier.size(64.dp),
                contentScale = ContentScale.Crop
            )

            Spacer(modifier = Modifier.width(16.dp))

            // Название и VIN
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = car.name,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "VIN: ${car.vin}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

// 2. Preview для удобной разработки в Android Studio
@Preview(showBackground = true)
@Composable
fun GarageCarCardPreview() {
    val sampleCar = Car(
        id = 1,
        name = "Tesla Model S Plaid",
        vin = "5YJSA1E5XNF000000"
    )
    GarageCarCard(car = sampleCar)
}