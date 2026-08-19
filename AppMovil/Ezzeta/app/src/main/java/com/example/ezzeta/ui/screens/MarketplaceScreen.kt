package com.example.ezzeta.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.lazy.staggeredgrid.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
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
import com.example.ezzeta.ui.components.*
import com.example.ezzeta.ui.viewmodel.MainViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MarketplaceScreen(
    viewModel: MainViewModel,
    onProductClick: (String) -> Unit,
    onStoreClick: (String) -> Unit,
    onWishlistClick: () -> Unit
) {
    val context = LocalContext.current
    val isDarkTheme by viewModel.isDarkTheme.collectAsState()
    val categories by viewModel.marketplaceCategories.collectAsState()
    val products by viewModel.marketplaceFilterManager.filteredProducts.collectAsState()
    val searchQuery by viewModel.marketplaceFilterManager.searchQuery.collectAsState()
    val selectedCategoryId by viewModel.marketplaceFilterManager.selectedCategoryId.collectAsState()
    val activityMap by viewModel.productActivityMap.collectAsState()

    // Auto-seleccionar una categoría válida de Marketplace si la actual no lo es
    LaunchedEffect(categories, selectedCategoryId) {
        if (categories.isNotEmpty() && categories.none { it.id == selectedCategoryId }) {
            // "1" es el ID de "Todo", que tiene visibilidad BOTH, por lo que debería estar en categories.
            // Si por alguna razón no está o se seleccionó una de tienda, forzamos a la primera disponible.
            viewModel.onMarketplaceCategorySelected(categories.first().id)
        }
    }

    val gridState = rememberLazyStaggeredGridState()
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val showScrollToTop by remember {
        derivedStateOf { gridState.firstVisibleItemIndex > 0 }
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            val allCategories by viewModel.categories.collectAsState()
            ModalDrawerSheet {
                FilterDrawerContent(
                    filterManager = viewModel.marketplaceFilterManager,
                    allCategories = allCategories,
                    onClose = { scope.launch { drawerState.close() } },
                    showStoreFilter = false
                )
            }
        }
    ) {
        Scaffold(
            topBar = {
                Surface(shadowElevation = 4.dp) {
                    Column {
                        TopAppBar(
                            title = {
                                Text(
                                    text = "Marketplace",
                                    style = MaterialTheme.typography.headlineMedium,
                                    fontWeight = FontWeight.Bold
                                )
                            },
                            actions = {
                                IconButton(onClick = { viewModel.toggleTheme(context) }) {
                                    Icon(
                                        imageVector = if (isDarkTheme) Icons.Default.LightMode else Icons.Default.Nightlight,
                                        contentDescription = "Cambiar tema"
                                    )
                                }
                                IconButton(onClick = onWishlistClick) {
                                    Icon(
                                        imageVector = Icons.Default.Favorite,
                                        contentDescription = "Lista de Deseos"
                                    )
                                }
                                IconButton(onClick = { scope.launch { drawerState.open() } }) {
                                    Icon(Icons.Default.Menu, contentDescription = "Filtros")
                                }
                            }
                        )
                        
                        SearchBar(
                            query = searchQuery,
                            onQueryChange = { viewModel.onMarketplaceSearchQueryChange(it) },
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                        )

                        // Categorías específicas de Marketplace
                        CategoryTabRow(viewModel = viewModel, isMarketplace = true)
                        SubCategoryBubbleRow(viewModel = viewModel, isMarketplace = true)
                    }
                }
            },
            floatingActionButton = {
                ScrollToTopButton(
                    isVisible = showScrollToTop,
                    onClick = {
                        scope.launch { gridState.animateScrollToItem(0) }
                    }
                )
            }
        ) { padding ->
            LazyVerticalStaggeredGrid(
                state = gridState,
                columns = StaggeredGridCells.Adaptive(minSize = 160.dp),
                modifier = Modifier.padding(padding).fillMaxSize(),
                contentPadding = PaddingValues(8.dp),
                horizontalArrangement = Arrangement.spacedBy(1.dp),
                verticalItemSpacing = 1.dp
            ) {
                item(span = StaggeredGridItemSpan.FullLine) {
                    Text(
                        text = "Productos de la Comunidad",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }

                if (products.isEmpty()) {
                    item(span = StaggeredGridItemSpan.FullLine) {
                        Box(modifier = Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                            Text("No se encontraron productos en el Marketplace", color = Color.Gray)
                        }
                    }
                } else {
                    items(products, key = { it.id }) { product ->
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
