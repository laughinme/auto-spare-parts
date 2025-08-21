package com.lapcevichme.templates.presentation.screen.tabs

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.lapcevichme.templates.presentation.components.garageTab.Car
import com.lapcevichme.templates.presentation.components.garageTab.GarageCarCard

@Composable
fun GarageTabScreen() {
    val myCars = listOf(
        Car(1, "Tesla Model S", "5YJSA1E5XNF012345"),
        Car(2, "BMW M5 Competition", "WBSJF0C53LB123456"),
        Car(3, "Audi RS6 Avant", "WA1Z2Z3F7N9123456"),
        Car(4, "Mercedes-AMG GT", "WDD2903781F123456"),
        Car(5, "Porsche 911 Turbo S", "WP0AD2A92KS123456")
    )

    LazyColumn(modifier = Modifier
        .fillMaxSize()
        .padding(vertical = 5.dp)) {
        items(myCars) { car ->
            GarageCarCard(car = car)
        }
    }
}