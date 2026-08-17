package com.example.ezzeta.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ezzeta.data.model.Order
import com.example.ezzeta.data.model.Product
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MySaleDetailScreen(
    orderId: String,
    productId: String,
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val mySales by viewModel.mySales.collectAsState()
    val salePair = remember(mySales, orderId, productId) {
        mySales.find { it.first.id == orderId && it.second.product.id == productId }
    }

    if (salePair == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Venta no encontrada.")
        }
        return
    }

    val (order, item) = salePair
    val product = item.product

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Detalle de Venta") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Seccion Pedido
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Pedido #${order.id}", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                        SaleStatusBadge(order.status)
                    }
                    Text("Fecha: ${order.date}", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                }
            }

            // Seccion Producto
            Text("Producto Vendido", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            
            Row(verticalAlignment = Alignment.CenterVertically) {
                AsyncImage(
                    model = product.imageUrl,
                    contentDescription = product.name,
                    modifier = Modifier
                        .size(100.dp)
                        .clip(RoundedCornerShape(12.dp)),
                    contentScale = ContentScale.Crop
                )
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(text = product.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    val sizeLabel = if (item.size.isEmpty()) "Única" else item.size
                Text(text = "Talla: $sizeLabel", style = MaterialTheme.typography.bodyMedium)
                    Text(text = "Cantidad: ${item.quantity}", style = MaterialTheme.typography.bodyMedium)
                    Text(
                        text = "Precio Unitario: S/ ${String.format(Locale.US, "%.2f", item.effectivePrice)}",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            
            Surface(
                color = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.3f),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Total por este producto", fontWeight = FontWeight.Bold)
                    Text(
                        "S/ ${String.format(Locale.US, "%.2f", item.effectivePrice * item.quantity)}",
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.secondary,
                        fontSize = 18.sp
                    )
                }
            }

            HorizontalDivider()

            // Seccion Entrega
            Text("Información de Entrega", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    DeliveryInfoItem(Icons.Default.Person, "Comprador", order.buyerName)
                    DeliveryInfoItem(Icons.Default.Email, "Correo", order.buyerEmail)
                    DeliveryInfoItem(Icons.Default.Phone, "Teléfono", order.buyerPhone)
                    
                    val fullLocation = listOf(order.shippingDist, order.shippingProv, order.shippingDept)
                        .filter { it.isNotBlank() }
                        .joinToString(", ")
                    
                    DeliveryInfoItem(Icons.Default.LocationOn, "Ubicación", fullLocation)
                    DeliveryInfoItem(Icons.Default.Home, "Dirección", order.shippingAddress)
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun DeliveryInfoItem(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, value: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, contentDescription = null, modifier = Modifier.size(20.dp), tint = MaterialTheme.colorScheme.primary)
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(text = label, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            Text(text = value.ifBlank { "No proporcionado" }, style = MaterialTheme.typography.bodyMedium)
        }
    }
}
