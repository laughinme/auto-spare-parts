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
import androidx.compose.material.icons.filled.AccountBox
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.lapcevichme.templates.domain.model.MakeModel
import com.lapcevichme.templates.domain.model.VehicleModel
import com.lapcevichme.templates.domain.model.VehicleModelInfo
import com.lapcevichme.templates.domain.model.VehicleTypeModel
import com.lapcevichme.templates.ui.theme.PreviewTheme

@Composable
fun GarageCarCard(
    car: VehicleModel,
    onEditClick: () -> Unit, // <-- Новый параметр для клика по иконке редактирования
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp), // Убрал vertical padding, т.к. Spacer лучше контролирует отступы в LazyColumn
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        shape = MaterialTheme.shapes.medium
    ) {
        Row(
            modifier = Modifier.padding(start = 16.dp, top = 16.dp, bottom = 16.dp, end = 8.dp), // Уменьшил отступ справа для IconButton
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                imageVector = Icons.Default.AccountBox, // Placeholder icon
                contentDescription = "Car: ${car.make.makeName} ${car.model.modelName}",
                modifier = Modifier.size(64.dp),
                contentScale = ContentScale.Fit,
                colorFilter = ColorFilter.tint(MaterialTheme.colorScheme.onSurfaceVariant)
            )

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "${car.make.makeName} ${car.model.modelName} (${car.year})",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "VIN: ${car.vin ?: "N/A"}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                car.comment?.let {
                    if (it.isNotBlank()) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Comment: $it",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }

            // --- ДОБАВЛЕНА КНОПКА РЕДАКТИРОВАНИЯ ---
            IconButton(onClick = onEditClick) {
                Icon(
                    imageVector = Icons.Default.Edit,
                    contentDescription = "Edit Vehicle",
                    tint = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun GarageCarCardPreview() {
    val sampleCar = VehicleModel(
        id = "1",
        userId = "user1",
        make = MakeModel(makeId = 1, makeName = "Tesla"),
        model = VehicleModelInfo(modelId = 1, makeId = 1, modelName = "Model S Plaid"),
        year = 2023,
        vehicleType = VehicleTypeModel(vehicleTypeId = 1, name = "Sedan"),
        vin = "5YJSA1E5XNF000000",
        comment = "Super fast electric car with a yoke steering wheel.",
        createdAt = "2023-01-01T10:00:00Z",
        updatedAt = "2023-01-01T10:00:00Z"
    )
    PreviewTheme {
        GarageCarCard(car = sampleCar, onEditClick = {})
    }
}
