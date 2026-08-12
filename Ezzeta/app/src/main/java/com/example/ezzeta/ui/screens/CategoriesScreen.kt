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
    val context = LocalContext.current

    val novedades by viewModel.novedadesProducts.collectAsState()
    val ofertasPatrias by viewModel.ofertasPatriasProducts.collectAsState()
    val masVendidos by viewModel.masVendidosProducts.collectAsState()
    
    val categories by viewModel.categories.collectAsState()
    val currentCategory = categories.find { it.id == selectedCategoryId }

    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    
    val gridState = rememberLazyGridState()
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
            ModalDrawerSheet {
                FilterDrawerContent(
                    viewModel = viewModel,
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
                            SearchResultItem(product = product, onClick = { onProductClick(product.id) })
                            Spacer(modifier = Modifier.height(12.dp))
                        }
                    }
                } else {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        state = gridState,
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(8.dp)
                    ) {
                        val subTitlePart = if (selectedSubCategory == "Todo") "" else " en $selectedSubCategory"
                        val catTitlePart = if (selectedCategoryId == "1") "" else " de ${currentCategory?.name}"
                        val fullSuffix = "$subTitlePart$catTitlePart"

                        item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
                            ProductCarousel(
                                title = "Novedades$fullSuffix",
                                products = novedades,
                                onProductClick = onProductClick,
                                onFavoriteClick = { viewModel.toggleProductFavorite(context, it.id) },
                                onQuickViewClick = { viewModel.onQuickViewProduct(context, it) },
                                onProductAppear = { viewModel.prefetchProduct(it) }
                            )
                        }
                        item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
                            ProductCarousel(
                                title = "Ofertas Patrias$fullSuffix",
                                products = ofertasPatrias,
                                onProductClick = onProductClick,
                                onFavoriteClick = { viewModel.toggleProductFavorite(context, it.id) },
                                onQuickViewClick = { viewModel.onQuickViewProduct(context, it) },
                                onProductAppear = { viewModel.prefetchProduct(it) }
                            )
                        }
                        item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
                            ProductCarousel(
                                title = "Más Vendidos$fullSuffix",
                                products = masVendidos,
                                onProductClick = onProductClick,
                                onFavoriteClick = { viewModel.toggleProductFavorite(context, it.id) },
                                onQuickViewClick = { viewModel.onQuickViewProduct(context, it) },
                                onProductAppear = { viewModel.prefetchProduct(it) }
                            )
                        }
                        item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
                            Text(
                                text = if (selectedSubCategory == "Todo" && selectedCategoryId == "1") "Todos los productos" 
                                       else "Todos los productos$fullSuffix",
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(16.dp),
                                fontSize = 18.sp
                            )
                        }

                        items(
                            items = products,
                            key = { it.id }
                        ) { product ->
                            ProductCard(
                                product = product,
                                onFavoriteClick = { viewModel.toggleProductFavorite(context, product.id) },
                                onClick = { onProductClick(product.id) },
                                onQuickViewClick = { viewModel.onQuickViewProduct(context, product) },
                                onAppear = { viewModel.prefetchProduct(product.id) }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SearchResultItem(product: com.example.ezzeta.data.model.Product, onClick: () -> Unit) {
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
            AsyncImage(
                model = product.imageUrl,
                contentDescription = null,
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(8.dp)),
                contentScale = ContentScale.Crop
            )
            
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(start = 12.dp)
            ) {
                Text(text = storeName, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
                Text(text = product.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text(text = "S/ ${product.price}", style = MaterialTheme.typography.bodyMedium)
            }
            
            IconButton(onClick = onClick) {
                Icon(Icons.Default.Add, contentDescription = "Ver detalles")
            }
        }
    }
}
