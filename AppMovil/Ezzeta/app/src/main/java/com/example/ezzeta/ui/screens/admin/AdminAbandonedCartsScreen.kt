package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ezzeta.data.model.AbandonedCart
import com.example.ezzeta.data.model.AbandonedCartStatus
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminAbandonedCartsScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val carts by viewModel.abandonedCarts.collectAsState()
    val kpis by viewModel.abandonedCartKpis.collectAsState()
    
    var selectedCart by remember { mutableStateOf<AbandonedCart?>(null) }
    var statusFilter by remember { mutableStateOf<AbandonedCartStatus?>(null) }

    val filteredCarts = carts.filter { 
        (statusFilter == null || it.status == statusFilter) && it.status != AbandonedCartStatus.ACTIVE
    }.sortedByDescending { it.lastActivity }

    if (selectedCart != null) {
        AbandonedCartDetailDialog(cart = selectedCart!!, onDismiss = { selectedCart = null })
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Carritos Abandonados", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // KPIs
            item {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        KpiSmallCard("Recuperados", "${(kpis["RECUPERADOS_COUNT"] ?: 0.0).toInt()}", Modifier.weight(1f), Color(0xFFE8F5E9))
                        KpiSmallCard("Recuperables", "${(kpis["RECUPERABLES_COUNT"] ?: 0.0).toInt()}", Modifier.weight(1f), Color(0xFFE3F2FD))
                        KpiSmallCard("Perdidos", "${(kpis["PERDIDOS_COUNT"] ?: 0.0).toInt()}", Modifier.weight(1f), Color(0xFFFBE9E7))
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        KpiSmallCard("Ingresos Recup.", "S/ ${String.format(Locale.US, "%.2f", kpis["INGRESOS_RECUPERADOS"] ?: 0.0)}", Modifier.weight(1f), Color(0xFFC8E6C9))
                        KpiSmallCard("Tasa Recup.", "${String.format(Locale.US, "%.1f", kpis["TASA_RECUPERACION"] ?: 0.0)}%", Modifier.weight(1f), MaterialTheme.colorScheme.primaryContainer)
                    }
                }
            }

            item {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(
                        selected = statusFilter == null,
                        onClick = { statusFilter = null },
                        label = { Text("Todos") }
                    )
                    FilterChip(
                        selected = statusFilter == AbandonedCartStatus.RECUPERABLE,
                        onClick = { statusFilter = AbandonedCartStatus.RECUPERABLE },
                        label = { Text("Recuperables") }
                    )
                    FilterChip(
                        selected = statusFilter == AbandonedCartStatus.RECUPERADO,
                        onClick = { statusFilter = AbandonedCartStatus.RECUPERADO },
                        label = { Text("Recuperados") }
                    )
                }
            }

            if (filteredCarts.isEmpty()) {
                item {
                    Box(modifier = Modifier.fillMaxWidth().padding(48.dp), contentAlignment = Alignment.Center) {
                        Text("No se encontraron carritos", color = Color.Gray)
                    }
                }
            }

            items(filteredCarts) { cart ->
                AbandonedCartItemRow(cart, onClick = { selectedCart = cart })
            }
        }
    }
}

