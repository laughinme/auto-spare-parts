package com.lapcevichme.templates.presentation.screen.onboardingScreens

import android.content.res.Configuration
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lapcevichme.templates.presentation.viewmodel.ProfileEvent
import com.lapcevichme.templates.presentation.viewmodel.ProfileViewModel
import com.lapcevichme.templates.ui.theme.PreviewTheme

@Composable
fun GenderPickerScreen(
    viewModel: ProfileViewModel = hiltViewModel(),
    onNext: () -> Unit
) {
    val genders = listOf("Male", "Female", "Other")
    val selectedGender by viewModel.gender.collectAsStateWithLifecycle()

    Column(modifier = Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier.weight(1f).fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            Text(text = "Choose your gender", fontSize = 30.sp)
        }
        Box(
            modifier = Modifier.weight(1f).fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                genders.forEach { gender ->
                    val isSelected = (gender == selectedGender)
                    OutlinedButton(
                        onClick = { viewModel.onEvent(ProfileEvent.OnGenderChange(gender)) },
                        colors = if (isSelected) ButtonDefaults.outlinedButtonColors(containerColor = MaterialTheme.colorScheme.primary, contentColor = MaterialTheme.colorScheme.onPrimary)
                        else ButtonDefaults.outlinedButtonColors(),
                        modifier = Modifier.width(110.dp).height(55.dp).offset(x = (-1 * genders.indexOf(gender)).dp).zIndex(if (isSelected) 1f else 0f)
                    ) {
                        Text(text = gender)
                    }
                }
            }
        }
        Box(
            modifier = Modifier.weight(1f).fillMaxWidth().padding(bottom = 60.dp),
            contentAlignment = Alignment.BottomCenter
        ) {
            Button(
                modifier = Modifier.height(60.dp).fillMaxWidth(0.9f),
                onClick = onNext
            ) {
                Text("Continue", style = MaterialTheme.typography.headlineSmall)
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
fun GenderPickerPreview() {
    PreviewTheme {
        GenderPickerScreen(
            onNext = {}
        )
    }
}
