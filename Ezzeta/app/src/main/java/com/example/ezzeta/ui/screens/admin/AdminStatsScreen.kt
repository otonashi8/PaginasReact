package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ezzeta.data.model.StatResult
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminStatsScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit,
    onNavigateToProduct: (String) -> Unit
) {
    val statsMode by viewModel.statsMode.collectAsState()
    val dateFilter by viewModel.statsDateFilter.collectAsState()
    val dimension by viewModel.statsDimension.collectAsState()
    val kpis by viewModel.statsKpis.collectAsState()
    val results by viewModel.statsResults.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Estadísticas de Ventas", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            TabRow(
                selectedTabIndex = when(statsMode) { "EZZETA" -> 0; "MARKETPLACE" -> 1; else -> 2 }
            ) {
                Tab(selected = statsMode == "EZZETA", onClick = { viewModel.setStatsMode("EZZETA") }) {
                    Text("Ezzeta", modifier = Modifier.padding(12.dp))
                }
                Tab(selected = statsMode == "MARKETPLACE", onClick = { viewModel.setStatsMode("MARKETPLACE") }) {
                    Text("Marketplace", modifier = Modifier.padding(12.dp))
                }
                Tab(selected = statsMode == "BOTH", onClick = { viewModel.setStatsMode("BOTH") }) {
                    Text("Ambos", modifier = Modifier.padding(12.dp))
                }
            }

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterDropdown(
                            label = "Fecha",
                            currentValue = dateFilter,
                            options = mapOf("TODAY" to "Hoy", "WEEK" to "Semana", "MONTH" to "Mes", "ALL" to "Todo"),
                            onSelect = { viewModel.setStatsDateFilter(it) },
                            modifier = Modifier.weight(1f)
                        )
                        FilterDropdown(
                            label = "Dimensión",
                            currentValue = dimension,
                            options = mapOf("PRODUCT" to "Producto", "SIZE" to "Talla", "CATEGORY" to "Categoría", "STORE" to "Tienda", "SELLER" to "Vendedor"),
                            onSelect = { viewModel.setStatsDimension(it) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                // KPIs
                item {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        KpiCard("Ingresos", "S/ ${String.format(Locale.US, "%.2f", kpis["REVENUE"] ?: 0.0)}", Modifier.weight(1f), MaterialTheme.colorScheme.primaryContainer)
                        KpiCard("Unidades", "${(kpis["UNITS"] ?: 0.0).toInt()}", Modifier.weight(1f), MaterialTheme.colorScheme.secondaryContainer)
                    }
                }
                item {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        KpiCard("Pedidos", "${(kpis["ORDERS"] ?: 0.0).toInt()}", Modifier.weight(1f), MaterialTheme.colorScheme.tertiaryContainer)
                        KpiCard("Ticket Prom.", "S/ ${String.format(Locale.US, "%.2f", kpis["AVG_TICKET"] ?: 0.0)}", Modifier.weight(1f), MaterialTheme.colorScheme.surfaceVariant)
                    }
                }

                item {
                    Text("Desglose por ${dimension.lowercase().replaceFirstChar { it.uppercase() }}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                }

                // Results List
                items(results) { result ->
                    StatResultItem(result, dimension, onClick = { if (dimension == "PRODUCT") onNavigateToProduct(result.id) })
                }
            }
        }
    }
}

@Composable
fun KpiCard(label: String, value: String, modifier: Modifier = Modifier, containerColor: Color) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = containerColor),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = label, style = MaterialTheme.typography.labelSmall)
            Text(text = value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FilterDropdown(
    label: String,
    currentValue: String,
    options: Map<String, String>,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }
    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = it },
        modifier = modifier
    ) {
        OutlinedTextField(
            value = options[currentValue] ?: currentValue,
            onValueChange = {},
            readOnly = true,
            label = { Text(label) },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
            modifier = Modifier.menuAnchor(),
            shape = RoundedCornerShape(8.dp)
        )
        ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            options.forEach { (key, value) ->
                DropdownMenuItem(text = { Text(value) }, onClick = { onSelect(key); expanded = false })
            }
        }
    }
}

@Composable
fun StatResultItem(result: StatResult, dimension: String, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            if (dimension == "PRODUCT" && result.imageUrl != null) {
                AsyncImage(
                    model = result.imageUrl,
                    contentDescription = null,
                    modifier = Modifier.size(50.dp).clip(RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Crop
                )
                Spacer(modifier = Modifier.width(12.dp))
            }
            
            Column(modifier = Modifier.weight(1f)) {
                Text(text = result.name, fontWeight = FontWeight.Bold, maxLines = 1)
                Text(text = "${result.units} un. | ${result.ordersCount} pedidos", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
            }
            
            Text(text = "S/ ${String.format(Locale.US, "%.2f", result.revenue)}", fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
            
            if (dimension == "PRODUCT") {
                Icon(Icons.Default.ChevronRight, null, tint = Color.LightGray)
            }
        }
    }
}
