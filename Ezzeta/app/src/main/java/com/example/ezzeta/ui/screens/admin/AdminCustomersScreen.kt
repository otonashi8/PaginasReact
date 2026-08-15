package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ezzeta.data.model.CustomerStat
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminCustomersScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    var selectedRanking by remember { mutableStateOf(0) } // 0: Top Spenders, 1: Top Orders, 2: Top Sellers
    
    val topSpenders by viewModel.topSpenders.collectAsState()
    val topSellers by viewModel.topSellers.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Información de Clientes", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            SecondaryTabRow(selectedTabIndex = selectedRanking) {
                Tab(selected = selectedRanking == 0, onClick = { selectedRanking = 0 }) {
                    Text("Top Gasto", modifier = Modifier.padding(12.dp))
                }
                Tab(selected = selectedRanking == 1, onClick = { selectedRanking = 1 }) {
                    Text("Top Pedidos", modifier = Modifier.padding(12.dp))
                }
                Tab(selected = selectedRanking == 2, onClick = { selectedRanking = 2 }) {
                    Text("Top Vendedores", modifier = Modifier.padding(12.dp))
                }
            }

            val listToShow = when(selectedRanking) {
                0 -> topSpenders
                1 -> topSpenders.sortedByDescending { it.count }
                else -> topSellers
            }

            if (listToShow.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Sin datos disponibles", color = Color.Gray)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    itemsIndexed(listToShow) { index, stat ->
                        CustomerStatItem(index + 1, stat, isSellerMode = selectedRanking == 2)
                    }
                }
            }
        }
    }
}

@Composable
fun CustomerStatItem(rank: Int, stat: CustomerStat, isSellerMode: Boolean) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(text = "#$rank", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary, modifier = Modifier.width(40.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(text = stat.name.ifBlank { "Cliente Anon" }, fontWeight = FontWeight.Bold)
                Text(text = stat.email, style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                Text(text = if (isSellerMode) "${stat.count} unidades vendidas" else "${stat.count} pedidos realizados", style = MaterialTheme.typography.bodySmall)
            }
            
            Text(
                text = "S/ ${String.format(Locale.US, "%.2f", stat.totalValue)}",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.ExtraBold,
                color = if (isSellerMode) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.primary
            )
        }
    }
}
