package com.lapcevichme.templates.presentation.components.homeTabCards

import androidx.compose.foundation.background
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
import com.lapcevichme.templates.ui.theme.PreviewTheme

// It's good practice to have actual drawable resources for placeholders and errors
// import com.lapcevichme.templates.R // Assuming you have a placeholder in drawable

@Composable
fun SparePartCard(
    imageUrl: String = "https://images.unsplash.com/photo-1581381394474-b7a9f845077a?q=80&w=800",
    brand: String = "BMW",
    rating: Float = 4.0f,
    productName: String = "Тормозной диск передний вентилируемый",
    shopName: String = "Магазин Авто-Мир",
    price: String = "3 500 ₽"
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(160.dp)
            .padding(horizontal = 10.dp, vertical = 5.dp),
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
                    // .placeholder(R.drawable.placeholder_image) // Replace with your placeholder
                    // .error(R.drawable.error_image) // Replace with your error image
                    .build(),
                contentDescription = productName,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxHeight()
                    .weight(0.35f) // Adjust weight for image width (approx 1/3 or 1/4)
                    .clip(MaterialTheme.shapes.large) // Clip to card shape if needed, though usually image is flush
            )

            Spacer(modifier = Modifier.width(8.dp))

            Column(
                modifier = Modifier
                    .weight(0.65f)
                    .padding(12.dp) // Adjusted padding (sm:p-5 is a bit larger)
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
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Filled.Star,
                                contentDescription = "Rating",
                                tint = Color(0xFFFFC107), // text-yellow-400
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = rating.toString(),
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = MaterialTheme.colorScheme.onSurfaceVariant // gray-500
                                ),
                            )
                        }
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

@Preview(showBackground = true, name = "SparePartCard Light Preview")
@Composable
fun SparePartCardPreview() {
    PreviewTheme {
        SparePartCard()
    }
}

@Preview(showBackground = true, uiMode = android.content.res.Configuration.UI_MODE_NIGHT_YES, name = "SparePartCard Dark Preview")
@Composable
fun SparePartCardDarkPreview() {
    PreviewTheme { // Example dark theme
         SparePartCard()
    }
}
