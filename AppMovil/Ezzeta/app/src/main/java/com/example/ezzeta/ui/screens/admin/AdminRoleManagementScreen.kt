package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Security
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
import com.example.ezzeta.data.model.AdminPermission
import com.example.ezzeta.data.model.AdminRole
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminRoleManagementScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val roles by viewModel.adminRoles.collectAsState()
    
    var showEditDialog by remember { mutableStateOf<AdminRole?>(null) }
    var showCreateDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestión de Roles y Permisos") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                }
            )
        },
        floatingActionButton = {
            if (viewModel.hasPermission("Sistema", "CREATE")) {
                FloatingActionButton(onClick = { showCreateDialog = true }) {
                    Icon(Icons.Default.Add, contentDescription = "Añadir Rol")
                }
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(roles) { role ->
                AdminRoleItem(
                    role = role,
                    onEdit = { showEditDialog = role },
                    onDelete = { viewModel.deleteAdminRole(context, role.id) }
                )
            }
        }
    }

    if (showCreateDialog) {
        AdminRoleEditDialog(
            role = null,
            onDismiss = { showCreateDialog = false },
            onSave = { newRole ->
                viewModel.saveAdminRole(context, newRole)
                showCreateDialog = false
            }
        )
    }

    showEditDialog?.let { role ->
        AdminRoleEditDialog(
            role = role,
            onDismiss = { showEditDialog = null },
            onSave = { updatedRole ->
                viewModel.saveAdminRole(context, updatedRole)
                showEditDialog = null
            }
        )
    }
}

@Composable
fun AdminRoleItem(
    role: AdminRole,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.Security, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = role.name, fontWeight = FontWeight.Bold)
                Text(text = "${role.permissions.size} módulos configurados", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
            }
            IconButton(onClick = onEdit) {
                Icon(Icons.Default.Edit, contentDescription = "Editar")
            }
            IconButton(onClick = onDelete, enabled = !role.isProtected) {
                Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = if (role.isProtected) Color.Gray else Color.Red)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminRoleEditDialog(
    role: AdminRole?,
    onDismiss: () -> Unit,
    onSave: (AdminRole) -> Unit
) {
    var name by remember { mutableStateOf(role?.name ?: "") }
    
    val modules = listOf(
        "Dashboard", "Productos Tienda", "Productos Clientes", "Marketplace", "Clientes",
        "Pedidos", "Reglas de Precios", "Estadísticas", "Carritos Abandonados",
        "Categorías", "Tallas", "Tallas Clientes", "Envíos", "Sistema"
    )
    
    val permissions = remember { 
        mutableStateMapOf<String, AdminPermission>().apply {
            modules.forEach { module ->
                put(module, role?.permissions?.get(module) ?: AdminPermission())
            }
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (role == null) "Crear Rol" else "Editar Permisos: ${role.name}") },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                if (role == null) {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Nombre del Rol") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }
                
                Text("Permisos por Módulo", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)
                Spacer(modifier = Modifier.height(8.dp))
                
                LazyColumn(modifier = Modifier.heightIn(max = 400.dp)) {
                    items(modules) { module ->
                        val perm = permissions[module] ?: AdminPermission()
                        Column(modifier = Modifier.padding(vertical = 4.dp)) {
                            Text(module, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                PermissionCheckbox("VER", perm.view) { permissions[module] = perm.copy(view = it) }
                                PermissionCheckbox("CREA", perm.create) { permissions[module] = perm.copy(create = it) }
                                PermissionCheckbox("EDIT", perm.edit) { permissions[module] = perm.copy(edit = it) }
                                PermissionCheckbox("ELIM", perm.delete) { permissions[module] = perm.copy(delete = it) }
                            }
                            HorizontalDivider(modifier = Modifier.alpha(0.5f))
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val finalRole = role?.copy(name = name, permissions = permissions.toMap())
                        ?: AdminRole(id = UUID.randomUUID().toString(), name = name, permissions = permissions.toMap())
                    onSave(finalRole)
                },
                enabled = name.isNotBlank()
            ) {
                Text("Guardar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}

@Composable
fun PermissionCheckbox(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Checkbox(checked = checked, onCheckedChange = onCheckedChange, modifier = Modifier.size(32.dp))
        Text(label, style = MaterialTheme.typography.labelSmall, fontSize = 9.sp)
    }
}

