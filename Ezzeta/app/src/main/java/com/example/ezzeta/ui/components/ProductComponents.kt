package com.example.ezzeta.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.indication
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ezzeta.data.model.Category
import com.example.ezzeta.data.model.Product
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.util.Locale
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun ProductCard(
    product: Product,
    onFavoriteClick: () -> Unit,
    onClick: () -> Unit,
    onQuickViewClick: () -> Unit,
    modifier: Modifier = Modifier,
    onAppear: (() -> Unit)? = null
) {
    LaunchedEffect(product.id) {
        onAppear?.invoke()
    }
    
    val storeName = when (product.storeId) {
        "s1" -> "EZZETA"
        "s2" -> "CREPANTE"
        "s3" -> "MAXETA"
        "s4" -> "UOMO CATTIVO"
        else -> "Tienda"
    }

    Card(
        modifier = modifier.padding(8.dp),
        onClick = onClick,
        shape = RectangleShape,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column {
            Box(modifier = Modifier.height(200.dp).fillMaxWidth()) {
                AsyncImage(
                    model = product.imageUrl,
                    contentDescription = product.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop,
                    // Optimización de carga con Coil
                    alpha = 0.99f // Ayuda en algunos casos de renderizado
                )
                
                Surface(
                    modifier = Modifier.padding(8.dp).align(Alignment.TopStart),
                    color = Color.Black.copy(alpha = 0.6f),
                    shape = RectangleShape
                ) {
                    Text(
                        text = storeName,
                        color = Color.White,
                        fontSize = 10.sp,
                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
                        fontWeight = FontWeight.Bold
                    )
                }

                // Badge de Descuento (%)
                if (product.oldPrice != null && (product.oldPrice > product.price)) {
                    val discountPercent = ((1 - (product.price / product.oldPrice)) * 100).toInt()
                    Surface(
                        modifier = Modifier.padding(8.dp).align(Alignment.TopEnd),
                        color = Color(0xFFE53935), // Rojo vibrante para resaltar
                        shape = RectangleShape
                    ) {
                        Text(
                            text = "-$discountPercent%",
                            color = Color.White,
                            fontSize = 10.sp,
                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
                            fontWeight = FontWeight.Black
                        )
                    }
                }
            }
            Column(modifier = Modifier.padding(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = product.name,
                        style = MaterialTheme.typography.titleSmall,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                    IconButton(
                        onClick = onFavoriteClick,
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(
                            imageVector = if (product.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = null,
                            tint = if (product.isFavorite) Color.Red else Color.Gray,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .heightIn(min = 48.dp),
                        verticalArrangement = Arrangement.Center
                    ) {
                        product.oldPrice?.let { oldPrice ->
                            Text(
                                text = "S/ ${String.format(Locale.US, "%.2f", oldPrice)}",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color.Gray,
                                textDecoration = TextDecoration.LineThrough,
                                maxLines = 1,
                                softWrap = false
                            )
                        }
                        Text(
                            text = "S/ ${String.format(Locale.US, "%.2f", product.price)}",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary,
                            maxLines = 1,
                            softWrap = false
                        )
                    }
                    
                    IconButton(
                        onClick = onQuickViewClick,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ShoppingCart,
                            contentDescription = "Vista rápida",
                            tint = MaterialTheme.colorScheme.secondary,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun CategoryItem(category: Category, isSelected: Boolean, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.padding(horizontal = 8.dp)
    ) {
        Surface(
            onClick = onClick,
            shape = RoundedCornerShape(12.dp),
            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier.size(60.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text(
                    text = category.name.take(1),
                    fontSize = 20.sp,
                    color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        Text(
            text = category.name,
            style = MaterialTheme.typography.bodySmall,
            modifier = Modifier.padding(top = 4.dp)
        )
    }
}

@Composable
fun ProductCarousel(
    title: String,
    products: List<Product>,
    onProductClick: (String) -> Unit,
    onFavoriteClick: (Product) -> Unit,
    onQuickViewClick: (Product) -> Unit,
    onProductAppear: ((String) -> Unit)? = null
) {
    if (products.isEmpty()) return

    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
        )
        androidx.compose.foundation.lazy.LazyRow(
            contentPadding = PaddingValues(horizontal = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            items(
                count = products.size,
                key = { index -> products[index].id }
            ) { index ->
                val product = products[index]
                ProductCard(
                    product = product,
                    onFavoriteClick = { onFavoriteClick(product) },
                    onClick = { onProductClick(product.id) },
                    onQuickViewClick = { onQuickViewClick(product) },
                    modifier = Modifier.width(160.dp),
                    onAppear = { onProductAppear?.invoke(product.id) }
                )
            }
        }
    }
}

@Composable
fun ProductQuickViewContent(
    product: Product,
    onAddToCart: (String, Int) -> Unit,
    onToggleFavorite: () -> Unit,
    onClose: () -> Unit
) {
    var quantity by remember { mutableIntStateOf(1) }
    val productImages = remember(product) { product.imageUrls.ifEmpty { listOf(product.imageUrl) } }
    val pagerState = rememberPagerState(pageCount = { productImages.size })

    LaunchedEffect(pagerState.pageCount) {
        if (productImages.size > 1) {
            while (true) {
                delay(3000)
                val nextPage = (pagerState.currentPage + 1) % pagerState.pageCount
                pagerState.animateScrollToPage(nextPage)
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(modifier = Modifier.size(250.dp)) {
            HorizontalPager(
                state = pagerState,
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(16.dp))
            ) { page ->
                AsyncImage(
                    model = productImages[page],
                    contentDescription = product.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }
            
            // Indicadores simples para la vista rápida
            if (productImages.size > 1) {
                Row(
                    Modifier
                        .height(24.dp)
                        .fillMaxWidth()
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 8.dp),
                    horizontalArrangement = Arrangement.Center
                ) {
                    repeat(productImages.size) { iteration ->
                        val color = if (pagerState.currentPage == iteration) Color.White else Color.White.copy(alpha = 0.5f)
                        Box(
                            modifier = Modifier
                                .padding(2.dp)
                                .clip(CircleShape)
                                .background(color)
                                .size(6.dp)
                        )
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = product.name,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )
        
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (product.oldPrice != null) {
                Text(
                    text = "S/ ${String.format(Locale.US, "%.2f", product.oldPrice)}",
                    style = MaterialTheme.typography.titleMedium,
                    color = Color.Gray,
                    textDecoration = TextDecoration.LineThrough,
                    modifier = Modifier.padding(end = 12.dp),
                    maxLines = 1,
                    softWrap = false
                )
            }
            Text(
                text = "S/ ${String.format(Locale.US, "%.2f", product.price)}",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Black,
                maxLines = 1,
                softWrap = false
            )
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = product.description,
            style = MaterialTheme.typography.bodyMedium,
            color = Color.Gray,
            modifier = Modifier.padding(horizontal = 8.dp)
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        val sizes = product.getAvailableSizes()
        var selectedSize by remember(product.id) { mutableStateOf(sizes.firstOrNull() ?: "") }

        if (sizes.isNotEmpty()) {
            Text(text = "Seleccionar Talla", fontWeight = FontWeight.Bold)
            Row(
                modifier = Modifier.padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                sizes.forEach { size ->
                    val isSelected = selectedSize == size
                    Surface(
                        modifier = Modifier
                            .size(width = 50.dp, height = 36.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .clickable { selectedSize = size }
                            .border(
                                width = 1.dp,
                                color = if (isSelected) MaterialTheme.colorScheme.primary else Color.LightGray,
                                shape = RoundedCornerShape(8.dp)
                            ),
                        color = if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = size,
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(text = "Cantidad", fontWeight = FontWeight.Bold)
        QuantitySelector(
            quantity = quantity,
            onQuantityChange = { quantity = it },
            modifier = Modifier.padding(vertical = 8.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            OutlinedIconButton(
                onClick = onToggleFavorite,
                modifier = Modifier.size(56.dp)
            ) {
                Icon(
                    imageVector = if (product.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                    contentDescription = null,
                    tint = if (product.isFavorite) Color.Red else MaterialTheme.colorScheme.onSurface
                )
            }
            
            Button(
                onClick = { 
                    onAddToCart(selectedSize, quantity)
                    onClose()
                },
                modifier = Modifier.weight(1f).height(56.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.ShoppingCart, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Añadir a la cesta")
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
    }
}

/**
 * Un botón que repite su acción mientras se mantiene presionado.
 */
@Composable
fun AutoRepeatIconButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    contentDescription: String?,
    enabled: Boolean = true,
    onClick: () -> Unit
) {
    val scope = rememberCoroutineScope()
    val interactionSource = remember { MutableInteractionSource() }
    
    val currentOnClick by rememberUpdatedState(onClick)
    
    Box(
        modifier = Modifier
            .size(40.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(if (enabled) Color.Transparent else Color.Transparent)
            .indication(interactionSource, ripple())
            .pointerInput(enabled) {
                if (!enabled) return@pointerInput
                detectTapGestures(
                    onPress = {
                        val job = scope.launch {
                            currentOnClick()
                            delay(400) // Espera inicial
                            while (true) {
                                currentOnClick()
                                delay(80) // Intervalo más rápido
                            }
                        }
                        try {
                            awaitRelease()
                        } finally {
                            job.cancel()
                        }
                    }
                )
            },
        contentAlignment = Alignment.Center
    ) {
        Icon(
            icon, 
            contentDescription = contentDescription,
            tint = if (enabled) MaterialTheme.colorScheme.primary else Color.LightGray,
            modifier = Modifier.size(24.dp)
        )
    }
}

/**
 * Selector de cantidad mejorado con entrada manual y botones de auto-repetición.
 */
@Composable
fun QuantitySelector(
    quantity: Int,
    onQuantityChange: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val textValue = remember(quantity) { mutableStateOf(quantity.toString()) }

    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = modifier
            .border(1.dp, Color.LightGray.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
            .padding(4.dp)
    ) {
        AutoRepeatIconButton(
            icon = Icons.Default.Remove,
            contentDescription = "Disminuir",
            enabled = quantity > 1,
            onClick = { onQuantityChange(quantity - 1) }
        )

        Box(
            modifier = Modifier
                .width(60.dp) // Un poco más ancho
                .height(40.dp) // Un poco más alto
                .background(
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    shape = RoundedCornerShape(8.dp)
                ),
            contentAlignment = Alignment.Center
        ) {
            BasicTextField(
                value = textValue.value,
                onValueChange = { newValue ->
                    if (newValue.isEmpty()) {
                        textValue.value = ""
                        return@BasicTextField
                    }
                    if (newValue.all { it.isDigit() }) {
                        val limitedValue = if (newValue.length > 3) newValue.take(3) else newValue
                        textValue.value = limitedValue
                        limitedValue.toIntOrNull()?.let { 
                            if (it > 0) onQuantityChange(it) 
                        }
                    }
                },
                textStyle = MaterialTheme.typography.titleMedium.copy(
                    textAlign = TextAlign.Center,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.onSurface
                ),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
        }

        AutoRepeatIconButton(
            icon = Icons.Default.Add,
            contentDescription = "Aumentar",
            onClick = { onQuantityChange(quantity + 1) }
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun FilterDrawerContent(
    viewModel: MainViewModel,
    onClose: () -> Unit
) {
    val priceRange by viewModel.priceRange.collectAsState()
    val minAvailablePrice by viewModel.minAvailablePrice.collectAsState()
    val maxAvailablePrice by viewModel.maxAvailablePrice.collectAsState()
    val selectedSizes by viewModel.selectedSizes.collectAsState()
    val selectedCategoryId by viewModel.selectedCategoryId.collectAsState()
    val categories by viewModel.categories.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxHeight()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            "Explorar y Filtrar",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        Text("Categorías", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
        
        categories.forEach { category ->
            NavigationDrawerItem(
                label = { Text(category.name) },
                selected = category.id == selectedCategoryId,
                onClick = {
                    viewModel.onCategorySelected(category.id)
                    onClose()
                },
                modifier = Modifier.padding(vertical = 2.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text("Filtrar por Precio", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        Text("Rango: S/ ${priceRange.start.toInt()} - S/ ${priceRange.endInclusive.toInt()}", style = MaterialTheme.typography.bodySmall)
        
        // Aseguramos que el rango sea válido para el slider
        val safeMin = minAvailablePrice
        val safeMax = if (maxAvailablePrice > minAvailablePrice) maxAvailablePrice else minAvailablePrice + 0.01f
        val safeRange = priceRange.start.coerceIn(safeMin, safeMax)..priceRange.endInclusive.coerceIn(safeMin, safeMax)

        RangeSlider(
            value = safeRange,
            onValueChange = { viewModel.onPriceRangeChange(it) },
            valueRange = safeMin..safeMax,
            modifier = Modifier.padding(vertical = 8.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))
        Text("Filtrar por Talla", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        val allAvailableSizes = listOf("S", "M", "L", "XL", "28", "30", "32", "34", "36")
        
        FlowRow(
            modifier = Modifier.padding(vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            maxItemsInEachRow = 4
        ) {
            allAvailableSizes.forEach { size ->
                val isSelected = selectedSizes.contains(size)
                FilterChip(
                    selected = isSelected,
                    onClick = { viewModel.onSizeToggle(size) },
                    label = { Text(size) }
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text("Filtrar por Tienda", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        val stores = viewModel.getStores()
        val selectedStoreId by viewModel.selectedStoreId.collectAsState()
        
        FlowRow(
            modifier = Modifier.padding(vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            maxItemsInEachRow = 3
        ) {
            stores.forEach { store ->
                val isSelected = selectedStoreId == store.id
                FilterChip(
                    selected = isSelected,
                    onClick = { viewModel.onStoreSelected(store.id) },
                    label = { Text(store.name) }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = { viewModel.clearFilters() },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant, contentColor = MaterialTheme.colorScheme.onSurfaceVariant)
        ) {
            Text("Limpiar Filtros")
        }
        Button(
            onClick = onClose,
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        ) {
            Text("Ver Resultados")
        }
    }
}

@Composable
fun CategoryTabRow(
    viewModel: MainViewModel,
    isMarketplace: Boolean = false
) {
    val selectedCategoryId by (if (isMarketplace) viewModel.marketplaceFilterManager.selectedCategoryId else viewModel.storeFilterManager.selectedCategoryId).collectAsState()
    val categories by (if (isMarketplace) viewModel.marketplaceCategories else viewModel.storeCategories).collectAsState()
    
    if (categories.isEmpty()) return

    val selectedIndex = categories.indexOfFirst { it.id == selectedCategoryId }.coerceAtLeast(0)

    ScrollableTabRow(
        selectedTabIndex = selectedIndex,
        modifier = Modifier.fillMaxWidth(),
        edgePadding = 16.dp,
        containerColor = Color.Transparent,
        contentColor = MaterialTheme.colorScheme.primary,
        divider = {},
        indicator = { tabPositions ->
            if (selectedIndex < tabPositions.size) {
                TabRowDefaults.SecondaryIndicator(
                    Modifier.tabIndicatorOffset(tabPositions[selectedIndex]),
                    color = MaterialTheme.colorScheme.primary,
                    height = 2.dp
                )
            }
        }
    ) {
        categories.forEach { category ->
            val isSelected = category.id == selectedCategoryId
            Tab(
                selected = isSelected,
                onClick = { 
                    if (isMarketplace) viewModel.onMarketplaceCategorySelected(category.id)
                    else viewModel.onCategorySelected(category.id) 
                },
                text = {
                    Text(
                        text = category.name,
                        color = if (isSelected) MaterialTheme.colorScheme.primary else Color.Gray,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        fontSize = 16.sp
                    )
                }
            )
        }
    }
}

@Composable
fun SubCategoryBubbleRow(
    viewModel: MainViewModel,
    isMarketplace: Boolean = false
) {
    val selectedCategoryId by (if (isMarketplace) viewModel.marketplaceFilterManager.selectedCategoryId else viewModel.storeFilterManager.selectedCategoryId).collectAsState()
    val selectedSubCategory by (if (isMarketplace) viewModel.marketplaceFilterManager.selectedSubCategory else viewModel.storeFilterManager.selectedSubCategory).collectAsState()
    val categories by (if (isMarketplace) viewModel.marketplaceCategories else viewModel.storeCategories).collectAsState()
    val currentCategory = categories.find { it.id == selectedCategoryId }
    val subCategories = listOf("Todo") + (currentCategory?.subCategories ?: emptyList())

    androidx.compose.foundation.lazy.LazyRow(
        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 12.dp)
    ) {
        items(
            items = subCategories,
            key = { it }
        ) { sub ->
            val isSelected = sub == selectedSubCategory
            Surface(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .clickable { 
                        if (isMarketplace) viewModel.onMarketplaceSubCategorySelected(sub)
                        else viewModel.onSubCategorySelected(sub) 
                    }
                    .border(
                        width = 1.dp,
                        color = if (isSelected) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.outline,
                        shape = RoundedCornerShape(20.dp)
                    ),
                color = if (isSelected) MaterialTheme.colorScheme.secondary else Color.Transparent
            ) {
                Text(
                    text = sub,
                    color = if (isSelected) MaterialTheme.colorScheme.onSecondary else MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp),
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                    fontSize = 13.sp
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FilterSearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    onMenuClick: () -> Unit,
    onThemeToggle: () -> Unit,
    isDarkTheme: Boolean,
    onBack: (() -> Unit)? = null,
    actions: @Composable RowScope.() -> Unit = {}
) {
    TopAppBar(
        navigationIcon = {
            if (onBack != null) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                }
            } else {
                IconButton(onClick = onMenuClick) {
                    Icon(Icons.Default.Menu, contentDescription = "Menú")
                }
            }
        },
        title = {
            OutlinedTextField(
                value = query,
                onValueChange = onQueryChange,
                placeholder = { Text("Buscar productos...", fontSize = 14.sp) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(end = 8.dp),
                shape = RoundedCornerShape(25.dp),
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, modifier = Modifier.size(20.dp)) },
                colors = OutlinedTextFieldDefaults.colors(
                    unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                    focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                    unfocusedBorderColor = Color.Transparent,
                    focusedBorderColor = Color.Transparent
                ),
                singleLine = true
            )
        },
        actions = {
            IconButton(onClick = onThemeToggle) {
                Icon(
                    imageVector = if (isDarkTheme) Icons.Default.LightMode else Icons.Default.Nightlight,
                    contentDescription = "Cambiar tema"
                )
            }
            if (onBack != null) {
                IconButton(onClick = onMenuClick) {
                    Icon(Icons.Default.Menu, contentDescription = "Filtros")
                }
            }
            actions()
        }
    )
}