@Composable
fun KpiSmallCard(label: String, value: String, modifier: Modifier, color: Color) {
    Surface(
        modifier = modifier,
        color = color,
        shape = RoundedCornerShape(8.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(label, style = MaterialTheme.typography.labelSmall, color = Color.DarkGray)
            Text(value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun AbandonedCartItemRow(cart: AbandonedCart, onClick: () -> Unit) {
    val sdf = SimpleDateFormat("dd/MM HH:mm", Locale.getDefault())
    val total = cart.items.sumOf { it.finalPrice * it.quantity }
    
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        if (cart.isGuest) Icons.Default.Person else Icons.Default.ShoppingCart,
                        null,
                        modifier = Modifier.size(16.dp),
                        tint = if (cart.isGuest) Color.Gray else MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = cart.userName ?: "Invitado",
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
                Text(cart.userEmail ?: "Sin correo", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                Text("Última activ.: ${sdf.format(Date(cart.lastActivity))}", style = MaterialTheme.typography.labelSmall, color = Color.LightGray)
            }
            
            Column(horizontalAlignment = Alignment.End) {
                Text("S/ ${String.format(Locale.US, "%.2f", total)}", fontWeight = FontWeight.ExtraBold)
                StatusBadge(cart.status)
            }
            Icon(Icons.Default.ChevronRight, null, tint = Color.LightGray)
        }
    }
}

@Composable
fun StatusBadge(status: AbandonedCartStatus) {
    val (color, text) = when(status) {
        AbandonedCartStatus.RECUPERABLE -> Color(0xFF1976D2) to "Recuperable"
        AbandonedCartStatus.PERDIDO -> Color(0xFFD32F2F) to "Perdido"
        AbandonedCartStatus.RECUPERADO -> Color(0xFF388E3C) to "Recuperado"
        else -> Color.Gray to "Activo"
    }
    
    Surface(
        color = color.copy(alpha = 0.1f),
        shape = RoundedCornerShape(4.dp),
        modifier = Modifier.padding(top = 4.dp)
    ) {
        Text(
            text = text,
            color = color,
            style = MaterialTheme.typography.labelSmall,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun AbandonedCartDetailDialog(cart: AbandonedCart, onDismiss: () -> Unit) {
    val sdfFull = SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault())
    val subtotal = cart.items.sumOf { it.finalPrice * it.quantity }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Detalle del Abandono") },
        text = {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item {
                    Column {
                        DetailRow("Cliente", cart.userName ?: "Invitado")
                        DetailRow("Correo", cart.userEmail ?: "N/A")
                        DetailRow("Tipo", if (cart.isGuest) "Invitado" else "Registrado")
                        DetailRow("Estado", cart.status.name)
                        DetailRow("Creado", sdfFull.format(Date(cart.createdAt)))
                        DetailRow("Últ. Actividad", sdfFull.format(Date(cart.lastActivity)))
                    }
                }
                
                item { HorizontalDivider(); Text("Productos", fontWeight = FontWeight.Bold, modifier = Modifier.padding(vertical = 8.dp)) }
                
                items(cart.items) { item ->
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                        AsyncImage(
                            model = item.imageUrl,
                            contentDescription = null,
                            modifier = Modifier.size(40.dp).clip(RoundedCornerShape(4.dp)),
                            contentScale = ContentScale.Crop
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(item.productName, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodySmall, maxLines = 1)
                            val sizeLabel = if (item.size.isEmpty()) "Única" else item.size
                            Text("Talla: $sizeLabel | Cant: ${item.quantity}", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                        }
                        Text("S/ ${String.format(Locale.US, "%.2f", item.finalPrice * item.quantity)}", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
                    }
                }

                if (cart.purchasedItems.isNotEmpty()) {
                    item { HorizontalDivider(); Text("Comprados anteriormente", fontWeight = FontWeight.Bold, color = Color(0xFF388E3C), modifier = Modifier.padding(vertical = 8.dp)) }
                    items(cart.purchasedItems) { item ->
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth().alpha(0.6f)) {
                            AsyncImage(model = item.imageUrl, contentDescription = null, modifier = Modifier.size(30.dp).clip(RoundedCornerShape(4.dp)), contentScale = ContentScale.Crop)
                            Spacer(modifier = Modifier.width(8.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(item.productName, style = MaterialTheme.typography.bodySmall, maxLines = 1)
                                val sizeLabel = if (item.size.isEmpty()) "Única" else item.size
                                Text("Talla: $sizeLabel | Cant: ${item.quantity}", style = MaterialTheme.typography.labelSmall)
                            }
                        }
                    }
                }
                
                item {
                    HorizontalDivider()
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Total Pendiente", fontWeight = FontWeight.ExtraBold)
                        Text("S/ ${String.format(Locale.US, "%.2f", subtotal)}", fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        },
        confirmButton = { Button(onClick = onDismiss) { Text("Cerrar") } }
    )
}

@Composable
fun DetailRow(label: String, value: String) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp)) {
        Text("$label: ", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold, modifier = Modifier.width(100.dp))
        Text(value, style = MaterialTheme.typography.bodySmall)
    }
}
