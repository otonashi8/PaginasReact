package com.example.ezzeta.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
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
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(viewModel: MainViewModel, onBack: () -> Unit, onProductClick: (String) -> Unit) {
    val history by viewModel.browsingHistory.collectAsState()
    val context = LocalContext.current
    val activityMap by viewModel.productActivityMap.collectAsState()
    
    val groupedHistory = remember(history) {
        history.groupBy { formatHistoryDate(it.lastViewedAt) }
    }
    
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    val showScrollToTop by remember {
        derivedStateOf { listState.firstVisibleItemIndex > 0 }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mi Historial") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
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
        if (history.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Aún no has visitado productos")
            }
        } else {
            LazyColumn(
                state = listState,
                modifier = Modifier.padding(padding).fillMaxSize(),
                contentPadding = PaddingValues(16.dp)
            ) {
                groupedHistory.forEach { (dateLabel, products) ->
                    item(key = dateLabel) {
                        Text(
                            text = dateLabel,
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Black,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                    
                    items(
                        items = products,
                        key = { it.id + "_" + it.lastViewedAt }
                    ) { product ->
                        LaunchedEffect(product.id) {
                            viewModel.prefetchProduct(product.id)
                        }
                        val priceRules by viewModel.priceRules.collectAsState()
                        val couponInput by viewModel.couponInput.collectAsState()
                        val priceInfo = remember(product, priceRules, couponInput) {
                            viewModel.getProductPriceInfo(product)
                        }
                        val activity = activityMap[product.id]
                        HistoryItem(
                            product = product,
                            priceInfo = priceInfo,
                            rankingText = activity?.rankingText,
                            wishlistCount = activity?.wishlistCount ?: 0,
                            onFavoriteClick = { viewModel.toggleProductFavorite(context, product.id) },
                            onClick = { onProductClick(product.id) },
                            onQuickViewClick = { viewModel.onQuickViewProduct(context, product) }
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                    }
                }
            }
        }
    }
}

private fun formatHistoryDate(timestamp: Long): String {
    if (timestamp == 0L) return "ANTERIORES"
    
    val now = Calendar.getInstance()
    val time = Calendar.getInstance().apply { timeInMillis = timestamp }
    
    val isSameDay = now.get(Calendar.YEAR) == time.get(Calendar.YEAR) &&
                    now.get(Calendar.DAY_OF_YEAR) == time.get(Calendar.DAY_OF_YEAR)
    
    if (isSameDay) return "HOY"
    
    val yesterday = Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, -1) }
    val isYesterday = yesterday.get(Calendar.YEAR) == time.get(Calendar.YEAR) &&
                      yesterday.get(Calendar.DAY_OF_YEAR) == time.get(Calendar.DAY_OF_YEAR)
    
    if (isYesterday) return "AYER"
    
    val sdf = SimpleDateFormat("dd 'DE' MMMM 'DE' yyyy", Locale.getDefault())
    return sdf.format(time.time).uppercase()
}

@Composable
fun HistoryItem(
    product: Product,
    priceInfo: MainViewModel.ProductPriceInfo,
    rankingText: String? = null,
    wishlistCount: Int = 0,
    onFavoriteClick: () -> Unit,
    onClick: () -> Unit,
    onQuickViewClick: () -> Unit
) {
    val storeName = when (product.storeId) {
        "s1" -> "EZZETA"
        "s2" -> "CREPANTE"
        "s3" -> "MAXETA"
        "s4" -> "UOMO CATTIVO"
        else -> "Tienda"
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        onClick = onClick
    ) {
        Row(
            modifier = Modifier.padding(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box {
                AsyncImage(
                    model = product.imageUrl,
                    contentDescription = null,
                    modifier = Modifier
                        .size(80.dp)
                        .clip(RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Crop
                )
                if (priceInfo.discountPercent > 0) {
                    Surface(
                        modifier = Modifier.align(Alignment.TopStart),
                        color = Color(0xFFE53935),
                        shape = RoundedCornerShape(bottomEnd = 8.dp)
                    ) {
                        Text(
                            text = "-${priceInfo.discountPercent}%",
                            color = Color.White,
                            fontSize = 8.sp,
                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
            
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(start = 12.dp)
            ) {
                Text(
                    text = storeName, 
                    style = MaterialTheme.typography.labelSmall, 
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = product.name, 
                    style = MaterialTheme.typography.titleMedium, 
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
                    if (priceInfo.discountPercent > 0) {
                        Text(
                            text = "S/ ${String.format(Locale.US, "%.2f", priceInfo.originalPrice)}",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray,
                            textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough,
                            modifier = Modifier.padding(end = 8.dp)
                        )
                    }
                    Text(
                        text = "S/ ${String.format(Locale.US, "%.2f", priceInfo.finalPrice)}",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        color = if (priceInfo.discountPercent > 0) Color(0xFFE53935) else MaterialTheme.colorScheme.onSurface
                    )
                }

                if (priceInfo.hasCombo) {
                    Text(
                        text = "Promo combo disponible",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.tertiary
                    )
                }
            }

            IconButton(onClick = onQuickViewClick) {
                Icon(Icons.Default.Add, contentDescription = "Vista rápida")
            }
            
            IconButton(onClick = onFavoriteClick) {
                Icon(
                    imageVector = if (product.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                    contentDescription = null,
                    tint = if (product.isFavorite) Color.Red else Color.Gray
                )
            }
        }
    }
}
