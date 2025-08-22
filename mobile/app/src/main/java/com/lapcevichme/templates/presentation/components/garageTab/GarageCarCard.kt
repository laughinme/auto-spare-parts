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
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.lapcevichme.templates.domain.model.garage.MakeModel
import com.lapcevichme.templates.domain.model.garage.VehicleModel
import com.lapcevichme.templates.domain.model.garage.VehicleModelInfo
import com.lapcevichme.templates.domain.model.garage.VehicleTypeModel
import com.lapcevichme.templates.ui.theme.PreviewTheme

@Composable
fun GarageCarCard(
    car: VehicleModel,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp), // Consistent padding with GarageTabScreen
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        shape = MaterialTheme.shapes.medium
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // TODO: Replace with actual image loading using car.imageUrl or similar from VehicleModel if available
            // For now, using a placeholder. If car.make.logoUrl or car.model.imageUrl becomes available, use Coil:
            // AsyncImage(
            //     model = ImageRequest.Builder(LocalContext.current)
            //         .data(car.someImageUrl ?: R.drawable.ic_car_placeholder) // Replace with actual image URL
            //         .crossfade(true)
            //         .build(),
            //     contentDescription = "${car.make.makeName} ${car.model.modelName}",
            //     modifier = Modifier.size(64.dp),
            //     contentScale = ContentScale.Crop,
            //     // placeholder = painterResource(id = R.drawable.ic_car_placeholder), // Placeholder for Coil
            //     // error = painterResource(id = R.drawable.ic_car_placeholder) // Error image for Coil
            // )
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
                    style = MaterialTheme.typography.titleMedium, // Adjusted for potentially longer text
                    fontWeight = FontWeight.Bold,
                    maxLines = 2, // Allow for two lines for make and model
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
    PreviewTheme { // Added AppTheme for consistent preview
        GarageCarCard(car = sampleCar)
    }
}

@Preview(showBackground = true)
@Composable
fun GarageCarCardPreview_NoCommentNoVin() {
    val sampleCar = VehicleModel(
        id = "2",
        userId = "user2",
        make = MakeModel(makeId = 2, makeName = "VolksWagen"),
        model = VehicleModelInfo(modelId = 2, makeId = 2, modelName = "Golf GTI Clubsport S 2-door"),
        year = 2018,
        vehicleType = null,
        vin = null,
        comment = null,
        createdAt = "2023-01-01T10:00:00Z",
        updatedAt = "2023-01-01T10:00:00Z"
    )
    PreviewTheme {
        GarageCarCard(car = sampleCar)
    }
}
