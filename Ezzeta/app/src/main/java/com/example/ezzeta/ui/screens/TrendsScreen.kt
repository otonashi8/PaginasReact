package com.example.ezzeta.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
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
import com.example.ezzeta.data.mock.MockData
import com.example.ezzeta.ui.components.*
import com.example.ezzeta.ui.viewmodel.MainViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TrendsScreen(
    viewModel: MainViewModel,
    onProductClick: (String) -> Unit,
    onStoreClick: (String) -> Unit
) {
    val context = LocalContext.current
    val hashtags = MockData.hashtags
    val stores = viewModel.getStores()
    val user by viewModel.currentUser.collectAsState()
    val allProducts by viewModel.allProducts.collectAsState()
    val isDarkTheme by viewModel.isDarkTheme.collectAsState()
    
    val pagerState = rememberPagerState(pageCount = { hashtags.size })
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    val showScrollToTop by remember {
        derivedStateOf { listState.firstVisibleItemIndex > 0 }
    }

    LaunchedEffect(Unit) {
        while (true) {
            delay(4000)
            val nextPage = (pagerState.currentPage + 1) % hashtags.size
            pagerState.animateScrollToPage(nextPage)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Trends",
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
        LazyColumn(
            state = listState,
            modifier = Modifier.padding(padding).fillMaxSize(),
            contentPadding = PaddingValues(bottom = 24.dp)
        ) {
            // # carrusel
            item {
                HorizontalPager(
                    state = pagerState,
                    modifier = Modifier.fillMaxWidth().height(250.dp)
                ) { page ->
                    val tag = hashtags[page]
                    val tagProducts = remember(tag, allProducts) {
                        allProducts.filter { it.isVisible && it.hashtags.contains(tag) }.take(3)
                    }
                    
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = tag,
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Black,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            tagProducts.forEach { product ->
                                // Prefetch data when appears
                                LaunchedEffect(product.id) {
                                    viewModel.prefetchProduct(product.id)
                                }
                                Box(modifier = Modifier.weight(1f).height(150.dp)) {
                                    AsyncImage(
                                        model = product.imageUrl,
                                        contentDescription = null,
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .clip(RoundedCornerShape(12.dp))
                                            .clickable { onProductClick(product.id) },
                                        contentScale = ContentScale.Crop
                                    )
                                    FilledIconButton(
                                        onClick = { viewModel.onQuickViewProduct(context, product) },
                                        modifier = Modifier.size(24.dp).align(Alignment.BottomEnd).padding(4.dp),
                                        colors = IconButtonDefaults.filledIconButtonColors(containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.7f))
                                    ) {
                                        Icon(Icons.Default.ShoppingCart, contentDescription = "Vista rápida", modifier = Modifier.size(14.dp), tint = Color.White)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            item {
                Text(
                    text = "Familia Ezzeta",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }

            // tiendas destacadas
            items(
                items = stores,
                key = { it.id }
            ) { store ->
                val isFollowed = user?.followedStoreIds?.contains(store.id) == true
                val storeProducts = remember(store.id, allProducts) {
                    allProducts.filter { it.isVisible && it.storeId == store.id }.take(4)
                }

                Card(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            AsyncImage(
                                model = store.logoUrl,
                                contentDescription = null,
                                modifier = Modifier.size(50.dp).clip(CircleShape),
                                contentScale = ContentScale.Crop
                            )
                            Column(modifier = Modifier.padding(start = 12.dp).weight(1f)) {
                                Text(text = store.name, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                                Text(text = "${store.followersCount} seguidores", style = MaterialTheme.typography.labelSmall)
                            }
                            
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(
                                    onClick = { onStoreClick(store.id) },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = MaterialTheme.colorScheme.secondary,
                                        contentColor = MaterialTheme.colorScheme.onSecondary
                                    ),
                                    shape = RoundedCornerShape(20.dp),
                                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 0.dp)
                                ) {
                                    Text("Ver", fontSize = 12.sp)
                                }
                                Button(
                                    onClick = { viewModel.toggleFollowStore(context, store.id) },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (isFollowed) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondary,
                                        contentColor = if (isFollowed) Color.White else MaterialTheme.colorScheme.onSecondary
                                    ),
                                    shape = RoundedCornerShape(20.dp),
                                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 0.dp)
                                ) {
                                    if (isFollowed) {
                                        Icon(
                                            imageVector = Icons.Default.Check,
                                            contentDescription = null,
                                            modifier = Modifier.size(14.dp).padding(end = 4.dp)
                                        )
                                    }
                                    Text(if (isFollowed) "Siguiendo" else "+ Seguir", fontSize = 12.sp)
                                }
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            storeProducts.forEach { product ->
                                Box(modifier = Modifier.weight(1f).height(80.dp)) {
                                    AsyncImage(
                                        model = product.imageUrl,
                                        contentDescription = null,
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .clip(RoundedCornerShape(8.dp))
                                            .clickable { onProductClick(product.id) },
                                        contentScale = ContentScale.Crop
                                    )
                                    FilledIconButton(
                                        onClick = { viewModel.onQuickViewProduct(context, product) },
                                        modifier = Modifier.size(20.dp).align(Alignment.BottomEnd).padding(2.dp),
                                        colors = IconButtonDefaults.filledIconButtonColors(containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.7f))
                                    ) {
                                        Icon(Icons.Default.ShoppingCart, contentDescription = "Vista rápida", modifier = Modifier.size(12.dp), tint = Color.White)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // sección cliente para el cliente
            item {
                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    text = "Del cliente para el cliente",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
                
                val clientProducts = allProducts.filter { it.isClientProduct && it.stock > 0 && it.isVisible }
                
                if (clientProducts.isEmpty()) {
                    Text(
                        text = "Aún no hay productos publicados por clientes.",
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(16.dp),
                        color = Color.Gray
                    )
                } else {
                    LazyRow(
                        modifier = Modifier.fillMaxWidth(),
                        contentPadding = PaddingValues(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        items(clientProducts) { product ->
                            Card(
                                modifier = Modifier.width(200.dp),
                                shape = RoundedCornerShape(16.dp)
                            ) {
                                Column(
                                    modifier = Modifier.padding(16.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    AsyncImage(
                                        model = product.imageUrl,
                                        contentDescription = null,
                                        modifier = Modifier.size(100.dp).clip(RoundedCornerShape(8.dp)),
                                        contentScale = ContentScale.Crop
                                    )
                                    Text(text = product.name, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 8.dp), maxLines = 1)
                                    Text(text = "S/ ${product.price}", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                                    
                                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                                    
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color.Gray)
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(text = product.sellerName ?: "Vendedor", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                                    }

                                    Button(
                                        onClick = { onProductClick(product.id) },
                                        modifier = Modifier.padding(top = 12.dp).fillMaxWidth(),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text("Ver producto", fontSize = 11.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
