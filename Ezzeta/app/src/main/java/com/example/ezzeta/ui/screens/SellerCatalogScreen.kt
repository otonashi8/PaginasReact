package com.example.ezzeta.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ezzeta.ui.components.ProductCard
import com.example.ezzeta.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerCatalogScreen(
    sellerId: String?,
    viewModel: MainViewModel,
    onBack: () -> Unit,
    onProductClick: (String) -> Unit
) {
    val context = LocalContext.current
    val allProducts by viewModel.allProducts.collectAsState()
    val products = remember(sellerId, allProducts) {
        if (sellerId != null) viewModel.getProductsBySeller(sellerId) else emptyList()
    }
    
    val sellerName = products.firstOrNull()?.sellerName ?: "Catálogo del Vendedor"

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(sellerName, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                }
            )
        }
    ) { padding ->
        if (products.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("Este vendedor no tiene productos disponibles.", color = Color.Gray)
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(8.dp)
            ) {
                items(products, key = { it.id }) { product ->
                    ProductCard(
                        product = product,
                        onFavoriteClick = { viewModel.toggleProductFavorite(context, product.id) },
                        onClick = { onProductClick(product.id) },
                        onQuickViewClick = { viewModel.onQuickViewProduct(context, product) }
                    )
                }
            }
        }
    }
}
