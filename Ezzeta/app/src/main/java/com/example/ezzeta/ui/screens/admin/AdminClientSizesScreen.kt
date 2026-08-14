package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ezzeta.data.model.SizeOption
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminClientSizesScreen(viewModel: MainViewModel, onBack: () -> Unit) {
    val clientSizes by viewModel.allClientCustomSizes.collectAsState()
    var sizeToEdit by remember { mutableStateOf<SizeOption?>(null) }
    var showDeleteConfirm by remember { mutableStateOf<SizeOption?>(null) }
    
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Tallas Clientes", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                }
            )
        }
    ) { padding ->
        if (clientSizes.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = androidx.compose.ui.Alignment.Center) {
                Text("No hay tallas personalizadas creadas por usuarios.", color = Color.Gray)
            }
        } else {
            LazyColumn(modifier = Modifier.padding(padding).fillMaxSize()) {
                items(clientSizes) { option ->
                    val sdf = remember { SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()) }
                    val dateStr = remember(option.createdAt) { sdf.format(Date(option.createdAt)) }

                    ListItem(
                        headlineContent = { Text(option.name, fontWeight = FontWeight.Bold) },
                        supportingContent = {
                            Column {
                                Text("Vendedor: ${option.creatorName ?: "Desconocido"}", style = MaterialTheme.typography.bodySmall)
                                Text("ID Usuario: ${option.createdByUserId ?: "N/A"}", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                                Text("Fecha: $dateStr", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                            }
                        },
                        trailingContent = {
                            Row {
                                IconButton(onClick = { sizeToEdit = option }) {
                                    Icon(Icons.Default.Edit, contentDescription = null)
                                }
                                IconButton(onClick = { showDeleteConfirm = option }) {
                                    Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red)
                                }
                            }
                        }
                    )
                    HorizontalDivider()
                }
            }
        }
    }

    if (sizeToEdit != null) {
        var name by remember { mutableStateOf(sizeToEdit!!.name) }
        AlertDialog(
            onDismissRequest = { sizeToEdit = null },
            title = { Text("Editar Talla de Cliente") },
            text = {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Nombre de la talla") })
            },
            confirmButton = {
                Button(onClick = {
                    if (name.isNotBlank()) {
                        viewModel.updateClientSize(context, sizeToEdit!!.copy(name = name))
                        sizeToEdit = null
                    }
                }) { Text("Guardar") }
            },
            dismissButton = { TextButton(onClick = { sizeToEdit = null }) { Text("Cancelar") } }
        )
    }

    showDeleteConfirm?.let { option ->
        val inUse = viewModel.isSizeInUse(option.name)
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = null },
            title = { Text(if (inUse) "Talla en Uso" else "Eliminar Talla") },
            text = {
                if (inUse) {
                    Text("Esta talla personalizada está siendo utilizada por productos. ¿Eliminar de todas formas?")
                } else {
                    Text("¿Deseas eliminar la talla '${option.name}' creada por ${option.creatorName}?")
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteUserCustomSize(context, option.id)
                        showDeleteConfirm = null
                    },
                    colors = if (inUse) ButtonDefaults.buttonColors(containerColor = Color.Red) else ButtonDefaults.buttonColors()
                ) { Text("Eliminar") }
            },
            dismissButton = { TextButton(onClick = { showDeleteConfirm = null }) { Text("Cancelar") } }
        )
    }
}
