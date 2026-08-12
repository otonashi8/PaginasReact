package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ezzeta.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminDashboardScreen(
    viewModel: MainViewModel,
    onLogout: () -> Unit,
    onNavigateToProductManagement: () -> Unit,
    onNavigateToCategoryManagement: () -> Unit
) {
    val products by viewModel.allProducts.collectAsState()
    val orders by viewModel.orders.collectAsState()
    
    val stats = listOf(
        StatItem("Productos", products.size.toString(), Icons.Default.Inventory),
        StatItem("Pedidos", orders.size.toString(), Icons.Default.Receipt),
        StatItem("Usuarios", "124", Icons.Default.People),
        StatItem("Ventas", "S/ 1,240", Icons.Default.AttachMoney)
    )

    val adminActions = listOf(
        AdminAction("Gestión Productos", Icons.Default.Edit, onNavigateToProductManagement),
        AdminAction("Categorías", Icons.Default.Category, onNavigateToCategoryManagement),
        AdminAction("Cupones", Icons.Default.LocalOffer, {}),
        AdminAction("Configuración", Icons.Default.Settings, {})
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Panel Administrativo", fontWeight = FontWeight.Bold) },
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
                modifier = Modifier.height(240.dp)
            ) {
                items(stats) { item ->
                    StatCard(item)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Acciones Rápidas",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.weight(1f)
            ) {
                items(adminActions) { action ->
                    ActionCard(action)
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

@Composable
fun ActionCard(action: AdminAction) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(100.dp),
        onClick = action.onClick
    ) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(action.icon, contentDescription = null)
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = action.label, fontWeight = FontWeight.Medium, fontSize = 14.sp)
            }
        }
    }
}

data class StatItem(val label: String, val value: String, val icon: ImageVector)
data class AdminAction(val label: String, val icon: ImageVector, val onClick: () -> Unit)
