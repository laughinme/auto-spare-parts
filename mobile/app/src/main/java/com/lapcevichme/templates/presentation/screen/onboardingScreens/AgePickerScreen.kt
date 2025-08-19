package com.lapcevichme.templates.presentation.screen.onboardingScreens

import android.content.res.Configuration
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.commandiron.wheel_picker_compose.WheelDatePicker
import com.lapcevichme.templates.presentation.viewmodel.ProfileEvent
import com.lapcevichme.templates.presentation.viewmodel.ProfileViewModel
import com.lapcevichme.templates.ui.theme.PreviewTheme

// USES https://github.com/commandiron/WheelPickerCompose

@Composable
fun AgePickerScreen(
    viewModel: ProfileViewModel = hiltViewModel(),
    onNext: () -> Unit
) {
    Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        Column(modifier = Modifier.fillMaxSize()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text("Choose your age", fontSize = 25.sp)
            }
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                WheelDatePicker { snappedDate ->
                    viewModel.onEvent(ProfileEvent.OnBirthDateChange(snappedDate))
                }
            }
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .padding(bottom = 60.dp),
                contentAlignment = Alignment.BottomCenter
            ) {
                Button(
                    modifier = Modifier
                        .height(60.dp)
                        .fillMaxWidth(0.9f),
                    onClick = onNext // Просто переходим дальше, сохранение будет в конце
                ) {
                    Text("Continue", style = MaterialTheme.typography.headlineSmall)
                }
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
fun AgePickerPreview() {
    PreviewTheme {
        AgePickerScreen(
            onNext = {}
        )
    }
}
