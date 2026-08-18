package com.example.ezzeta.ui.screens.admin

import androidx.compose.animation.*
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ezzeta.ui.viewmodel.MainViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminDashboardScreen(
    viewModel: MainViewModel,
    onLogout: () -> Unit,
    onNavigateToProductManagement: (String) -> Unit,
    onNavigateToCategoryManagement: () -> Unit,
    onNavigateToSizeManagement: () -> Unit,
    onNavigateToClientSizes: () -> Unit,
    onNavigateToMarketplaceRequests: () -> Unit,
    onNavigateToShippingManagement: () -> Unit,
    onNavigateToPriceRules: () -> Unit,
    onNavigateToStats: () -> Unit,
    onNavigateToCustomers: () -> Unit,
    onNavigateToAbandonedCarts: () -> Unit,
    onNavigateToAdminUsers: () -> Unit,
    onNavigateToAdminRoles: () -> Unit,
    onNavigateToAdminForms: () -> Unit,
    onNavigateToWordModeration: () -> Unit,
    onNavigateToReports: () -> Unit
) {
    val context = LocalContext.current
    val ezzetaCount by viewModel.ezzetaProductsCount.collectAsState()
    val clientCount by viewModel.clientProductsCount.collectAsState()
    val orders by viewModel.orders.collectAsState()
    val totalSales by viewModel.totalSalesValue.collectAsState()
    val groupsExpanded by viewModel.adminGroupsExpanded.collectAsState()

    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    
    val stats = remember(ezzetaCount, clientCount, orders, totalSales) {
        val totalSalesText = try {
            val safeSales = if (totalSales.isNaN() || totalSales.isInfinite()) 0.0 else totalSales
            "S/ ${String.format(java.util.Locale.US, "%.2f", safeSales)}"
        } catch (e: Exception) {
            "S/ 0.00"
        }
        
        mutableListOf<StatItem>().apply {
            if (viewModel.hasPermission("Productos Tienda", "VIEW"))
                add(StatItem("Productos Tienda", ezzetaCount.toString(), Icons.Default.Inventory))
            if (viewModel.hasPermission("Productos Clientes", "VIEW"))
                add(StatItem("Productos Clientes", clientCount.toString(), Icons.Default.Storefront))
            if (viewModel.hasPermission("Pedidos", "VIEW"))
                add(StatItem("Pedidos Totales", (orders?.size ?: 0).toString(), Icons.Default.Receipt))
            if (viewModel.hasPermission("Estadísticas", "VIEW"))
                add(StatItem("Ventas Totales", totalSalesText, Icons.Default.AttachMoney))
        }
    }

    val adminGroups = remember(groupsExpanded) {
        listOf(
            AdminGroup(
                key = "sistema",
                title = "Sistema",
                icon = Icons.Default.Settings,
                modules = mutableListOf<AdminAction>().apply {
                    if (viewModel.hasPermission("Reglas de Precios", "VIEW"))
                        add(AdminAction("Reglas de precios", Icons.Default.Discount, onNavigateToPriceRules))
                    if (viewModel.hasPermission("Sistema", "VIEW")) {
                        add(AdminAction("Gestión de Usuarios", Icons.Default.Person, onNavigateToAdminUsers))
                        add(AdminAction("Gestión de Roles", Icons.Default.Security, onNavigateToAdminRoles))
                        add(AdminAction("Moderación de palabras", Icons.Default.Gavel, onNavigateToWordModeration))
                    }
                }
            ),
            AdminGroup(
                key = "ventas",
                title = "Ventas",
                icon = Icons.Default.PointOfSale,
                modules = mutableListOf<AdminAction>().apply {
                    if (viewModel.hasPermission("Estadísticas", "VIEW"))
                        add(AdminAction("Estadísticas de Ventas", Icons.Default.BarChart, onNavigateToStats))
                    if (viewModel.hasPermission("Carritos Abandonados", "VIEW"))
                        add(AdminAction("Carritos abandonados", Icons.Default.ShoppingCartCheckout, onNavigateToAbandonedCarts))
                    if (viewModel.hasPermission("Envíos", "VIEW"))
                        add(AdminAction("Gestión de Envíos", Icons.Default.LocalShipping, onNavigateToShippingManagement))
                }
            ),
            AdminGroup(
                key = "clientes",
                title = "Clientes",
                icon = Icons.Default.Groups,
                modules = mutableListOf<AdminAction>().apply {
                    if (viewModel.hasPermission("Clientes", "VIEW"))
                        add(AdminAction("Información de Clientes", Icons.Default.Groups, onNavigateToCustomers))
                    if (viewModel.hasPermission("Tallas Clientes", "VIEW"))
                        add(AdminAction("Tallas Clientes", Icons.Default.PeopleOutline, onNavigateToClientSizes))
                }
            ),
            AdminGroup(
                key = "marketplace",
                title = "Marketplace",
                icon = Icons.Default.Storefront,
                modules = mutableListOf<AdminAction>().apply {
                    if (viewModel.hasPermission("Productos Clientes", "VIEW"))
                        add(AdminAction("Productos Clientes", Icons.Default.Storefront, { onNavigateToProductManagement("client") }))
                    if (viewModel.hasPermission("Marketplace", "VIEW"))
                        add(AdminAction("Solicitudes Marketplace", Icons.Default.PendingActions, onNavigateToMarketplaceRequests))
                    if (viewModel.hasPermission("Reportes", "VIEW"))
                        add(AdminAction("Reportes de Abuso", Icons.Default.Flag, onNavigateToReports))
                }
            ),
            AdminGroup(
                key = "soporte",
                title = "Soporte",
                icon = Icons.Default.SupportAgent,
                modules = mutableListOf<AdminAction>().apply {
                    if (viewModel.hasPermission("Formularios", "VIEW"))
                        add(AdminAction("Formularios", Icons.Default.Description, onNavigateToAdminForms))
                }
            ),
            AdminGroup(
                key = "inventario",
                title = "Inventario",
                icon = Icons.Default.Inventory2,
                modules = mutableListOf<AdminAction>().apply {
                    if (viewModel.hasPermission("Productos Tienda", "VIEW"))
                        add(AdminAction("Productos Tienda", Icons.Default.Inventory2, { onNavigateToProductManagement("store") }))
                    if (viewModel.hasPermission("Categorías", "VIEW"))
                        add(AdminAction("Gestión Categorías", Icons.Default.Category, onNavigateToCategoryManagement))
                    if (viewModel.hasPermission("Tallas", "VIEW"))
                        add(AdminAction("Gestión Tallas", Icons.Default.Straighten, onNavigateToSizeManagement))
                }
            )
        ).filter { it.modules.isNotEmpty() }
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    "Panel Administrador",
                    modifier = Modifier.padding(16.dp),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                HorizontalDivider()
                
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                ) {
                    adminGroups.forEach { group ->
                        Text(
                            text = group.title.uppercase(),
                            modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp),
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold
                        )
                        group.modules.forEach { action ->
                            NavigationDrawerItem(
                                label = { Text(action.label) },
                                selected = false,
                                onClick = {
                                    scope.launch { drawerState.close() }
                                    action.onClick()
                                },
                                icon = { Icon(action.icon, contentDescription = null) },
                                modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding)
                            )
                        }
                        HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp).alpha(0.3f))
                    }
                }

                NavigationDrawerItem(
                    label = { Text("Cerrar Sesión") },
                    selected = false,
                    onClick = {
                        scope.launch { drawerState.close() }
                        onLogout()
                    },
                    icon = { Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = null) },
                    modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding)
                )
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Panel Administrativo", fontWeight = FontWeight.Bold) },
                    navigationIcon = {
                        IconButton(onClick = { scope.launch { drawerState.open() } }) {
                            Icon(Icons.Default.Menu, contentDescription = "Menú")
                        }
                    },
                    actions = {
                        IconButton(onClick = onLogout) {
                            Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = "Cerrar sesión")
                        }
                    }
                )
            }
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp)
            ) {
                Text(
                    text = "Resumen del Sistema",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                // Grid de estadísticas (se mantiene arriba)
                Box(modifier = Modifier.height(200.dp)) {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxSize(),
                        userScrollEnabled = false // El scroll es del padre
                    ) {
                        items(stats) { item ->
                            StatCard(item)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "Módulos de Gestión",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                // Grupos de Módulos
                adminGroups.forEach { group ->
                    val isExpanded = groupsExpanded[group.key] ?: false
                    AdminModuleGroup(
                        group = group,
                        isExpanded = isExpanded,
                        onToggle = { viewModel.toggleAdminGroup(context, group.key) }
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }
                
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
fun AdminModuleGroup(
    group: AdminGroup,
    isExpanded: Boolean,
    onToggle: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        )
    ) {
        Column {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onToggle() }
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = group.icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(16.dp))
                Text(
                    text = group.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                Icon(
                    imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = if (isExpanded) "Contraer" else "Expandir",
                    tint = Color.Gray
                )
            }

            AnimatedVisibility(
                visible = isExpanded,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                Column(
                    modifier = Modifier
                        .padding(horizontal = 16.dp)
                        .padding(bottom = 16.dp)
                ) {
                    group.modules.forEach { action ->
                        AdminActionItem(action)
                    }
                }
            }
        }
    }
}

@Composable
fun AdminActionItem(action: AdminAction) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clickable { action.onClick() },
        color = Color.Transparent
    ) {
        Row(
            modifier = Modifier.padding(vertical = 8.dp, horizontal = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = action.icon,
                contentDescription = null,
                modifier = Modifier.size(20.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = action.label,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun StatCard(item: StatItem) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        )
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(item.icon, contentDescription = null, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = item.label, style = MaterialTheme.typography.labelSmall, maxLines = 1, fontSize = 10.sp)
            Text(text = item.value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        }
    }
}

data class AdminGroup(
    val key: String,
    val title: String,
    val icon: ImageVector,
    val modules: List<AdminAction>
)

data class StatItem(val label: String, val value: String, val icon: ImageVector)
data class AdminAction(val label: String, val icon: ImageVector, val onClick: () -> Unit)
