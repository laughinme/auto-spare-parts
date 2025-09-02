import android.annotation.SuppressLint
import android.content.res.Configuration
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.lapcevichme.templates.ui.theme.PreviewTheme


@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun CartScreen() {
    Surface(color = MaterialTheme.colorScheme.background) {
        Scaffold(topBar = {Text("Корзина")}) {
        }
    }
}


@Composable
fun CartItemCard(
    productTitle: String,
    quantity: Int,
    maxAvailableQuantity: Int,
    onAddClicked: () -> Unit,
    onRemoveClicked: () -> Unit,
    onDeleteClicked: () -> Unit
) {
    Surface(color = MaterialTheme.colorScheme.background) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Название товара
                Text(
                    text = productTitle,
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.weight(1f)
                )

                // Кнопка удаления
                IconButton(onClick = { onDeleteClicked() }) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Удалить товар"
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                // Уменьшить количество
                IconButton(
                    onClick = { onRemoveClicked() },
                    enabled = quantity > 1
                ) {
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = "Уменьшить количество"
                    )
                }

                // Количество товара
                Text(
                    text = quantity.toString(),
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.padding(horizontal = 8.dp)
                )

                // Добавить количество (кнопка отключается, когда достигнуто максимальное количество)
                IconButton(
                    onClick = { onAddClicked() },
                    enabled = quantity < maxAvailableQuantity
                ) {
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowUp,
                        contentDescription = "Добавить количество"
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true, name = "Light Theme ChatCard")
@Preview(
    showBackground = true,
    uiMode = Configuration.UI_MODE_NIGHT_YES,
    name = "Dark Theme ChatCard"
)
@Composable
fun ChatCardPreview() {
    PreviewTheme {
        CartItemCard(
            productTitle = "Колесо",
            quantity = 10,
            maxAvailableQuantity = 20,
            {}, {}, {}
        )
    }
}