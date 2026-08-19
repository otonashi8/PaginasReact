package com.example.ezzeta.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.lazy.staggeredgrid.*
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.IconButton
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
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
import com.example.ezzeta.data.repository.ProductRepository
import com.example.ezzeta.ui.components.*
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.util.Locale
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun CategoriesScreen(
    viewModel: MainViewModel, 
    onProductClick: (String) -> Unit,
    onWishlistClick: () -> Unit
) {
    val searchQuery by viewModel.categorySearchQuery.collectAsState()
    val isDarkTheme by viewModel.isDarkTheme.collectAsState()
    val searchResults by viewModel.categorySearchResults.collectAsState()
    val selectedCategoryId by viewModel.selectedCategoryId.collectAsState()
    val selectedSubCategory by viewModel.selectedSubCategory.collectAsState()
    val products by viewModel.filteredProducts.collectAsState()
    val activityMap by viewModel.productActivityMap.collectAsState()
    val context = LocalContext.current
    
    val categories by viewModel.storeCategories.collectAsState()
    val currentCategory = categories.find { it.id == selectedCategoryId }

    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    
    val gridState = rememberLazyStaggeredGridState()
    val listState = rememberLazyListState()
    val showScrollToTop by remember {
        derivedStateOf { 
            if (searchQuery.isNotEmpty()) listState.firstVisibleItemIndex > 0
            else gridState.firstVisibleItemIndex > 0
        }
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            val allCategories by viewModel.categories.collectAsState()
            ModalDrawerSheet {
                FilterDrawerContent(
                    filterManager = viewModel.storeFilterManager,
                    allCategories = allCategories,
                    onClose = { scope.launch { drawerState.close() } }
                )
            }
        }
    ) {
        Scaffold(
            topBar = {
                Surface(
                    shadowElevation = 4.dp,
                    color = MaterialTheme.colorScheme.surface
                ) {
                    Column {
                        FilterSearchBar(
                            query = searchQuery,
                            onQueryChange = { viewModel.onCategorySearchQueryChange(it) },
                            onMenuClick = { scope.launch { drawerState.open() } },
                            onThemeToggle = { viewModel.toggleTheme(context) },
                            isDarkTheme = isDarkTheme,
                            actions = {
                                IconButton(onClick = onWishlistClick) {
                                    Icon(Icons.Default.Favorite, contentDescription = "Lista de Deseos")
                                }
                            }
                        )

                        if (searchQuery.isEmpty()) {
                            CategoryTabRow(viewModel = viewModel)
                            SubCategoryBubbleRow(viewModel = viewModel)
                        }
                    }
                }
            },
            floatingActionButton = {
                ScrollToTopButton(
                    isVisible = showScrollToTop,
                    onClick = {
                        scope.launch {
                            if (searchQuery.isNotEmpty()) listState.animateScrollToItem(0)
                            else gridState.animateScrollToItem(0)
                        }
                    }
                )
            }
        ) { padding ->
            Column(modifier = Modifier.padding(padding).fillMaxSize()) {
                if (searchQuery.isNotEmpty()) {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        state = listState,
                        contentPadding = PaddingValues(16.dp)
                    ) {
                        items(
                            items = searchResults,
                            key = { it.id }
                        ) { product ->
                            val priceRules by viewModel.priceRules.collectAsState()
                            val couponInput by viewModel.couponInput.collectAsState()
                            val priceInfo = remember(product, priceRules, couponInput) {
                                viewModel.getProductPriceInfo(product)
                            }
                            val activity = activityMap[product.id]
                            SearchResultItem(
                                product = product,
                                priceInfo = priceInfo,
                                rankingText = activity?.rankingText,
                                wishlistCount = activity?.wishlistCount ?: 0,
                                salesCount = activity?.salesCount ?: 0,
                                onClick = { onProductClick(product.id) }
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                        }
                    }
                } else {
                    LazyVerticalStaggeredGrid(
                        columns = StaggeredGridCells.Adaptive(minSize = 160.dp),
                        state = gridState,
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(8.dp)
                    ) {

                        items(
                            items = products,
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
                                onQuickViewClick = { viewModel.onQuickViewProduct(context, product) },
                                onAppear = { viewModel.prefetchProduct(product.id) },
                                rankingText = activity?.rankingText,
                                wishlistCount = activity?.wishlistCount ?: 0,
                                salesCount = activity?.salesCount ?: 0,
                                priceInfo = priceInfo
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SearchResultItem(
    product: com.example.ezzeta.data.model.Product,
    priceInfo: MainViewModel.ProductPriceInfo,
    rankingText: String? = null,
    wishlistCount: Int = 0,
    salesCount: Int = 0,
    onClick: () -> Unit
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
                Text(text = storeName, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
                Text(text = product.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                
                if (rankingText != null) {
                    Text(text = rankingText, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                }
                if (wishlistCount > 0 || salesCount > 0) {
                    Text(
                        text = "♡ $wishlistCount | ⍋ $salesCount",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.Gray
                    )
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
                    Text("Combo disponible", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.tertiary)
                }
            }
            
            IconButton(onClick = onClick) {
                Icon(Icons.Default.Add, contentDescription = "Ver detalles")
            }
        }
    }
}
