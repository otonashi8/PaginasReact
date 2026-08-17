package com.example.ezzeta.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ezzeta.data.model.Product
import com.example.ezzeta.ui.components.*
import com.example.ezzeta.ui.viewmodel.MainViewModel
import kotlinx.coroutines.launch
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WishlistScreen(viewModel: MainViewModel, onBack: () -> Unit, onProductClick: (String) -> Unit) {
    val allProducts by viewModel.allProducts.collectAsState()
    val isDarkTheme by viewModel.isDarkTheme.collectAsState()
    val activityMap by viewModel.productActivityMap.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    
    val wishlist = allProducts.filter { it.isFavorite && it.name.contains(searchQuery, ignoreCase = true) }
    
    val storeNames = mapOf("s1" to "EZZETA", "s2" to "CREPANTE", "s3" to "MAXETA", "s4" to "UOMO CATTIVO", "s5" to "3x100")

    val groupedWishlist = wishlist.groupBy { product ->
        if (product.isClientProduct) "m_${product.sellerId}" else "s_${product.storeId}"
    }

    val context = LocalContext.current
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    val showScrollToTop by remember {
        derivedStateOf { listState.firstVisibleItemIndex > 0 }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Buscar en favoritos...", fontSize = 14.sp) },
                        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                        shape = RoundedCornerShape(25.dp),
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, modifier = Modifier.size(20.dp)) },
                        trailingIcon = {
                            if (searchQuery.isNotEmpty()) {
                                IconButton(onClick = { searchQuery = "" }) {
                                    Icon(Icons.Default.Close, contentDescription = "Limpiar")
                                }
                            }
                        },
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                            focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                            unfocusedBorderColor = Color.Transparent,
                            focusedBorderColor = Color.Transparent
                        ),
                        singleLine = true
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.shareWishlist(context, wishlist) }) {
                        Icon(Icons.Default.Share, contentDescription = "Compartir")
                    }
                    IconButton(onClick = { viewModel.toggleTheme(context) }) {
                        Icon(
                            imageVector = if (isDarkTheme) Icons.Default.LightMode else Icons.Default.Nightlight,
                            contentDescription = "Cambiar tema"
                        )
                    }
                }
            )
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
        if (wishlist.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text(if (searchQuery.isEmpty()) "Tu lista de deseos está vacía" else "No se encontraron productos")
            }
        } else {
            LazyColumn(
                state = listState,
                modifier = Modifier.padding(padding).fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                groupedWishlist.forEach { (groupId, items) ->
                    val isMarketplace = groupId.startsWith("m_")
                    val id = groupId.substring(2)
                    
                    val headerTitle = if (isMarketplace) {
                        items.firstOrNull()?.sellerName ?: "Vendedor Marketplace"
                    } else {
                        storeNames[id] ?: "Tienda Oficial"
                    }

                    item(key = groupId) {
                        Column {
                            Text(
                                text = headerTitle,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.ExtraBold,
                                color = if (isMarketplace) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.primary
                            )
                            if (isMarketplace) {
                                Text(
                                    text = "Marketplace",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Color.Gray
                                )
                            }
                            HorizontalDivider(modifier = Modifier.padding(top = 4.dp))
                        }
                    }

                    items(items, key = { it.id }) { product ->
                        val priceRules by viewModel.priceRules.collectAsState()
                        val couponInput by viewModel.couponInput.collectAsState()
                        val priceInfo = remember(product, priceRules, couponInput) {
                            viewModel.getProductPriceInfo(product)
                        }
                        val activity = activityMap[product.id]
                        WishlistItemRow(
                            product = product,
                            priceInfo = priceInfo,
                            rankingText = activity?.rankingText,
                            wishlistCount = activity?.wishlistCount ?: 0,
                            onFavoriteClick = { viewModel.toggleProductFavorite(context, product.id) },
                            onQuickViewClick = { viewModel.onQuickViewProduct(context, product) },
                            onClick = { onProductClick(product.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun WishlistItemRow(
    product: Product,
    priceInfo: MainViewModel.ProductPriceInfo,
    rankingText: String? = null,
    wishlistCount: Int = 0,
    onFavoriteClick: () -> Unit,
    onQuickViewClick: () -> Unit,
    onClick: () -> Unit
) {
    val isEffectivelyAvailable = product.isVisible && if (product.useStockBySize) {
        !product.variants.isNullOrEmpty() && product.variants.any { it.stock > 0 }
    } else {
        product.stock > 0
    }

    val displayPrice = priceInfo.finalPrice
    val oldPrice = if (priceInfo.discountPercent > 0) priceInfo.originalPrice else product.oldPrice

    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box {
                AsyncImage(
                    model = product.imageUrl,
                    contentDescription = product.name,
                    modifier = Modifier
                        .size(80.dp)
                        .clip(RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Crop,
                    alpha = if (isEffectivelyAvailable) 1f else 0.5f
                )
                if (!isEffectivelyAvailable) {
                    Surface(
                        modifier = Modifier.align(Alignment.Center),
                        color = Color.Black.copy(alpha = 0.6f),
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text(
                            text = "No disponible",
                            color = Color.White,
                            fontSize = 8.sp,
                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                        )
                    }
                }

                if (priceInfo.discountPercent > 0) {
                    Surface(
                        modifier = Modifier.align(Alignment.TopStart),
                        color = Color(0xFFE53935),
                        shape = RoundedCornerShape(bottomEnd = 8.dp)
                    ) {
                        Text(
                            text = "-${priceInfo.discountPercent}%",
                            color = Color.White,
                            fontSize = 9.sp,
                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 12.dp)
            ) {
                Text(
                    text = product.name,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1
                )
                
                if (rankingText != null) {
                    Text(text = rankingText, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                }
                if (wishlistCount > 0) {
                    Text(text = "♡ $wishlistCount lo tienen en su lista", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                }
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (oldPrice != null && (oldPrice > displayPrice)) {
                        Text(
                            text = "S/ ${String.format(Locale.US, "%.2f", oldPrice)}",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray,
                            textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough,
                            modifier = Modifier.padding(end = 8.dp)
                        )
                    }
                    Text(
                        text = "S/ ${String.format(Locale.US, "%.2f", displayPrice)}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = if (priceInfo.discountPercent > 0) Color(0xFFE53935) else MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold
                    )
                }

                if (priceInfo.hasCombo) {
                    Text(
                        text = "Promo combo disponible",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.tertiary,
                        fontWeight = FontWeight.Medium
                    )
                }
                
                if (product.isClientProduct && !product.isVisible) {
                    Text(
                        text = "Pendiente de revisión o agotado",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.Red
                    )
                }
            }

            IconButton(
                onClick = onQuickViewClick,
                enabled = isEffectivelyAvailable
            ) {
                Icon(
                    imageVector = Icons.Default.AddShoppingCart,
                    contentDescription = "Compra rápida",
                    tint = if (isEffectivelyAvailable) MaterialTheme.colorScheme.secondary else Color.Gray
                )
            }

            IconButton(onClick = onFavoriteClick) {
                Icon(
                    imageVector = Icons.Default.Favorite,
                    contentDescription = "Quitar de favoritos",
                    tint = Color.Red
                )
            }
        }
    }
}
