package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ezzeta.data.model.User
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminUserManagementScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val adminUsers by viewModel.adminUsers.collectAsState()
    val roles by viewModel.adminRoles.collectAsState()
    
    var showEditDialog by remember { mutableStateOf<User?>(null) }
    var showCreateDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestión de Usuarios Administrativos") },
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
                    Icon(Icons.Default.Add, contentDescription = "Añadir Usuario")
                }
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(adminUsers) { user ->
                val userRole = roles.find { it.id == user.roleId }
                AdminUserItem(
                    user = user,
                    roleName = userRole?.name ?: "Sin Rol",
                    onEdit = { showEditDialog = user },
                    onToggleStatus = { viewModel.adminToggleUserStatus(context, user.uuid) }
                )
            }
        }
    }

    if (showCreateDialog) {
        AdminUserEditDialog(
            user = null,
            roles = roles,
            onDismiss = { showCreateDialog = false },
            onSave = { name, email, phone, roleId ->
                viewModel.adminCreateUser(context, name, email, phone, roleId, isAdminUser = true)
                showCreateDialog = false
            }
        )
    }

    showEditDialog?.let { user ->
        AdminUserEditDialog(
            user = user,
            roles = roles,
            onDismiss = { showEditDialog = null },
            onSave = { name, email, phone, roleId ->
                viewModel.adminUpdateUser(context, user.copy(alias = name, email = email, phone = phone, roleId = roleId))
                showEditDialog = null
            }
        )
    }
}

@Composable
fun AdminUserItem(
    user: User,
    roleName: String,
    onEdit: () -> Unit,
    onToggleStatus: () -> Unit
) {
    val dateFormat = remember { SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()) }
    val lastAccessText = user.lastAccess?.let { dateFormat.format(Date(it)) } ?: "Nunca"

    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.Person, 
                contentDescription = null, 
                modifier = Modifier.size(40.dp),
                tint = if (user.isActive) MaterialTheme.colorScheme.primary else Color.Gray
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = user.alias, fontWeight = FontWeight.Bold)
                Text(text = user.email ?: "Sin email", style = MaterialTheme.typography.bodySmall)
                Text(text = "Rol: $roleName", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.secondary)
                Text(text = "Último acceso: $lastAccessText", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            }
            
            Column(horizontalAlignment = Alignment.End) {
                IconButton(onClick = onEdit) {
                    Icon(Icons.Default.Edit, contentDescription = "Editar")
                }
                Switch(
                    checked = user.isActive,
                    onCheckedChange = { onToggleStatus() },
                    enabled = user.email != "admin" // No permitir desactivar al super admin
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminUserEditDialog(
    user: User?,
    roles: List<com.example.ezzeta.data.model.AdminRole>,
    onDismiss: () -> Unit,
    onSave: (String, String, String?, String?) -> Unit
) {
    var name by remember { mutableStateOf(user?.alias ?: "") }
    var email by remember { mutableStateOf(user?.email ?: "") }
    var phone by remember { mutableStateOf(user?.phone ?: "") }
    var roleId by remember { mutableStateOf(user?.roleId ?: roles.firstOrNull()?.id) }
    
    var roleExpanded by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (user == null) "Crear Usuario" else "Editar Usuario") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Nombre") })
                OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Usuario / Email") })
                OutlinedTextField(value = phone, onValueChange = { phone = it }, label = { Text("Teléfono") })
                
                ExposedDropdownMenuBox(
                    expanded = roleExpanded,
                    onExpandedChange = { roleExpanded = !roleExpanded }
                ) {
                    OutlinedTextField(
                        value = roles.find { it.id == roleId }?.name ?: "Seleccionar Rol",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Rol") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = roleExpanded) },
                        modifier = Modifier.menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = roleExpanded,
                        onDismissRequest = { roleExpanded = false }
                    ) {
                        roles.forEach { role ->
                            DropdownMenuItem(
                                text = { Text(role.name) },
                                onClick = {
                                    roleId = role.id
                                    roleExpanded = false
                                }
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = { onSave(name, email, phone, roleId) }) {
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
