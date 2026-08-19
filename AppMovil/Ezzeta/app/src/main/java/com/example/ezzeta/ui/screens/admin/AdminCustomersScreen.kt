package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ezzeta.data.model.User
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminCustomersScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val allCustomers by viewModel.allCustomers.collectAsState()
    val context = LocalContext.current
    
    var searchQuery by remember { mutableStateOf("") }
    var filterType by remember { mutableStateOf("ALL") } // ALL, REG, GUEST
    var filterStatus by remember { mutableStateOf("ALL") } // ALL, ACTIVE, INACTIVE
    
    val filteredList = remember(allCustomers, searchQuery, filterType, filterStatus) {
        allCustomers.filter { user ->
            val matchesSearch = user.alias.contains(searchQuery, ignoreCase = true) || 
                               (user.email?.contains(searchQuery, ignoreCase = true) == true) ||
                               (user.phone?.contains(searchQuery, ignoreCase = true) == true)
            
            val matchesType = when(filterType) {
                "REG" -> !user.isGuest
                "GUEST" -> user.isGuest
                else -> true
            }
            
            val matchesStatus = when(filterStatus) {
                "ACTIVE" -> user.isActive
                "INACTIVE" -> !user.isActive
                else -> true
            }
            
            matchesSearch && matchesType && matchesStatus
        }
    }

    var selectedUserForDetail by remember { mutableStateOf<User?>(null) }
    var selectedUserForEdit by remember { mutableStateOf<User?>(null) }
    var showCreateDialog by remember { mutableStateOf(false) }

    if (selectedUserForDetail != null) {
        ModalBottomSheet(onDismissRequest = { selectedUserForDetail = null }) {
            AdminCustomerDetailView(user = selectedUserForDetail!!, viewModel = viewModel, onClose = { selectedUserForDetail = null })
        }
    }

    if (selectedUserForEdit != null) {
        AdminCustomerEditDialog(user = selectedUserForEdit, viewModel = viewModel, onDismiss = { selectedUserForEdit = null })
    }

    if (showCreateDialog) {
        AdminCustomerEditDialog(user = null, viewModel = viewModel, onDismiss = { showCreateDialog = false })
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestión de Clientes", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                },
                actions = {
                    IconButton(onClick = { showCreateDialog = true }) {
                        Icon(Icons.Default.PersonAdd, contentDescription = "Nuevo Cliente")
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            // Search and Filters
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                placeholder = { Text("Buscar por nombre, correo o teléfono...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                shape = RoundedCornerShape(25.dp),
                singleLine = true
            )

            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = filterType == "ALL",
                    onClick = { filterType = "ALL" },
                    label = { Text("Todos") }
                )
                FilterChip(
                    selected = filterType == "REG",
                    onClick = { filterType = "REG" },
                    label = { Text("Registrados") }
                )
                FilterChip(
                    selected = filterType == "GUEST",
                    onClick = { filterType = "GUEST" },
                    label = { Text("Invitados") }
                )
            }

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredList) { user ->
                    CustomerManagementItem(
                        user = user,
                        viewModel = viewModel,
                        onClick = { selectedUserForDetail = user },
                        onEdit = { selectedUserForEdit = user },
                        onToggleStatus = { viewModel.adminToggleUserStatus(context, user.uuid) }
                    )
                }
            }
        }
    }
}

@Composable
fun CustomerManagementItem(
    user: User,
    viewModel: MainViewModel,
    onClick: () -> Unit,
    onEdit: () -> Unit,
    onToggleStatus: () -> Unit
) {
    val orders = remember(user) { viewModel.getCustomerOrders(user.uuid.ifBlank { user.email ?: "" }) }
    val totalSpent = remember(orders) { orders.sumOf { it.total } }

    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = onClick,
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier.size(40.dp).background(MaterialTheme.colorScheme.primaryContainer, RoundedCornerShape(20.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(if (user.isGuest) Icons.Default.PersonOutline else Icons.Default.Person, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            }
            
            Column(modifier = Modifier.weight(1f).padding(start = 12.dp)) {
                Text(text = user.alias.ifBlank { "Invitado" }, fontWeight = FontWeight.Bold, maxLines = 1)
                Text(text = user.email ?: "Sin correo", style = MaterialTheme.typography.bodySmall, color = Color.Gray, maxLines = 1)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Badge(containerColor = if (user.isActive) Color(0xFFE8F5E9) else Color(0xFFFFEBEE)) {
                        Text(
                            text = if (user.isActive) "ACTIVO" else "INACTIVO",
                            color = if (user.isActive) Color(0xFF2E7D32) else Color.Red,
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "${orders.size} pedidos • S/ ${String.format(Locale.US, "%.2f", totalSpent)}", style = MaterialTheme.typography.labelSmall)
                }
            }
            
            if (!user.isGuest) {
                IconButton(onClick = onEdit) {
                    Icon(Icons.Default.Edit, contentDescription = "Editar", modifier = Modifier.size(20.dp))
                }
                IconButton(onClick = onToggleStatus) {
                    Icon(
                        imageVector = if (user.isActive) Icons.Default.Block else Icons.Default.CheckCircle,
                        contentDescription = "Cambiar estado",
                        tint = if (user.isActive) Color.Red else Color(0xFF2E7D32),
                        modifier = Modifier.size(20.dp)
                    )
                }
            } else {
                Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color.LightGray)
            }
        }
    }
}
