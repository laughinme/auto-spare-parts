package com.lapcevichme.templates.presentation.components

import android.content.Context
import android.location.Location
import android.util.Log
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.lapcevichme.templates.domain.model.ExchangeLocation
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker

@Suppress("DEPRECATION")
@Composable
fun Map(
    context: Context,
    currentLocation: Location?,
    locations: List<ExchangeLocation>,
    onLocationClick: (ExchangeLocation) -> Unit
) {
    AndroidView(
        factory = {
            MapView(it).apply {
                setTileSource(TileSourceFactory.MAPNIK)
                setBuiltInZoomControls(true)
                setMultiTouchControls(true)
                Log.d("Map", "Полученная стартовая локация: ${currentLocation?.latitude}")
            }
        },
        update = { mapView ->
            mapView.overlays.clear()

            currentLocation?.let { loc ->
                mapView.controller.setZoom(12.0)
                mapView.controller.setCenter(GeoPoint(loc.latitude, loc.longitude))
            }

            locations
                .filter { it.latitude != null && it.longitude != null } // <-- защита
                .forEach { loc ->
                    val marker = Marker(mapView).apply {
                        position = GeoPoint(loc.latitude!!, loc.longitude!!)
                        setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                        title = loc.title
                        relatedObject = loc
                        setOnMarkerClickListener { m, _ ->
                            (m.relatedObject as? ExchangeLocation)?.let(onLocationClick)
                            true
                        }
                    }
                    mapView.overlays.add(marker)
                }

            mapView.invalidate()
        },
        modifier = Modifier.fillMaxSize()
    )
}