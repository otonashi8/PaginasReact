package com.example.ezzeta.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import java.util.Locale
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
import com.example.ezzeta.data.model.CartItem
import com.example.ezzeta.ui.components.*
import com.example.ezzeta.ui.viewmodel.MainViewModel
import kotlinx.coroutines.launch

@Composable
fun CartScreen(
    viewModel: MainViewModel, 
    onNavigateToCategories: () -> Unit,
    onNavigateToCheckout: () -> Unit
) {
    val cartItems by viewModel.cartItems.collectAsState()
    val lastDeletedItem by viewModel.lastDeletedItem.collectAsState()
    val subtotal by viewModel.subtotal.collectAsState()
    val totalSavings by viewModel.totalSavings.collectAsState()
    val shippingCost by viewModel.shippingCost.collectAsState()
    val total by viewModel.total.collectAsState()
    val context = LocalContext.current

    // Agrupar productos por tienda para mostrar cabeceras
    val groupedItems = cartItems.groupBy { it.product.storeId }
    val storeNames = mapOf("s1" to "EZZETA", "s2" to "CREPANTE", "s3" to "MAXETA", "s4" to "UOMO CATTIVO")
    
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    val showScrollToTop by remember {
        derivedStateOf { listState.firstVisibleItemIndex > 0 }
    }

    Scaffold(
        topBar = {
            Text(
                text = "Tu Cesta",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(16.dp)
            )
        },
        bottomBar = {
            if (cartItems.isNotEmpty()) {
                Surface(tonalElevation = 8.dp, shadowElevation = 12.dp) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        // Barra de progreso de envío gratis
                        val shippingThreshold = 200.0
                        val progress = (subtotal / shippingThreshold).coerceIn(0.0, 1.0).toFloat()
                        val remaining = shippingThreshold - subtotal

                        Column(modifier = Modifier.padding(bottom = 16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = if (subtotal >= shippingThreshold) 
                                        "¡Tienes envío GRATIS!" 
                                    else 
                                        "Faltan S/ ${String.format(Locale.US, "%.2f", remaining)} para envío gratis",
                                    style = MaterialTheme.typography.labelLarge,
                                    color = if (subtotal >= shippingThreshold) Color(0xFF2E7D32) else MaterialTheme.colorScheme.primary,
                                    fontWeight = FontWeight.Bold
                                )
                                Icon(
                                    imageVector = Icons.Default.LocalShipping,
                                    contentDescription = null,
                                    tint = if (subtotal >= shippingThreshold) Color(0xFF2E7D32) else MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            LinearProgressIndicator(
                                progress = { progress },
                                modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                                color = if (subtotal >= shippingThreshold) Color(0xFF2E7D32) else MaterialTheme.colorScheme.primary,
                                trackColor = MaterialTheme.colorScheme.surfaceVariant
                            )
                        }

                        if (totalSavings > 0.0) {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(bottom = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    "Ahorrado", 
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color(0xFF2E7D32),
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    "- S/ ${String.format(Locale.US, "%.2f", totalSavings)}",
                                    color = Color(0xFF2E7D32),
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Subtotal", style = MaterialTheme.typography.bodyMedium)
                            Text("S/ $subtotal")
                        }
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Envío", style = MaterialTheme.typography.bodyMedium)
                            Text(
                                text = if (shippingCost == 0.0) "GRATIS" else "S/ $shippingCost",
                                color = if (shippingCost == 0.0) Color(0xFF2E7D32) else Color.Unspecified,
                                fontWeight = if (shippingCost == 0.0) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(text = "Total", style = MaterialTheme.typography.bodyMedium)
                                Text(
                                    text = "S/ $total",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.secondary
                                )
                            }
                            Button(onClick = onNavigateToCheckout) {
                                Text("Pagar ahora")
                            }
                        }
                    }
                }
            }
        },
        floatingActionButton = {
            ScrollToTopButton(
                isVisible = showScrollToTop,
                onClick = {
                    scope.launch { listState.animateScrollToItem(0) }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            // Undo Banner
            AnimatedVisibility(
                visible = lastDeletedItem != null,
                enter = expandVertically(),
                exit = shrinkVertically()
            ) {
                lastDeletedItem?.let { item ->
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        color = MaterialTheme.colorScheme.secondaryContainer,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Producto \"${item.product.name}\" eliminado",
                                style = MaterialTheme.typography.bodySmall,
                                modifier = Modifier.weight(1f)
                            )
                            TextButton(
                                onClick = { viewModel.undoLastDelete(context) },
                                contentPadding = PaddingValues(horizontal = 12.dp)
                            ) {
                                Text("¿Deshacer?", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            if (cartItems.isEmpty()) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "Tu cesta está vacía",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.Gray
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = onNavigateToCategories,
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Explorar Categorías")
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    state = listState
                ) {
                    groupedItems.forEach { (storeId, items) ->
                        item {
                            Text(
                                text = storeNames[storeId] ?: "Tienda",
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.secondary
                            )
                            HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp))
                        }
                        items(
                            items = items,
                            key = { it.product.id + it.size }
                        ) { item ->
                            var showDeleteConfirm by remember { mutableStateOf(false) }

                            CartItemRow(
                                item = item,
                                onQuantityChange = { delta -> viewModel.updateCartItemQuantity(context, item.product.id, item.size, delta) },
                                onSizeChange = { newSize -> viewModel.updateCartItemSize(context, item.product.id, item.size, newSize) },
                                onRemove = { showDeleteConfirm = true }
                            )

                            if (showDeleteConfirm) {
                                AlertDialog(
                                    onDismissRequest = { showDeleteConfirm = false },
                                    title = { Text("¿Eliminar producto?", fontWeight = FontWeight.Bold) },
                                    text = { Text("¿Estás seguro de que deseas quitar '${item.product.name}' de tu cesta?") },
                                    confirmButton = {
                                        TextButton(
                                            onClick = { showDeleteConfirm = false },
                                            colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.primary)
                                        ) {
                                            Text("Cancelar", fontWeight = FontWeight.Bold)
                                        }
                                    },
                                    dismissButton = {
                                        TextButton(
                                            onClick = {
                                                viewModel.removeCartItem(context, item.product.id)
                                                showDeleteConfirm = false
                                            },
                                            colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.onSurfaceVariant)
                                        ) {
                                            Text("Eliminar")
                                        }
                                    },
                                    shape = RoundedCornerShape(16.dp),
                                    containerColor = MaterialTheme.colorScheme.surface
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CartItemRow(
    item: CartItem,
    onQuantityChange: (Int) -> Unit,
    onSizeChange: (String) -> Unit,
    onRemove: () -> Unit
) {
    var showSizeMenu by remember { mutableStateOf(false) }
    val sizes = if (item.product.categoryId == "4") listOf("28", "30", "32", "34", "36") else listOf("S", "M", "L", "XL")

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .padding(8.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            AsyncImage(
                model = item.product.imageUrl,
                contentDescription = null,
                modifier = Modifier.size(100.dp).clip(RoundedCornerShape(8.dp)),
                contentScale = ContentScale.Crop
            )
            
            Column(modifier = Modifier.padding(start = 12.dp).weight(1f)) {
                Text(text = item.product.name, fontWeight = FontWeight.Bold, maxLines = 1)
                
                Box {
                    Text(
                        text = "Talla: ${item.size} ▼", 
                        style = MaterialTheme.typography.bodySmall, 
                        color = MaterialTheme.colorScheme.secondary,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .clickable { showSizeMenu = true }
                            .padding(vertical = 4.dp)
                    )
                    DropdownMenu(
                        expanded = showSizeMenu,
                        onDismissRequest = { showSizeMenu = false }
                    ) {
                        sizes.forEach { size ->
                            DropdownMenuItem(
                                text = { Text(size) },
                                onClick = {
                                    onSizeChange(size)
                                    showSizeMenu = false
                                }
                            )
                        }
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (item.product.oldPrice != null && item.product.oldPrice > item.product.price) {
                        Text(
                            text = "S/ ${String.format(Locale.US, "%.2f", item.product.oldPrice)}",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray,
                            textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough,
                            modifier = Modifier.padding(end = 8.dp)
                        )
                    }
                    Text(
                        text = "S/ ${String.format(Locale.US, "%.2f", item.product.price)}",
                        color = MaterialTheme.colorScheme.secondary,
                        fontWeight = FontWeight.Bold
                    )
                }
                
                QuantitySelector(
                    quantity = item.quantity,
                    onQuantityChange = { newQuantity ->
                        val delta = newQuantity - item.quantity
                        if (delta != 0) {
                            onQuantityChange(delta)
                        }
                    },
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
            
            IconButton(onClick = onRemove) {
                Icon(Icons.Default.Delete, contentDescription = null, tint = MaterialTheme.colorScheme.error)
            }
        }
    }
}
