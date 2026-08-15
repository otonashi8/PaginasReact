package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
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
    onNavigateToAbandonedCarts: () -> Unit
) {
    val ezzetaCount by viewModel.ezzetaProductsCount.collectAsState()
    val clientCount by viewModel.clientProductsCount.collectAsState()
    val orders by viewModel.orders.collectAsState()
    val totalSales by viewModel.totalSalesValue.collectAsState()

    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    
    val stats = remember(ezzetaCount, clientCount, orders, totalSales) {
        val totalSalesText = try {
            val safeSales = if (totalSales.isNaN() || totalSales.isInfinite()) 0.0 else totalSales
            "S/ ${String.format(java.util.Locale.US, "%.2f", safeSales)}"
        } catch (e: Exception) {
            "S/ 0.00"
        }
        
        listOf(
            StatItem("Productos Tienda", ezzetaCount.toString(), Icons.Default.Inventory),
            StatItem("Productos Clientes", clientCount.toString(), Icons.Default.Storefront),
            StatItem("Pedidos Totales", (orders?.size ?: 0).toString(), Icons.Default.Receipt),
            StatItem("Ventas Totales", totalSalesText, Icons.Default.AttachMoney)
        )
    }

    val adminActions = listOf(
        AdminAction("Productos Tienda", Icons.Default.Inventory2, { onNavigateToProductManagement("store") }),
        AdminAction("Productos Clientes", Icons.Default.Storefront, { onNavigateToProductManagement("client") }),
        AdminAction("Solicitudes Marketplace", Icons.Default.PendingActions, onNavigateToMarketplaceRequests),
        AdminAction("Estadísticas de Ventas", Icons.Default.BarChart, onNavigateToStats),
        AdminAction("Información de Clientes", Icons.Default.Groups, onNavigateToCustomers),
        AdminAction("Carritos abandonados", Icons.Default.ShoppingCartCheckout, onNavigateToAbandonedCarts),
        AdminAction("Gestión Categorías", Icons.Default.Category, onNavigateToCategoryManagement),
        AdminAction("Gestión Tallas", Icons.Default.Straighten, onNavigateToSizeManagement),
        AdminAction("Tallas Clientes", Icons.Default.PeopleOutline, onNavigateToClientSizes),
        AdminAction("Gestión de Envíos", Icons.Default.LocalShipping, onNavigateToShippingManagement),
        AdminAction("Reglas de precios", Icons.Default.Discount, onNavigateToPriceRules),
        AdminAction("Configuración", Icons.Default.Settings, {})
    )

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    "Acciones Administrativas",
                    modifier = Modifier.padding(16.dp),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                HorizontalDivider()
                adminActions.forEach { action ->
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
                Spacer(modifier = Modifier.weight(1f))
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
                    .padding(16.dp)
            ) {
                Text(
                    text = "Resumen del Sistema",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(stats) { item ->
                        StatCard(item)
                    }
                }
            }
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
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(item.icon, contentDescription = null, modifier = Modifier.size(24.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = item.label, style = MaterialTheme.typography.labelMedium)
            Text(text = item.value, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        }
    }
}

data class StatItem(val label: String, val value: String, val icon: ImageVector)
data class AdminAction(val label: String, val icon: ImageVector, val onClick: () -> Unit)
