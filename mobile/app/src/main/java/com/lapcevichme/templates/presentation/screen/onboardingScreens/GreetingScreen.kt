package com.lapcevichme.templates.presentation.screen.onboardingScreens

import android.content.res.Configuration
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.lapcevichme.templates.ui.theme.PreviewTheme

data class GreetingPage(
    val title: String,
    val description: String,
)

val greetingPages = listOf(
    GreetingPage("Стёпа бот", "Он прям ботяра полнейший"),
    GreetingPage("Марк очень крут", "Ну он прям крутейший"),
    GreetingPage("Миша - шиша", "Миша большая шиша")
)
@Composable
fun GreetingScreen(onNavigateToSignUp: () -> Unit, onNavigateToSignIn: () -> Unit) {
    val pagerState = rememberPagerState { greetingPages.size }
    Column(
        modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        HorizontalPager(state = pagerState, modifier = Modifier.weight(1f)) { pageIndex ->
            val page = greetingPages[pageIndex]
            Box(modifier = Modifier.fillMaxSize().padding(16.dp), contentAlignment = Alignment.Center) {
                Column {
                    Text(text = page.title, style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(30.dp))
                    Text(text = page.description, style = MaterialTheme.typography.bodyLarge)
                }
            }
        }
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.padding(24.dp)
        ) {
            repeat(greetingPages.size) { index ->
                val width = animateDpAsState(targetValue = if (index == pagerState.currentPage) 25.dp else 10.dp, label = "").value
                Box(
                    modifier = Modifier
                        .height(10.dp)
                        .width(width)
                        .clip(CircleShape)
                        .background(if (index == pagerState.currentPage) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f))
                )
            }
        }
        Column(
            modifier = Modifier.fillMaxWidth().padding(start = 24.dp, end = 24.dp, bottom = 40.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Button(
                modifier = Modifier.height(60.dp).fillMaxWidth(0.9f),
                onClick = onNavigateToSignUp
            ) {
                Text("Get Started", style = MaterialTheme.typography.headlineSmall)
            }
            TextButton(onClick = onNavigateToSignIn) {
                Text("Already have an account? Sign In")
            }
        }
    }
}


@Preview(showBackground = true, name = "Light Theme")
@Preview(
    showBackground = true,
    uiMode = Configuration.UI_MODE_NIGHT_YES,
    name = "Dark Theme"
)
@Composable
fun OlympiadItemShortPreview() {
    PreviewTheme {
        GreetingScreen(
            onNavigateToSignUp = {},
            onNavigateToSignIn = {}
        )
    }
}




