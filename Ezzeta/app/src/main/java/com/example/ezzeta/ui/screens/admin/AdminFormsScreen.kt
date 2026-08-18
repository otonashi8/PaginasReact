package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ezzeta.data.model.CustomerForm
import com.example.ezzeta.data.model.FormStatus
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminFormsScreen(viewModel: MainViewModel, onBack: () -> Unit) {
    val forms by viewModel.customerForms.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    var statusFilter by remember { mutableStateOf<FormStatus?>(null) }
    
    val context = LocalContext.current
    var selectedForm by remember { mutableStateOf<CustomerForm?>(null) }
    var formToDelete by remember { mutableStateOf<CustomerForm?>(null) }

    val filteredForms = remember(forms, searchQuery, statusFilter) {
        forms.filter { form ->
            val matchesQuery = searchQuery.isBlank() || 
                form.userName?.contains(searchQuery, ignoreCase = true) == true ||
                form.userEmail?.contains(searchQuery, ignoreCase = true) == true ||
                form.subject.contains(searchQuery, ignoreCase = true) ||
                form.type.contains(searchQuery, ignoreCase = true)
            
            val matchesStatus = statusFilter == null || form.status == statusFilter
            
            matchesQuery && matchesStatus
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestión de Formularios", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            // Buscador y Filtros
            Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Buscar...") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(8.dp),
                    singleLine = true
                )
                
                var expanded by remember { mutableStateOf(false) }
                Box {
                    IconButton(onClick = { expanded = true }) {
                        Icon(Icons.Default.FilterList, contentDescription = "Filtrar por estado", tint = if (statusFilter != null) MaterialTheme.colorScheme.primary else Color.Gray)
                    }
                    DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                        DropdownMenuItem(text = { Text("Todos") }, onClick = { statusFilter = null; expanded = false })
                        FormStatus.entries.forEach { status ->
                            DropdownMenuItem(text = { Text(status.name.replace("_", " ")) }, onClick = { statusFilter = status; expanded = false })
                        }
                    }
                }
            }

            if (filteredForms.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No se encontraron formularios.", color = Color.Gray)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredForms, key = { it.id }) { form ->
                        FormItemCard(
                            form = form,
                            onClick = { selectedForm = form },
                            onDelete = { formToDelete = form }
                        )
                    }
                }
            }
        }
    }

    // Diálogo de Detalle
    if (selectedForm != null) {
        FormDetailDialog(
            form = selectedForm!!,
            viewModel = viewModel,
            onDismiss = { selectedForm = null }
        )
    }

    // Diálogo de Eliminación
    if (formToDelete != null) {
        AlertDialog(
            onDismissRequest = { formToDelete = null },
            title = { Text("Eliminar Formulario") },
            text = { Text("¿Estás seguro de que deseas eliminar este formulario? Esta acción no se puede deshacer.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.deleteCustomerForm(context, formToDelete!!.id)
                        formToDelete = null
                    },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Eliminar")
                }
            },
            dismissButton = {
                TextButton(onClick = { formToDelete = null }) {
                    Text("Cancelar")
                }
            }
        )
    }
}

@Composable
fun FormItemCard(
    form: CustomerForm,
    onClick: () -> Unit,
    onDelete: () -> Unit
) {
    val dateFormat = remember { SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()) }
    val dateStr = dateFormat.format(Date(form.createdAt))

    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(text = form.type, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                Text(text = form.subject, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, maxLines = 1)
                Text(text = "Por: ${form.userName ?: "Invitado"}", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                Text(text = dateStr, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            }
            
            FormStatusBadge(form.status)
            
            IconButton(onClick = onDelete) {
                Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = MaterialTheme.colorScheme.error.copy(alpha = 0.6f))
            }
        }
    }
}

@Composable
fun FormStatusBadge(status: FormStatus) {
    val color = when (status) {
        FormStatus.SIN_REVISAR -> Color(0xFFFFA000)
        FormStatus.REVISADO -> Color(0xFF1976D2)
        FormStatus.SOLUCIONADO -> Color(0xFF388E3C)
    }
    Surface(
        color = color.copy(alpha = 0.1f),
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.5f))
    ) {
        Text(
            text = status.name.replace("_", " "),
            color = color,
            style = MaterialTheme.typography.labelSmall,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            fontWeight = FontWeight.Bold
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FormDetailDialog(
    form: CustomerForm,
    viewModel: MainViewModel,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val dateFormat = remember { SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault()) }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Detalle de Formulario", fontWeight = FontWeight.Bold) },
        text = {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item { FormDetailRow("ID", form.id) }
                item { FormDetailRow("Tipo", form.type) }
                item { FormDetailRow("Asunto", form.subject) }
                item { FormDetailRow("Mensaje", form.description) }
                item { FormDetailRow("Usuario", form.userName ?: "Invitado") }
                item { FormDetailRow("ID Usuario", form.userId ?: "N/A") }
                item { FormDetailRow("Email", form.userEmail ?: "No proporcionado") }
                item { FormDetailRow("Enviado el", dateFormat.format(Date(form.createdAt))) }
                item {
                    Text("Cambiar Estado", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge)
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        FormStatus.entries.forEach { status ->
                            val isSelected = form.status == status
                            FilterChip(
                                selected = isSelected,
                                onClick = { 
                                    viewModel.updateCustomerFormStatus(context, form.id, status)
                                    onDismiss()
                                },
                                label = { Text(status.name.replace("_", " "), fontSize = 10.sp) }
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text("Cerrar") }
        }
    )
}

@Composable
fun FormDetailRow(label: String, value: String) {
    Column {
        Text(text = label, style = MaterialTheme.typography.labelSmall, color = Color.Gray, fontWeight = FontWeight.Bold)
        Text(text = value, style = MaterialTheme.typography.bodyMedium)
        HorizontalDivider(modifier = Modifier.padding(top = 4.dp).alpha(0.3f))
    }
}
