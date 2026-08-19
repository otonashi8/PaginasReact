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
import androidx.compose.foundation.shape.CircleShape
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
fun CircularSelector(
    isSelected: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .size(24.dp)
            .clickable { onCheckedChange(!isSelected) },
        shape = CircleShape,
        border = androidx.compose.foundation.BorderStroke(
            width = 2.dp,
            color = if (isSelected) MaterialTheme.colorScheme.primary else Color.Gray.copy(alpha = 0.5f)
        ),
        color = if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent
    ) {
        if (isSelected) {
            Icon(
                imageVector = Icons.Default.Check,
                contentDescription = null,
                tint = Color.White,
                modifier = Modifier.padding(4.dp)
            )
        }
    }
}

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

    val cartSummary by viewModel.cartSummary.collectAsState()
    val subtotal = cartSummary.subtotal
    val totalSavings = cartSummary.totalSavings
    val planDiscount = cartSummary.planDiscount
    val shippingCost = cartSummary.shippingCost
    val appliedRules = cartSummary.appliedRules
    val total = cartSummary.total
    val selectedCount = cartSummary.selectedCount

    val userPlan by viewModel.userPlan.collectAsState()
    val shippingConfig by viewModel.shippingConfig.collectAsState()
    val couponInput by viewModel.couponInput.collectAsState()

    val activityMap by viewModel.productActivityMap.collectAsState()
    val context = LocalContext.current

    val suggestedProducts = remember(allProducts, cartItems) {
        val cartIds = cartItems.map { it.product.id }.toSet()
        allProducts.filter { it.id !in cartIds && it.isVisible }.shuffled().take(10)
    }

    // Agrupar productos por tienda para mostrar cabeceras
    val groupedItems = remember(cartItems) { 
        cartItems.filter { it.product != null }.groupBy { it.product.storeId } 
    }
    val storeNames = mapOf("s1" to "EZZETA", "s2" to "CREPANTE", "s3" to "MAXETA", "s4" to "UOMO CATTIVO", "s5" to "3x100")
    
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
                        val progress = if (shippingThreshold > 0) (subtotal / shippingThreshold).coerceIn(0.0, 1.0).toFloat() else 1f
                        val remaining = (shippingThreshold - subtotal).coerceAtLeast(0.0)

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

                        // Sección de Cupón
                        val couponValidationMessage by viewModel.couponValidationMessage.collectAsState()
                        var couponText by remember { mutableStateOf("") }

                        // Si cambia el mensaje de error (inválido), limpiamos el campo
                        LaunchedEffect(couponValidationMessage) {
                            if (couponValidationMessage?.contains("inválido") == true) {
                                couponText = ""
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                OutlinedTextField(
                                    value = if (couponInput.isEmpty()) couponText else couponInput,
                                    onValueChange = {
                                        if (couponInput.isEmpty()) {
                                            couponText = it.uppercase()
                                        }
                                    },
                                    label = { Text("Código de cupón") },
                                    modifier = Modifier.weight(1f),
                                    singleLine = true,
                                    enabled = couponInput.isEmpty(),
                                    shape = RoundedCornerShape(8.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                if (couponInput.isEmpty()) {
                                    Button(
                                        onClick = { viewModel.applyCoupon(couponText) },
                                        enabled = couponText.isNotBlank(),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text("Aplicar")
                                    }
                                } else {
                                    TextButton(onClick = {
                                        viewModel.removeCoupon()
                                        couponText = ""
                                    }) {
                                        Text("Quitar", color = Color.Red, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                            couponValidationMessage?.let {
                                Text(
                                    text = it,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = if (it.contains("aplicado")) Color(0xFF2E7D32) else Color.Red,
                                    modifier = Modifier.padding(top = 4.dp, start = 4.dp)
                                )
                            }
                        }

                        val coupons = appliedRules.filter { it.isCoupon }
                        val autoDiscounts = appliedRules.filter { !it.isCoupon }

                        if (coupons.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            coupons.forEach { rule ->
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(bottom = 4.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        "Cupón: ${rule.ruleName}",
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
                        }

                        if (autoDiscounts.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            autoDiscounts.forEach { rule ->
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
                        }

                        if (planDiscount > 0.0) {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
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
                        CircularSelector(
                            isSelected = allSelected,
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
                        CircularSelector(
                            isSelected = allGroupSelected,
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
                        key = { (it.product?.id ?: "null") + it.size }
                    ) { item ->
                        var showDeleteConfirm by remember { mutableStateOf(false) }

                        if (item.product != null) {
                            CartItemRow(
                                item = item,
                                onQuantityChange = { delta -> viewModel.updateCartItemQuantity(context, item.product.id, item.size, delta) },
                                onSizeChange = { newSize -> viewModel.updateCartItemSize(context, item.product.id, item.size, newSize) },
                                onRemove = { showDeleteConfirm = true },
                                onToggleSelection = { isSelected -> 
                                    viewModel.toggleCartItemSelection(context, item.product.id, item.size, isSelected)
                                }
                            )
                        }

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

            // Sección "Llena tu cesta con"
            if (suggestedProducts.isNotEmpty()) {
                item {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "** Llena tu cesta con **",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                    )
                }

                items(
                    items = suggestedProducts.chunked(2),
                    key = { chunk -> "suggested_row_${chunk.first().id}" }
                ) { rowProducts ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        rowProducts.forEach { product ->
                            val priceRules by viewModel.priceRules.collectAsState()
                            val couponInput by viewModel.couponInput.collectAsState()
                            
                            val priceInfo = remember(product, priceRules, couponInput) {
                                viewModel.getProductPriceInfo(product)
                            }
                            
                            val activity = activityMap[product.id]
                            ProductCard(
                                product = product,
                                onFavoriteClick = { viewModel.toggleProductFavorite(context, product.id) },
                                onClick = { onProductClick(product.id) },
                                onQuickViewClick = { viewModel.onQuickViewProduct(context, product) },
                                onAppear = { viewModel.prefetchProduct(product.id) },
                                modifier = Modifier.weight(1f),
                                rankingText = activity?.rankingText,
                                wishlistCount = activity?.wishlistCount ?: 0,
                                salesCount = activity?.salesCount ?: 0,
                                priceInfo = priceInfo
                            )
                        }
                        if (rowProducts.size == 1) {
                            Spacer(modifier = Modifier.weight(1f))
                        }
                    }
                }
            }

            item {
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
            CircularSelector(
                isSelected = item.isSelected,
                onCheckedChange = onToggleSelection
            )
            
            Spacer(modifier = Modifier.width(8.dp))

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
                    val sizeLabel = if (item.size.isEmpty()) "Única" else item.size
                    Text(
                        text = "Talla: $sizeLabel ▼", 
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
