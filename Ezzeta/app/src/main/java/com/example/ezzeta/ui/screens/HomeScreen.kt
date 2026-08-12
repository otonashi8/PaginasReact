package com.example.ezzeta.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ezzeta.ui.components.*
import com.example.ezzeta.ui.viewmodel.MainViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: MainViewModel, 
    onProductClick: (String) -> Unit,
    onWishlistClick: () -> Unit
) {
    val user by viewModel.currentUser.collectAsState()
    val isDarkTheme by viewModel.isDarkTheme.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val products by viewModel.filteredProducts.collectAsState()
    val context = LocalContext.current
    
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    
    val gridState = rememberLazyGridState()
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
                        CenterAlignedTopAppBar(
                            title = { 
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    EzzetaLogo(isDark = isDarkTheme)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "| ${user?.alias ?: "Invitado"}",
                                        style = MaterialTheme.typography.titleMedium
                                    )
                                }
                            },
                            actions = {
                                IconButton(onClick = { viewModel.toggleTheme(context) }) { 
                                    Icon(
                                        imageVector = if (isDarkTheme) Icons.Default.LightMode else Icons.Default.Nightlight,
                                        contentDescription = "Cambiar tema"
                                    )
                                }
                                IconButton(onClick = onWishlistClick) { 
                                    Icon(Icons.Default.Favorite, contentDescription = "Lista de Deseos") 
                                }
                            }
                        )
                        
                        SearchBar(
                            query = searchQuery,
                            onQueryChange = { viewModel.onSearchQueryChange(it) },
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                        )

                        // categorías y menú
                        val categories by viewModel.categories.collectAsState()
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            if (categories.isNotEmpty()) {
                                Box(modifier = Modifier.weight(1f)) {
                                    CategoryTabRow(viewModel = viewModel)
                                }
                            } else {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                            IconButton(onClick = { scope.launch { drawerState.open() } }) {
                                Icon(Icons.Default.Menu, contentDescription = "Menú")
                            }
                        }

                        // sub categorias
                        SubCategoryBubbleRow(viewModel = viewModel)
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
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                state = gridState,
                modifier = Modifier
                    .padding(padding)
                    .fillMaxSize(),
                contentPadding = PaddingValues(bottom = 16.dp)
            ) {
                item(span = { GridItemSpan(2) }, key = "promo_banner") {
                    Column {
                        PromoBanner()
                        
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "✓ Pago con tarjeta o yape | ✓ Entrega gratis desde los S/100.00",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFF2E7D32),
                                fontWeight = FontWeight.Medium
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }

                item(span = { GridItemSpan(2) }, key = "recommendation_header") {
                    Text(
                        text = if (searchQuery.isEmpty()) "Para ti" else "Resultados para '$searchQuery'",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(16.dp)
                    )
                }

                if (products.isEmpty()) {
                    item(span = { GridItemSpan(2) }, key = "empty_state") {
                        Box(modifier = Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                            Text(text = "No se encontraron productos")
                        }
                    }
                } else {
                    items(
                        count = products.size,
                        key = { index -> products[index].id }
                    ) { index ->
                        val product = products[index]
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
