package com.example.ezzeta.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.ezzeta.ui.components.*
import com.example.ezzeta.ui.viewmodel.MainViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WishlistScreen(viewModel: MainViewModel, onBack: () -> Unit, onProductClick: (String) -> Unit) {
    val products by viewModel.filteredProducts.collectAsState()
    val wishlist = products.filter { it.isFavorite }
    val isDarkTheme by viewModel.isDarkTheme.collectAsState()
    val categorySearchQuery by viewModel.categorySearchQuery.collectAsState()
    val context = LocalContext.current
    
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val gridState = rememberLazyGridState()
    val scope = rememberCoroutineScope()
    val showScrollToTop by remember {
        derivedStateOf { gridState.firstVisibleItemIndex > 0 }
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
                            query = categorySearchQuery,
                            onQueryChange = { viewModel.onCategorySearchQueryChange(it) },
                            onMenuClick = { scope.launch { drawerState.open() } },
                            onThemeToggle = { viewModel.toggleTheme(context) },
                            isDarkTheme = isDarkTheme,
                            actions = {
                                IconButton(onClick = { viewModel.shareWishlist(context, wishlist) }) {
                                    Icon(Icons.Default.Share, contentDescription = "Compartir")
                                }
                                IconButton(onClick = onBack) {
                                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                                }
                            }
                        )

                        if (categorySearchQuery.isEmpty()) {
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
                    scope.launch { gridState.animateScrollToItem(0) }
                }
            )
        }
    ) { padding ->
        if (wishlist.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Tu lista de deseos está vacía")
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                state = gridState,
                modifier = Modifier.padding(padding).fillMaxSize(),
                contentPadding = PaddingValues(16.dp)
            ) {
                items(
                    items = wishlist,
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
