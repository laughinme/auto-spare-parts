    package com.lapcevichme.templates.presentation.screen.tabs

import android.content.res.Configuration
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.lapcevichme.templates.presentation.components.chatTabCards.ChatCard
import com.lapcevichme.templates.ui.theme.PreviewTheme

@Composable
fun ChatTabScreen() {
    LazyColumn(modifier = Modifier.fillMaxSize().padding(vertical = 5.dp)) {
        items(20) {
            ChatCard()
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
        ChatTabScreen()
    }
}
