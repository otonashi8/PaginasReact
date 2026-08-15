package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ezzeta.data.model.RequestStatus
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.util.Locale
import com.example.ezzeta.ui.screens.admin.StatusBadge

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminMarketplaceRequestDetailScreen(
    requestId: String,
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val request = remember(requestId) { viewModel.getMarketplaceRequestById(requestId) }
    val isModerating by viewModel.isModerating.collectAsState()
    
    if (request == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Solicitud no encontrada.")
        }
        return
    }

    val product = request.product

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Detalle de Solicitud") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                }
            )
        },
        bottomBar = {
            if (request.status == RequestStatus.PENDING) {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shadowElevation = 8.dp,
                    color = MaterialTheme.colorScheme.surface
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp).navigationBarsPadding(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Button(
                            onClick = { 
                                viewModel.rejectMarketplaceRequest(context, requestId)
                                onBack()
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFC62828)),
                            shape = RoundedCornerShape(12.dp),
                            enabled = !isModerating
                        ) {
                            Icon(Icons.Default.Close, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Rechazar")
                        }
                        
                        Button(
                            onClick = { 
                                viewModel.approveMarketplaceRequest(context, requestId)
                                onBack()
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E7D32)),
                            shape = RoundedCornerShape(12.dp),
                            enabled = !isModerating
                        ) {
                            if (isModerating) {
                                CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White, strokeWidth = 2.dp)
                            } else {
                                Icon(Icons.Default.Check, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Aprobar")
                            }
                        }
                    }
                }
            }
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
            // Estado y Vendedor
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                StatusBadge(request.status)
                Text(
                    text = "ID: ${request.id}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }

            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Vendedor", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    Text("Nombre: ${request.userName}")
                    Text("User ID: ${request.userId}", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                }
            }

            // Información del Producto
            Text("Información del Producto", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            
            AsyncImage(
                model = product.imageUrl,
                contentDescription = product.name,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(250.dp)
                    .clip(RoundedCornerShape(12.dp)),
                contentScale = ContentScale.Crop
            )

            Text(text = product.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Text(text = product.description, style = MaterialTheme.typography.bodyMedium)

            HorizontalDivider()

            // Precios y Stocks
            Text("Configuración de Venta", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            
            // Precio
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = if (product.usePriceBySize) "Precio por talla: ON" else "Precio por talla: OFF",
                    fontWeight = FontWeight.Bold,
                    color = if (product.usePriceBySize) MaterialTheme.colorScheme.primary else Color.Gray
                )
                if (!product.usePriceBySize) {
                    Text("Precio General: S/ ${String.format(Locale.US, "%.2f", product.price)}", fontSize = 18.sp)
                }
            }

            // Stock
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = if (product.useStockBySize) "Stock por talla: ON" else "Stock por talla: OFF",
                    fontWeight = FontWeight.Bold,
                    color = if (product.useStockBySize) MaterialTheme.colorScheme.primary else Color.Gray
                )
                if (!product.useStockBySize) {
                    Text("Stock General: ${product.stock} unidades", fontSize = 18.sp)
                }
            }

            // Variantes Detalladas
            if (product.usePriceBySize || product.useStockBySize) {
                Text("Detalle de Variantes", fontWeight = FontWeight.Bold)
                product.variants?.forEach { variant ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = variant.name, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                            
                            if (product.usePriceBySize) {
                                Text(
                                    text = "S/ ${String.format(Locale.US, "%.2f", variant.price)}",
                                    color = MaterialTheme.colorScheme.primary,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp)
                                )
                            }
                            
                            if (product.useStockBySize) {
                                Text(
                                    text = "Stock: ${variant.stock}",
                                    style = MaterialTheme.typography.bodyMedium,
                                    modifier = Modifier.padding(start = 8.dp)
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
