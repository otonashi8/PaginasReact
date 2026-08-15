package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ezzeta.data.model.MarketplaceRequest
import com.example.ezzeta.data.model.RequestStatus
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminMarketplaceRequestsScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit,
    onNavigateToDetail: (String) -> Unit
) {
    val requests by viewModel.marketplaceRequests.collectAsState()
    var selectedFilter by remember { mutableStateOf<RequestStatus?>(null) }
    
    val filteredRequests = remember(requests, selectedFilter) {
        if (selectedFilter == null) requests else requests.filter { it.status == selectedFilter }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Solicitudes Marketplace") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            // Filtros
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = selectedFilter == null,
                    onClick = { selectedFilter = null },
                    label = { Text("Todas") }
                )
                FilterChip(
                    selected = selectedFilter == RequestStatus.PENDING,
                    onClick = { selectedFilter = RequestStatus.PENDING },
                    label = { Text("Pendientes") }
                )
                FilterChip(
                    selected = selectedFilter == RequestStatus.APPROVED,
                    onClick = { selectedFilter = RequestStatus.APPROVED },
                    label = { Text("Aprobadas") }
                )
                FilterChip(
                    selected = selectedFilter == RequestStatus.REJECTED,
                    onClick = { selectedFilter = RequestStatus.REJECTED },
                    label = { Text("Rechazadas") }
                )
            }

            if (filteredRequests.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No hay solicitudes que mostrar.", color = Color.Gray)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredRequests, key = { it.id }) { request ->
                        RequestListItem(request, onClick = { onNavigateToDetail(request.id) })
                    }
                }
            }
        }
    }
}

@Composable
fun RequestListItem(request: MarketplaceRequest, onClick: () -> Unit) {
    val dateFormat = remember { SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()) }
    val dateString = dateFormat.format(Date(request.createdAt))

    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = request.product.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Vendedor: ${request.userName}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
                Text(
                    text = "Fecha: $dateString",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }
            
            StatusBadge(request.status)
            
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = Color.LightGray,
                modifier = Modifier.padding(start = 8.dp)
            )
        }
    }
}

@Composable
fun StatusBadge(status: RequestStatus) {
    val (color, text) = when (status) {
        RequestStatus.PENDING -> Color(0xFFFFA000) to "Pendiente"
        RequestStatus.APPROVED -> Color(0xFF2E7D32) to "Aprobada"
        RequestStatus.REJECTED -> Color(0xFFC62828) to "Rechazada"
    }

    Surface(
        color = color.copy(alpha = 0.1f),
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.5f))
    ) {
        Text(
            text = text,
            color = color,
            style = MaterialTheme.typography.labelSmall,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
            fontWeight = FontWeight.Bold
        )
    }
}
