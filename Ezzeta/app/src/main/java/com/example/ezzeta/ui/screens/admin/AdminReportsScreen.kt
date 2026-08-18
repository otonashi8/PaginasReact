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
import com.example.ezzeta.data.model.MarketplaceReport
import com.example.ezzeta.data.model.ReportStatus
import com.example.ezzeta.data.model.ReportType
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun AdminReportsScreen(viewModel: MainViewModel, onBack: () -> Unit) {
    val reports by viewModel.marketplaceReports.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    var statusFilter by remember { mutableStateOf<ReportStatus?>(null) }
    var typeFilter by remember { mutableStateOf<ReportType?>(null) }
    
    val context = LocalContext.current
    var selectedReport by remember { mutableStateOf<MarketplaceReport?>(null) }
    var reportToDelete by remember { mutableStateOf<MarketplaceReport?>(null) }

    val filteredReports = remember(reports, searchQuery, statusFilter, typeFilter) {
        reports.filter { report ->
            val matchesQuery = searchQuery.isBlank() || 
                report.productName.contains(searchQuery, ignoreCase = true) ||
                report.productId.contains(searchQuery, ignoreCase = true) ||
                report.sellerName.contains(searchQuery, ignoreCase = true) ||
                report.reporterName.contains(searchQuery, ignoreCase = true) ||
                report.reporterEmail.contains(searchQuery, ignoreCase = true) ||
                report.type.displayName.contains(searchQuery, ignoreCase = true)
            
            val matchesStatus = statusFilter == null || report.status == statusFilter
            val matchesType = typeFilter == null || report.type == typeFilter
            
            matchesQuery && matchesStatus && matchesType
        }.sortedByDescending { it.createdAt }
    }

    val stats = remember(reports) {
        val total = reports.size
        val sinRevisar = reports.count { it.status == ReportStatus.SIN_REVISAR }
        val enRevision = reports.count { it.status == ReportStatus.EN_REVISION }
        val resuelto = reports.count { it.status == ReportStatus.RESUELTO }
        val descartado = reports.count { it.status == ReportStatus.DESCARTADO }
        listOf(
            "Total" to total,
            "Sin revisar" to sinRevisar,
            "En revisión" to enRevision,
            "Resueltos" to resuelto,
            "Descartados" to descartado
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Reportes de Marketplace", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            // Contadores rápidos
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                stats.forEach { (label, value) ->
                    Card(
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Column(modifier = Modifier.padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(text = value.toString(), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                            Text(text = label, style = MaterialTheme.typography.labelSmall, maxLines = 1, fontSize = 9.sp)
                        }
                    }
                }
            }

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
                
                var showFilters by remember { mutableStateOf(false) }
                Box {
                    IconButton(onClick = { showFilters = true }) {
                        Icon(
                            Icons.Default.FilterList, 
                            contentDescription = "Filtros", 
                            tint = if (statusFilter != null || typeFilter != null) MaterialTheme.colorScheme.primary else Color.Gray
                        )
                    }
                    DropdownMenu(expanded = showFilters, onDismissRequest = { showFilters = false }) {
                        Text("Estado", modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp), fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelMedium)
                        DropdownMenuItem(text = { Text("Todos") }, onClick = { statusFilter = null; showFilters = false })
                        ReportStatus.entries.forEach { status ->
                            DropdownMenuItem(text = { Text(status.name.replace("_", " ")) }, onClick = { statusFilter = status; showFilters = false })
                        }
                        HorizontalDivider()
                        Text("Motivo", modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp), fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelMedium)
                        DropdownMenuItem(text = { Text("Todos") }, onClick = { typeFilter = null; showFilters = false })
                        ReportType.entries.forEach { type ->
                            DropdownMenuItem(text = { Text(type.displayName) }, onClick = { typeFilter = type; showFilters = false })
                        }
                    }
                }
            }

            if (filteredReports.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No se encontraron reportes.", color = Color.Gray)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredReports, key = { it.id }) { report ->
                        ReportItemCard(
                            report = report,
                            onClick = { selectedReport = report },
                            onDelete = { reportToDelete = report }
                        )
                    }
                }
            }
        }
    }

    if (selectedReport != null) {
        ReportDetailDialog(
            report = selectedReport!!,
            viewModel = viewModel,
            onDismiss = { selectedReport = null }
        )
    }

    if (reportToDelete != null) {
        AlertDialog(
            onDismissRequest = { reportToDelete = null },
            title = { Text("Eliminar Reporte") },
            text = { Text("¿Estás seguro de que deseas eliminar este reporte? Esta acción es irreversible y no afectará al producto ni al vendedor.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.deleteMarketplaceReport(context, reportToDelete!!.id)
                        reportToDelete = null
                    },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Eliminar")
                }
            },
            dismissButton = {
                TextButton(onClick = { reportToDelete = null }) {
                    Text("Cancelar")
                }
            }
        )
    }
}

