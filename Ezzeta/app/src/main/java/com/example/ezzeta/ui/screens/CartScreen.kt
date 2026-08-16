package com.example.ezzeta.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.ui.draw.drawWithContent
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
    onNavigateToCheckout: () -> Unit,
    onProductClick: (String) -> Unit
) {
    val cartItems by viewModel.cartItems.collectAsState()
    val allProducts by viewModel.allProducts.collectAsState()
    val lastDeletedItem by viewModel.lastDeletedItem.collectAsState()
    val subtotal by viewModel.subtotal.collectAsState()
    val totalSavings by viewModel.totalSavings.collectAsState()
    val planDiscount by viewModel.planDiscount.collectAsState()
    val userPlan by viewModel.userPlan.collectAsState()
    val shippingCost by viewModel.shippingCost.collectAsState()
    val shippingConfig by viewModel.shippingConfig.collectAsState()
    val appliedRules by viewModel.appliedRules.collectAsState()
    val totalRulesDiscount by viewModel.totalRulesDiscount.collectAsState()
    val couponInput by viewModel.couponInput.collectAsState()

    val total by viewModel.total.collectAsState()
    val selectedCount by viewModel.selectedCartItemCount.collectAsState()
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
                        val shippingThreshold = shippingConfig.freeShippingThreshold
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

                        if (planDiscount > 0.0) {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(bottom = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    "Descuento Plan ${userPlan?.name ?: ""}", 
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color(0xFF1976D2),
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    "- S/ ${String.format(Locale.US, "%.2f", planDiscount)}",
                                    color = Color(0xFF1976D2),
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        appliedRules.forEach { rule ->
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(bottom = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    rule.ruleName, 
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color(0xFF2E7D32),
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    "- S/ ${String.format(Locale.US, "%.2f", rule.discountAmount)}",
                                    color = Color(0xFF2E7D32),
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }


                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Subtotal", style = MaterialTheme.typography.bodyMedium)
                            Text("S/ ${String.format(Locale.US, "%.2f", subtotal)}")
                        }
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Envío", style = MaterialTheme.typography.bodyMedium)
                            Text(
                                text = if (shippingCost == 0.0) "GRATIS" else "S/ ${String.format(Locale.US, "%.2f", shippingCost)}",
                                color = if (shippingCost == 0.0) Color(0xFF2E7D32) else Color.Unspecified,
                                fontWeight = if (shippingCost == 0.0) FontWeight.Bold else FontWeight.Normal
                            )
                        }

                        // Sección de Cupón (Fase 20)
                        val couponValidationMessage by viewModel.couponValidationMessage.collectAsState()
                        var couponText by remember { mutableStateOf(couponInput) }
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                OutlinedTextField(
                                    value = couponText,
                                    onValueChange = { couponText = it.uppercase() },
                                    label = { Text("¿Tienes un cupón?") },
                                    modifier = Modifier.weight(1f),
                                    singleLine = true,
                                    enabled = couponInput.isEmpty()
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                if (couponInput.isEmpty()) {
                                    Button(onClick = { viewModel.applyCoupon(couponText) }, enabled = couponText.isNotBlank()) {
                                        Text("Aplicar")
                                    }
                                } else {
                                    TextButton(onClick = { 
                                        viewModel.removeCoupon()
                                        couponText = ""
                                    }) {
                                        Text("Quitar", color = Color.Red)
                                    }
                                }
                            }
                            couponValidationMessage?.let {
                                Text(text = it, style = MaterialTheme.typography.labelSmall, color = if (it.contains("aplicado")) Color(0xFF2E7D32) else Color.Red, modifier = Modifier.padding(top = 4.dp))
                            }
                        }

                        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(text = "Total ($selectedCount)", style = MaterialTheme.typography.bodyMedium)
                                Text(
                                    text = "S/ ${String.format(Locale.US, "%.2f", total)}",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.secondary
                                )
                            }
                            Button(
                                onClick = onNavigateToCheckout,
                                enabled = selectedCount > 0
                            ) {
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
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize(),
            state = listState
        ) {
            item {
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
            }

            val allSelected = cartItems.all { it.isSelected }
            if (cartItems.isNotEmpty()) {
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { viewModel.toggleAllCartItems(context, !allSelected) }
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = allSelected,
                            onCheckedChange = { viewModel.toggleAllCartItems(context, it) }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (allSelected) "Deseleccionar todos" else "Seleccionar todos",
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    HorizontalDivider()
                }
            }

            if (cartItems.isEmpty()) {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 40.dp),
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
                }
            } else {
                groupedItems.forEach { (storeId, items) ->
                    val allGroupSelected = items.all { it.isSelected }
                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { viewModel.toggleSellerSelection(context, storeId, !allGroupSelected) }
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(
                                checked = allGroupSelected,
                                onCheckedChange = { viewModel.toggleSellerSelection(context, storeId, it) }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = storeNames[storeId] ?: "Vendedor Marketplace",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.secondary,
                                modifier = Modifier.weight(1f)
                            )
                        }
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
                            onRemove = { showDeleteConfirm = true },
                            onToggleSelection = { isSelected -> 
                                viewModel.toggleCartItemSelection(context, item.product.id, item.size, isSelected)
                            }
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

            // --- Sección "Llena tu cesta con" ---
            item {
                Spacer(modifier = Modifier.height(16.dp))
                val suggestedProducts = remember(allProducts, cartItems) {
                    val cartIds = cartItems.map { it.product.id }.toSet()
                    allProducts.filter { it.id !in cartIds && it.isVisible }.shuffled().take(10)
                }

                ProductCarousel(
                    title = "** Llena tu cesta con **",
                    products = suggestedProducts,
                    onProductClick = onProductClick,
                    onFavoriteClick = { product -> viewModel.toggleProductFavorite(context, product.id) },
                    onQuickViewClick = { product -> viewModel.onQuickViewProduct(context, product) }
                )
                
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}

@Composable
fun CartItemRow(
    item: CartItem,
    onQuantityChange: (Int) -> Unit,
    onSizeChange: (String) -> Unit,
    onRemove: () -> Unit,
    onToggleSelection: (Boolean) -> Unit
) {
    var showSizeMenu by remember { mutableStateOf(false) }
    val sizes = item.product.getAvailableSizes()

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (item.isSelected) MaterialTheme.colorScheme.surface else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        )
    ) {
        Row(
            modifier = Modifier
                .padding(8.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = item.isSelected,
                onCheckedChange = onToggleSelection
            )
            
            Spacer(modifier = Modifier.width(4.dp))

            AsyncImage(
                model = item.product.imageUrl,
                contentDescription = null,
                modifier = Modifier
                    .size(90.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .then(if (!item.isSelected) Modifier.drawWithContent { 
                        drawContent()
                        drawRect(color = Color.White.copy(alpha = 0.3f))
                    } else Modifier),
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
                            val stock = item.product.getStockForSize(size)
                            val isAvailable = stock > 0
                            DropdownMenuItem(
                                text = { 
                                    Text(if (isAvailable) size else "$size (Agotado)") 
                                },
                                onClick = {
                                    if (isAvailable) {
                                        onSizeChange(size)
                                        showSizeMenu = false
                                    }
                                },
                                enabled = isAvailable
                            )
                        }
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (item.product.oldPrice != null && item.product.oldPrice > item.effectivePrice && item.product.variants.isNullOrEmpty()) {
                        Text(
                            text = "S/ ${String.format(Locale.US, "%.2f", item.product.oldPrice)}",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray,
                            textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough,
                            modifier = Modifier.padding(end = 8.dp)
                        )
                    }
                    Text(
                        text = "S/ ${String.format(Locale.US, "%.2f", item.effectivePrice)}",
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
                    maxQuantity = item.product.getStockForSize(item.size),
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
            
            IconButton(onClick = onRemove) {
                Icon(Icons.Default.Delete, contentDescription = null, tint = MaterialTheme.colorScheme.error)
            }
        }
    }
}
