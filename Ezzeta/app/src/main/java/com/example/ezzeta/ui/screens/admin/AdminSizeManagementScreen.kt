package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ezzeta.data.model.SizeOption
import com.example.ezzeta.data.model.SizeSystem
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminSizeManagementScreen(viewModel: MainViewModel, onBack: () -> Unit) {
    val sizeSystems by viewModel.globalSizeSystems.collectAsState()
    var selectedSystem by remember { mutableStateOf<SizeSystem?>(null) }
    var showAddSystemDialog by remember { mutableStateOf(false) }
    var showAddOptionDialog by remember { mutableStateOf(false) }
    var showDeleteConfirm by remember { mutableStateOf<Pair<String, SizeOption>?>(null) }
    
    val context = LocalContext.current

    LaunchedEffect(sizeSystems) {
        if (selectedSystem != null) {
            selectedSystem = sizeSystems.find { it.id == selectedSystem?.id }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(selectedSystem?.name ?: "Catálogo Global Tallas", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { if (selectedSystem == null) onBack() else selectedSystem = null }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                },
                actions = {
                    if (selectedSystem == null) {
                        IconButton(onClick = { showAddSystemDialog = true }) {
                            Icon(Icons.Default.Add, contentDescription = "Nuevo Tipo")
                        }
                    } else {
                        IconButton(onClick = { showAddOptionDialog = true }) {
                            Icon(Icons.Default.Add, contentDescription = "Nueva Talla")
                        }
                    }
                }
            )
        }
    ) { padding ->
        if (selectedSystem == null) {
            LazyColumn(modifier = Modifier.padding(padding).fillMaxSize()) {
                items(sizeSystems) { system ->
                    ListItem(
                        headlineContent = { Text(system.name, fontWeight = FontWeight.Bold) },
                        supportingContent = { Text("${system.options.size} tallas definidas") },
                        trailingContent = {
                            Row {
                                IconButton(onClick = { /* Edit system name */ }) {
                                    Icon(Icons.Default.Edit, contentDescription = null)
                                }
                                IconButton(onClick = { viewModel.deleteSizeSystem(context, system.id) }) {
                                    Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red)
                                }
                            }
                        },
                        modifier = Modifier.clickable { selectedSystem = system }
                    )
                    HorizontalDivider()
                }
            }
        } else {
            val system = selectedSystem!!
            LazyColumn(modifier = Modifier.padding(padding).fillMaxSize()) {
                items(system.options) { option ->
                    SizeOptionRow(
                        option = option,
                        onDelete = { showDeleteConfirm = system.id to option }
                    )
                    HorizontalDivider()
                }
            }
        }
    }

    if (showAddSystemDialog) {
        var name by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { showAddSystemDialog = false },
            title = { Text("Nuevo Tipo de Talla Global") },
            text = {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Nombre (ej. Calzado)") })
            },
            confirmButton = {
                Button(onClick = {
                    if (name.isNotBlank()) {
                        viewModel.addSizeSystem(context, name)
                        showAddSystemDialog = false
                    }
                }) { Text("Crear") }
            },
            dismissButton = { TextButton(onClick = { showAddSystemDialog = false }) { Text("Cancelar") } }
        )
    }

    if (showAddOptionDialog && selectedSystem != null) {
        var name by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { showAddOptionDialog = false },
            title = { Text("Nueva Talla Global") },
            text = {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Nombre (ej. XXL)") })
            },
            confirmButton = {
                Button(onClick = {
                    if (name.isNotBlank()) {
                        viewModel.addGlobalSizeOption(context, selectedSystem!!.id, name)
                        showAddOptionDialog = false
                    }
                }) { Text("Agregar") }
            },
            dismissButton = { TextButton(onClick = { showAddOptionDialog = false }) { Text("Cancelar") } }
        )
    }

    showDeleteConfirm?.let { (sysId, option) ->
        val inUse = viewModel.isSizeInUse(option.name)
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = null },
            title = { Text(if (inUse) "Talla en Uso" else "Eliminar Talla") },
            text = {
                if (inUse) {
                    Text("Esta talla está siendo utilizada por uno o más productos. Si la eliminas, los productos podrían mostrar información inconsistente. ¿Estás seguro?")
                } else {
                    Text("¿Deseas eliminar la talla '${option.name}' del catálogo global?")
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.removeGlobalSizeOption(context, sysId, option.id)
                        showDeleteConfirm = null
                    },
                    colors = if (inUse) ButtonDefaults.buttonColors(containerColor = Color.Red) else ButtonDefaults.buttonColors()
                ) { Text("Eliminar") }
            },
            dismissButton = { TextButton(onClick = { showDeleteConfirm = null }) { Text("Cancelar") } }
        )
    }
}

@Composable
fun SizeOptionRow(option: SizeOption, onDelete: () -> Unit) {
    val sdf = remember { SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()) }
    val dateStr = remember(option.createdAt) { sdf.format(Date(option.createdAt)) }

    ListItem(
        headlineContent = { Text(option.name, fontWeight = FontWeight.Bold) },
        supportingContent = {
            Column {
                Text("Creado por: ${option.creatorName ?: "Admin"}", style = MaterialTheme.typography.bodySmall)
                Text("Fecha: $dateStr", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
            }
        },
        trailingContent = {
            IconButton(onClick = onDelete) {
                Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red)
            }
        }
    )
}