@Composable
fun ReportItemCard(
    report: MarketplaceReport,
    onClick: () -> Unit,
    onDelete: () -> Unit
) {
    val dateFormat = remember { SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()) }
    val dateStr = dateFormat.format(Date(report.createdAt))

    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(text = report.type.displayName, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                Text(text = report.productName, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, maxLines = 1)
                Text(text = "Vendedor: ${report.sellerName}", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                Text(text = "Por: ${report.reporterName}", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                Text(text = dateStr, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            }
            
            ReportStatusBadge(report.status)
            
            IconButton(onClick = onDelete) {
                Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = MaterialTheme.colorScheme.error.copy(alpha = 0.6f))
            }
        }
    }
}

@Composable
fun ReportStatusBadge(status: ReportStatus) {
    val color = when (status) {
        ReportStatus.SIN_REVISAR -> Color(0xFFE53935)
        ReportStatus.EN_REVISION -> Color(0xFFFB8C00)
        ReportStatus.RESUELTO -> Color(0xFF43A047)
        ReportStatus.DESCARTADO -> Color(0xFF757575)
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

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun ReportDetailDialog(
    report: MarketplaceReport,
    viewModel: MainViewModel,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val dateFormat = remember { SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault()) }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Detalle del Reporte", fontWeight = FontWeight.Bold) },
        text = {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item { Text("PRODUCTO", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary) }
                item { ReportDetailRow("Nombre", report.productName) }
                item { ReportDetailRow("ID", report.productId) }
                item { ReportDetailRow("Vendedor", report.sellerName) }
                item { ReportDetailRow("ID Vendedor", report.sellerId) }
                
                item { Spacer(modifier = Modifier.height(8.dp)) }
                item { Text("REPORTANTE", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary) }
                item { ReportDetailRow("Nombre/Alias", report.reporterName) }
                item { ReportDetailRow("Email", report.reporterEmail) }
                item { ReportDetailRow("ID Reportante", report.reporterId) }

                item { Spacer(modifier = Modifier.height(8.dp)) }
                item { Text("DENUNCIA", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary) }
                item { ReportDetailRow("Motivo", report.type.displayName) }
                item { ReportDetailRow("Descripción", report.description ?: "(Sin descripción)") }
                item { ReportDetailRow("Fecha", dateFormat.format(Date(report.createdAt))) }
                
                item {
                    Text("GESTIÓN", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Cambiar Estado", style = MaterialTheme.typography.labelMedium, color = Color.Gray)
                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        ReportStatus.entries.forEach { status ->
                            val isSelected = report.status == status
                            FilterChip(
                                selected = isSelected,
                                onClick = { 
                                    viewModel.updateMarketplaceReportStatus(context, report.id, status)
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
fun ReportDetailRow(label: String, value: String) {
    Column {
        Text(text = label, style = MaterialTheme.typography.labelSmall, color = Color.Gray, fontWeight = FontWeight.Bold)
        Text(text = value, style = MaterialTheme.typography.bodyMedium)
        HorizontalDivider(modifier = Modifier.padding(top = 4.dp).alpha(0.3f))
    }
}
