package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ezzeta.data.model.ShippingRate
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminShippingManagementScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val config by viewModel.shippingConfig.collectAsState()
    val rates by viewModel.shippingRates.collectAsState()
    val ubigeoData by viewModel.ubigeoData.collectAsState()
    val departments = remember(ubigeoData) { ubigeoData.keys.toList().sorted() }

    var showThresholdDialog by remember { mutableStateOf(false) }
    var showRateDialog by remember { mutableStateOf<ShippingRate?>(null) }
    var isCreatingNew by remember { mutableStateOf(false) }

    if (showThresholdDialog) {
        var thresholdText by remember { mutableStateOf(config.freeShippingThreshold.toString()) }
        AlertDialog(
            onDismissRequest = { showThresholdDialog = false },
            title = { Text("Monto Envío Gratis") },
            text = {
                OutlinedTextField(
                    value = thresholdText,
                    onValueChange = { thresholdText = it },
                    label = { Text("Monto mínimo (S/)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true
                )
            },
            confirmButton = {
                Button(onClick = {
                    thresholdText.toDoubleOrNull()?.let {
                        if (it >= 0) {
                            viewModel.setShippingThreshold(context, it)
                            showThresholdDialog = false
                        }
                    }
                }) { Text("Guardar") }
            },
            dismissButton = { TextButton(onClick = { showThresholdDialog = false }) { Text("Cancelar") } }
        )
    }

    if (showRateDialog != null || isCreatingNew) {
        RateEditorDialog(
            rate = showRateDialog,
            departments = departments,
            onDismiss = { 
                showRateDialog = null
                isCreatingNew = false
            },
            onSave = { region, cost, priority, isActive ->
                if (isCreatingNew) {
                    viewModel.addShippingRate(context, region, cost, priority)
                } else {
                    showRateDialog?.let {
                        viewModel.updateShippingRate(context, it.copy(region = region, cost = cost, priority = priority, isActive = isActive))
                    }
                }
                showRateDialog = null
                isCreatingNew = false
            }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Configuración de Envíos", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { isCreatingNew = true }) {
                Icon(Icons.Default.Add, contentDescription = "Añadir Tarifa")
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Envío gratis desde", style = MaterialTheme.typography.labelMedium, color = Color.Gray)
                            Text("S/ ${String.format(Locale.US, "%.2f", config.freeShippingThreshold)}", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        }
                        IconButton(onClick = { showThresholdDialog = true }) {
                            Icon(Icons.Default.Edit, contentDescription = "Editar umbral")
                        }
                    }
                }
            }

            item {
                Text("Tarifas de Envío", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            }

            items(rates.sortedBy { it.priority }) { rate ->
                ShippingRateItem(
                    rate = rate,
                    onEdit = { showRateDialog = rate },
                    onDelete = { viewModel.deleteShippingRate(context, rate.id) },
                    onToggle = { viewModel.updateShippingRate(context, rate.copy(isActive = !rate.isActive)) }
                )
            }
        }
    }
}

@Composable
fun ShippingRateItem(
    rate: ShippingRate,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onToggle: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (rate.isActive) MaterialTheme.colorScheme.surface else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        )
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = if (rate.region == "GENERAL") "TARIFA GENERAL" else rate.region,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = if (rate.region == "GENERAL") MaterialTheme.colorScheme.primary else Color.Unspecified
                )
                Text("Costo: S/ ${String.format(Locale.US, "%.2f", rate.cost)}", style = MaterialTheme.typography.bodyMedium)
                Text("Prioridad: ${rate.priority}", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
            }

            Column(horizontalAlignment = Alignment.End) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    androidx.compose.material3.Switch(
                        checked = rate.isActive, 
                        onCheckedChange = { onToggle() }, 
                        modifier = Modifier.scale(0.7f)
                    )
                    IconButton(onClick = onEdit) { Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(20.dp)) }
                    if (rate.region != "GENERAL") {
                        IconButton(onClick = onDelete) { Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red, modifier = Modifier.size(20.dp)) }
                    }
                }
                
                Surface(
                    color = (if (rate.isActive) Color(0xFF2E7D32) else Color.Gray).copy(alpha = 0.1f),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(
                        text = if (rate.isActive) "Activa" else "Inactiva",
                        color = if (rate.isActive) Color(0xFF2E7D32) else Color.Gray,
                        style = MaterialTheme.typography.labelSmall,
                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RateEditorDialog(
    rate: ShippingRate?,
    departments: List<String>,
    onDismiss: () -> Unit,
    onSave: (String, Double, Int, Boolean) -> Unit
) {
    var selectedRegion by remember { mutableStateOf(rate?.region ?: if (departments.isNotEmpty()) departments[0] else "") }
    var costText by remember { mutableStateOf(rate?.cost?.toString() ?: "") }
    var priorityText by remember { mutableStateOf(rate?.priority?.toString() ?: "1") }
    var isActive by remember { mutableStateOf(rate?.isActive ?: true) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (rate == null) "Nueva Tarifa" else "Editar Tarifa") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (rate?.region == "GENERAL") {
                    Text("Editando Tarifa General", fontWeight = FontWeight.Bold)
                } else {
                    var expanded by remember { mutableStateOf(false) }
                    ExposedDropdownMenuBox(
                        expanded = expanded,
                        onExpandedChange = { expanded = it }
                    ) {
                        OutlinedTextField(
                            value = selectedRegion,
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Departamento") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                            modifier = Modifier.fillMaxWidth().menuAnchor()
                        )
                        ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                            departments.forEach { dept ->
                                DropdownMenuItem(text = { Text(dept) }, onClick = { selectedRegion = dept; expanded = false })
                            }
                        }
                    }
                }

                OutlinedTextField(
                    value = costText,
                    onValueChange = { costText = it },
                    label = { Text("Costo (S/)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = priorityText,
                    onValueChange = { priorityText = it },
                    label = { Text("Prioridad") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    supportingText = { Text("Menor valor = Mayor prioridad") }
                )
            }
        },
        confirmButton = {
            Button(onClick = {
                val cost = costText.toDoubleOrNull() ?: 0.0
                val priority = priorityText.toIntOrNull() ?: 1
                if (cost >= 0 && priority > 0) {
                    onSave(selectedRegion, cost, priority, isActive)
                }
            }) { Text("Guardar") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancelar") } }
    )
}
