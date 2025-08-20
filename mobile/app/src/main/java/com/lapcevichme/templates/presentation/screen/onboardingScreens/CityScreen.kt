//package com.lapcevichme.templates.presentation.screen.onboardingScreens
//
//import android.content.res.Configuration
//import androidx.compose.foundation.layout.Box
//import androidx.compose.foundation.layout.Column
//import androidx.compose.foundation.layout.fillMaxSize
//import androidx.compose.foundation.layout.fillMaxWidth
//import androidx.compose.foundation.layout.height
//import androidx.compose.foundation.layout.padding
//import androidx.compose.material3.Button
//import androidx.compose.material3.CircularProgressIndicator
//import androidx.compose.material3.DropdownMenuItem
//import androidx.compose.material3.ExperimentalMaterial3Api
//import androidx.compose.material3.ExposedDropdownMenuBox
//import androidx.compose.material3.ExposedDropdownMenuDefaults
//import androidx.compose.material3.MaterialTheme
//import androidx.compose.material3.Text
//import androidx.compose.material3.TextField
//import androidx.compose.runtime.Composable
//import androidx.compose.runtime.getValue
//import androidx.compose.runtime.mutableStateOf
//import androidx.compose.runtime.remember
//import androidx.compose.runtime.setValue
//import androidx.compose.ui.Alignment
//import androidx.compose.ui.Modifier
//import androidx.compose.ui.tooling.preview.Preview
//import androidx.compose.ui.unit.dp
//import androidx.compose.ui.unit.sp
//import androidx.hilt.navigation.compose.hiltViewModel
//import androidx.lifecycle.compose.collectAsStateWithLifecycle
//import com.lapcevichme.templates.domain.model.Resource
//import com.lapcevichme.templates.presentation.viewmodel.ProfileEvent
//import com.lapcevichme.templates.presentation.viewmodel.ProfileViewModel
//import com.lapcevichme.templates.ui.theme.PreviewTheme
//
//
//@OptIn(ExperimentalMaterial3Api::class)
//@Composable
//fun CityScreen(
//    viewModel: ProfileViewModel = hiltViewModel(),
//    onProfileComplete: () -> Unit
//) {
//    // Получаем актуальные состояния из ViewModel
//    val allCitiesState by viewModel.allCitiesState.collectAsStateWithLifecycle()
//    val selectedCityId by viewModel.selectedCityId.collectAsStateWithLifecycle()
//    var expanded by remember { mutableStateOf(false) }
//
//    // Находим имя выбранного города для отображения в поле
//    val selectedCityName = (allCitiesState as? Resource.Success)?.data?.find { it.id == selectedCityId }?.name ?: ""
//
//    Column(modifier = Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally) {
//        Box(
//            modifier = Modifier.fillMaxWidth().weight(1f),
//            contentAlignment = Alignment.Center
//        ) {
//            Text("Выберите ваш город", fontSize = 25.sp)
//        }
//        Box(
//            modifier = Modifier.fillMaxWidth().weight(1f).padding(horizontal = 24.dp),
//            contentAlignment = Alignment.Center
//        ) {
//            // Обрабатываем состояния загрузки, ошибки и успеха
//            when (val state = allCitiesState) {
//                is Resource.Loading -> CircularProgressIndicator()
//                is Resource.Error -> Text(state.message ?: "Ошибка загрузки", color = MaterialTheme.colorScheme.error)
//                is Resource.Success -> {
//                    val cities = state.data ?: emptyList()
//                    ExposedDropdownMenuBox(
//                        expanded = expanded,
//                        onExpandedChange = { expanded = !expanded }
//                    ) {
//                        TextField(
//                            modifier = Modifier.menuAnchor().fillMaxWidth(),
//                            value = selectedCityName,
//                            onValueChange = {},
//                            readOnly = true,
//                            label = { Text("Город") },
//                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
//                        )
//                        ExposedDropdownMenu(
//                            expanded = expanded,
//                            onDismissRequest = { expanded = false }
//                        ) {
//                            cities.forEach { city ->
//                                DropdownMenuItem(
//                                    text = { Text(city.name) },
//                                    onClick = {
//                                        // Отправляем правильное событие с объектом City
//                                        viewModel.onEvent(ProfileEvent.OnCityChange(city))
//                                        expanded = false
//                                    }
//                                )
//                            }
//                        }
//                    }
//                }
//            }
//        }
//        Box(
//            modifier = Modifier.fillMaxWidth().weight(1f).padding(bottom = 60.dp),
//            contentAlignment = Alignment.BottomCenter
//        ) {
//            Button(
//                modifier = Modifier.height(60.dp).fillMaxWidth(0.9f),
//                onClick = onProfileComplete,
//            ) {
//                Text("Продолжить", style = MaterialTheme.typography.headlineSmall)
//            }
//        }
//    }
//}
//
//@Preview(showBackground = true, name = "Light Theme")
//@Preview(
//    showBackground = true,
//    uiMode = Configuration.UI_MODE_NIGHT_YES,
//    name = "Dark Theme"
//)
//@Composable
//fun CityPreview() {
//    PreviewTheme {
//        CityScreen(
//            onProfileComplete = {}
//        )
//    }
//}
//
//
//
