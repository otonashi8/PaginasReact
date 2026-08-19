package com.example.ezzeta.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.foundation.lazy.staggeredgrid.*
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
import coil.compose.AsyncImage
import androidx.compose.ui.layout.ContentScale
import com.example.ezzeta.ui.components.*
import com.example.ezzeta.ui.viewmodel.MainViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: MainViewModel, 
    onProductClick: (String) -> Unit,
    onStoreClick: (String) -> Unit,
    onWishlistClick: () -> Unit
) {
    val user by viewModel.currentUser.collectAsState()
    val isDarkTheme by viewModel.isDarkTheme.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val products by viewModel.filteredProducts.collectAsState()
    val recentProducts by viewModel.recentProducts.collectAsState()
    val popularProducts by viewModel.popularProducts.collectAsState()
    val popularRankingMap by viewModel.popularRankingMap.collectAsState()
    val activityMap by viewModel.productActivityMap.collectAsState()
    val homeBanners by viewModel.homeBanners.collectAsState()
    val context = LocalContext.current
    
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    
    val gridState = rememberLazyStaggeredGridState()
    val showScrollToTop by remember {
        derivedStateOf { gridState.firstVisibleItemIndex > 0 }
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

                        // categorías y menú (Header reestablecido)
                        val categories by viewModel.storeCategories.collectAsState()
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

                        // subcategorías
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
            LazyVerticalStaggeredGrid(
                columns = StaggeredGridCells.Adaptive(minSize = 160.dp),
                state = gridState,
                modifier = Modifier
                    .padding(padding)
                    .fillMaxSize(),
                contentPadding = PaddingValues(8.dp)
            ) {
                item(span = StaggeredGridItemSpan.FullLine, key = "promo_banner") {
                    Column {
                        val activeBanners = remember(homeBanners) { homeBanners.filter { it.isActive } }
                        if (activeBanners.isNotEmpty()) {
                            PromoBanner(banners = activeBanners)
                        }
                        
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
                    }
                }

                // Sección Familia Ezzeta
                item(span = StaggeredGridItemSpan.FullLine, key = "familia_ezzeta_header") {
                    Text(
                        text = "Familia Ezzeta",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(16.dp)
                    )
                }

                item(span = StaggeredGridItemSpan.FullLine, key = "familia_ezzeta_row") {
                    val stores = viewModel.getStores()
                    val allProductsLocal by viewModel.allProducts.collectAsState()
                    
                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(stores) { store ->
                            StoreMiniCard(
                                store = store,
                                products = allProductsLocal.filter { it.storeId == store.id }.take(3),
                                viewModel = viewModel,
                                onProductClick = onProductClick,
                                onStoreClick = onStoreClick
                            )
                        }
                    }
                }

                item(span = StaggeredGridItemSpan.FullLine, key = "recommendation_header") {
                    Text(
                        text = if (searchQuery.isEmpty()) "Ezzeta Productos" else "Resultados para '$searchQuery'",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(16.dp)
                    )
                }

                if (products.isEmpty()) {
                    item(span = StaggeredGridItemSpan.FullLine, key = "empty_state") {
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
                        val priceInfo = remember(product, viewModel.priceRules.collectAsState().value, viewModel.couponInput.collectAsState().value) {
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

@Composable
fun StoreMiniCard(
    store: com.example.ezzeta.data.model.Store,
    products: List<com.example.ezzeta.data.model.Product>,
    viewModel: MainViewModel,
    onProductClick: (String) -> Unit,
    onStoreClick: (String) -> Unit
) {
    val context = LocalContext.current
    val followers by viewModel.userFollows.collectAsState()
    val isFollowed = remember(followers) { viewModel.isFollowingStore(store.id) }
    val count = remember(followers) { viewModel.getStoreFollowerCount(store.id) }

    Card(
        modifier = Modifier.width(280.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                AsyncImage(
                    model = store.logoUrl,
                    contentDescription = null,
                    modifier = Modifier.size(40.dp).clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = store.name, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(text = "$count seguidores", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                }

                IconButton(
                    onClick = { viewModel.toggleFollowStore(context, store.id) },
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = if (isFollowed) Icons.Default.CheckCircle else Icons.Default.AddCircleOutline,
                        contentDescription = "Seguir",
                        tint = if (isFollowed) MaterialTheme.colorScheme.primary else Color.Gray
                    )
                }
                
                // Botón Web
                if (!store.websiteUrl.isNullOrEmpty()) {
                    IconButton(onClick = {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(store.websiteUrl))
                        context.startActivity(intent)
                    }, modifier = Modifier.size(36.dp)) {
                        Icon(Icons.Default.Public, contentDescription = "Ver Web", modifier = Modifier.size(24.dp), tint = MaterialTheme.colorScheme.primary)
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                products.forEach { product ->
                    AsyncImage(
                        model = product.imageUrl,
                        contentDescription = null,
                        modifier = Modifier
                            .weight(1f)
                            .height(60.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .clickable { onProductClick(product.id) },
                        contentScale = ContentScale.Crop
                    )
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = { onStoreClick(store.id) },
                modifier = Modifier.fillMaxWidth().height(36.dp),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(0.dp)
            ) {
                Text("Ver Catálogo Completo", fontSize = 12.sp)
            }
        }
    }
}
