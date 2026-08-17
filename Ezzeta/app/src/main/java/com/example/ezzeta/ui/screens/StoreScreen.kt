package com.example.ezzeta.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Search
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
import com.example.ezzeta.ui.components.ProductCard
import com.example.ezzeta.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StoreDetailScreen(
    storeId: String?,
    viewModel: MainViewModel,
    onBack: () -> Unit,
    onProductClick: (String) -> Unit,
    onQuickViewClick: (com.example.ezzeta.data.model.Product) -> Unit
) {
    val store = storeId?.let { viewModel.getStoreById(it) }
    val allStoreProducts = remember(storeId) { storeId?.let { viewModel.getProductsByStore(it) } ?: emptyList() }
    
    var searchQuery by remember { mutableStateOf("") }
    val filteredProducts = remember(searchQuery, allStoreProducts) {
        if (searchQuery.isEmpty()) allStoreProducts
        else allStoreProducts.filter { it.name.contains(searchQuery, ignoreCase = true) }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(store?.name ?: "Tienda") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                }
            )
        }
    ) { padding ->
        val context = LocalContext.current
        val allFollows by viewModel.userFollows.collectAsState()
        val activityMap by viewModel.productActivityMap.collectAsState()
        
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(8.dp)
        ) {
            // Header
            store?.let {
                item(span = { GridItemSpan(2) }) {
                    val isFollowed = remember(allFollows) { viewModel.isFollowingStore(it.id) }
                    val count = remember(allFollows) { viewModel.getStoreFollowerCount(it.id) }
                    Row(
                        modifier = Modifier.padding(16.dp).fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        AsyncImage(
                            model = it.logoUrl,
                            contentDescription = null,
                            modifier = Modifier.size(60.dp).clip(CircleShape),
                            contentScale = ContentScale.Crop
                        )
                        Column(modifier = Modifier.padding(start = 16.dp).weight(1f)) {
                            Text(text = it.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                            Text(text = "$count seguidores", style = MaterialTheme.typography.bodySmall)
                        }
                        Button(
                            onClick = { viewModel.toggleFollowStore(context, it.id) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isFollowed) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondary,
                                contentColor = if (isFollowed) Color.White else MaterialTheme.colorScheme.onSecondary
                            ),
                            shape = RoundedCornerShape(20.dp)
                        ) {
                            if (isFollowed) {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp).padding(end = 4.dp)
                                )
                            }
                            Text(if (isFollowed) "Siguiendo" else "+ Seguir")
                        }
                    }
                }
            }

            // Search Bar
            item(span = { GridItemSpan(2) }) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                    placeholder = { Text("Buscar en esta tienda...") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    shape = RoundedCornerShape(25.dp),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                        focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                        unfocusedBorderColor = Color.Transparent,
                        focusedBorderColor = Color.Transparent
                    )
                )
            }

            items(
                items = filteredProducts,
                key = { it.id }
            ) { product ->
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
                    onQuickViewClick = { onQuickViewClick(product) },
                    rankingText = activity?.rankingText,
                    wishlistCount = activity?.wishlistCount ?: 0,
                    priceInfo = priceInfo
                )
            }
        }
    }
}
