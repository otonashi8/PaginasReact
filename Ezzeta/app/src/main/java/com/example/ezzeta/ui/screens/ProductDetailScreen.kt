package com.example.ezzeta.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Link
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ezzeta.ui.components.ProductCard
import com.example.ezzeta.ui.components.QuantitySelector
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.util.Locale
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    productId: String?, 
    viewModel: MainViewModel, 
    onBack: () -> Unit,
    onStoreClick: (String) -> Unit,
    onProductClick: (String) -> Unit
) {
    val context = LocalContext.current
    val allProducts by viewModel.allProducts.collectAsState()
    val product = remember(productId, allProducts) { allProducts.firstOrNull { it.id == productId } }
    val currentUser by viewModel.currentUser.collectAsState()
    
    // Productos relacionados por categoría (Obtenemos IDs primero para mantener la reactividad)
    val relatedProductIds = remember(product) { 
        product?.let { viewModel.getRelatedProducts(it).map { p -> p.id } } ?: emptyList() 
    }
    
    // Sincronizar los productos relacionados con el estado global de allProducts
    val relatedProducts = remember(relatedProductIds, allProducts) {
        relatedProductIds.mapNotNull { id -> allProducts.firstOrNull { p -> p.id == id && p.isVisible } }
    }
    
    val chunkedRelatedProducts = remember(relatedProducts) { relatedProducts.chunked(2) }
    val relatedPagerState = rememberPagerState(pageCount = { chunkedRelatedProducts.size })

    val productImages = remember(product) { product?.imageUrls?.ifEmpty { listOf(product.imageUrl) } ?: emptyList() }
    val mainPagerState = rememberPagerState(pageCount = { productImages.size })

    var selectedSize by remember { mutableStateOf("") }
    var quantity by remember { mutableIntStateOf(1) }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    
    // Tallas dinámicas desde el modelo
    val sizes = remember(product) { product?.getAvailableSizes() ?: emptyList() }
    
    // Precio actual basado en la variante seleccionada
    val currentPrice = remember(product, selectedSize) {
        val variant = product?.variants?.find { it.name == selectedSize }
        variant?.price ?: product?.price ?: 0.0
    }

    LaunchedEffect(product) {
        // Añadir al historial al entrar
        product?.let { 
            viewModel.addToHistory(context, it)
            if (selectedSize.isEmpty()) {
                selectedSize = it.getAvailableSizes().firstOrNull() ?: ""
            }
        }
    }

    LaunchedEffect(relatedPagerState.pageCount) {
        // Autodesplazamiento de productos relacionados
        if (relatedProducts.isNotEmpty()) {
            while (true) {
                delay(3000)
                val nextPage = (relatedPagerState.currentPage + 1) % relatedPagerState.pageCount
                relatedPagerState.animateScrollToPage(nextPage)
            }
        }
    }

    LaunchedEffect(mainPagerState.pageCount) {
        // Autodesplazamiento de imágenes del producto
        if (productImages.size > 1) {
            while (true) {
                delay(4000)
                val nextPage = (mainPagerState.currentPage + 1) % mainPagerState.pageCount
                mainPagerState.animateScrollToPage(nextPage)
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Ficha Técnica", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                }
            )
        },
        bottomBar = {
            if (product != null && product.isVisible) {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shadowElevation = 16.dp,
                    color = MaterialTheme.colorScheme.surface
                ) {
                    Row(
                        modifier = Modifier
                            .padding(16.dp)
                            .navigationBarsPadding(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Monto Total",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color.Gray
                            )
                            Text(
                                text = "S/ ${String.format(Locale.US, "%.2f", currentPrice * quantity)}",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                        Button(
                            onClick = { 
                                if (selectedSize.isNotEmpty()) {
                                    viewModel.addToCart(context, product, selectedSize, quantity, currentPrice)
                                    scope.launch {
                                        snackbarHostState.showSnackbar("Producto añadido a la cesta")
                                    }
                                }
                            },
                            enabled = selectedSize.isNotEmpty(),
                            modifier = Modifier.weight(1.5f),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                text = if (selectedSize.isEmpty()) "Elige Talla" else "Añadir a la Cesta",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    ) { padding ->
        if (product == null || !product.isVisible) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(if (product == null) "Producto no encontrado" else "Este producto ya no está disponible")
            }
        } else {
            val categories by viewModel.categories.collectAsState()
            val categoryName = categories.firstOrNull { it.id == product.categoryId }?.name ?: "Categoría"
            val subCats = if (product.subCategories.isNotEmpty()) " / ${product.subCategories.joinToString(", ")}" else ""
            val breadcrumb = "$categoryName$subCats / ${product.name}"

            LazyColumn(
                modifier = Modifier
                    .padding(padding)
                    .fillMaxSize()
            ) {
                item(key = "product_image_carousel") {
                    Column {
                        if (productImages.size > 1) {
                            HorizontalPager(
                                state = mainPagerState,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(450.dp)
                            ) { page ->
                                AsyncImage(
                                    model = productImages[page],
                                    contentDescription = "${product.name} image $page",
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop
                                )
                            }
                            
                            // Miniaturas debajo de la imagen principal
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 12.dp, horizontal = 16.dp),
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                productImages.forEachIndexed { index, imgUrl ->
                                    val isSelected = mainPagerState.currentPage == index
                                    Box(
                                        modifier = Modifier
                                            .padding(horizontal = 4.dp)
                                            .size(50.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                            .border(
                                                width = 2.dp,
                                                color = if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent,
                                                shape = RoundedCornerShape(8.dp)
                                            )
                                            .clickable {
                                                scope.launch {
                                                    mainPagerState.animateScrollToPage(index)
                                                }
                                            }
                                    ) {
                                        AsyncImage(
                                            model = imgUrl,
                                            contentDescription = "Thumbnail $index",
                                            modifier = Modifier.fillMaxSize(),
                                            contentScale = ContentScale.Crop
                                        )
                                    }
                                }
                            }
                        } else {
                            AsyncImage(
                                model = productImages.firstOrNull() ?: product.imageUrl,
                                contentDescription = product.name,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(450.dp),
                                contentScale = ContentScale.Crop
                            )
                        }
                    }
                }
                
                item(key = "product_info") {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = breadcrumb,
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.Gray,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = product.name,
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Bold
                            )
                            IconButton(onClick = { viewModel.toggleProductFavorite(context, product.id) }) {
                                Icon(
                                    imageVector = if (product.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                    contentDescription = null,
                                    tint = if (product.isFavorite) Color.Red else Color.Gray
                                )
                            }
                        }
                        
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            if (product.oldPrice != null && product.variants.isNullOrEmpty()) {
                                Text(
                                    text = "S/ ${String.format(Locale.US, "%.2f", product.oldPrice)}",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = Color.Gray,
                                    textDecoration = TextDecoration.LineThrough,
                                    modifier = Modifier.padding(end = 12.dp)
                                )
                            }
                            Text(
                                text = "S/ ${String.format(Locale.US, "%.2f", currentPrice)}",
                                style = MaterialTheme.typography.headlineSmall,
                                color = MaterialTheme.colorScheme.primary,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))

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
                                            .size(width = 60.dp, height = 40.dp)
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
                                                fontWeight = FontWeight.Bold
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

                        Spacer(modifier = Modifier.height(16.dp))

                        // Extras: Garantías (se ocultan para la tienda s5)
                        if (product.storeId != "s5") {
                            Surface(
                                modifier = Modifier.fillMaxWidth(),
                                color = Color.LightGray.copy(alpha = 0.2f),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    SecurityText(text = "✓ Paga con tarjeta o yape")
                                    SecurityText(text = "✓ Compras 100% seguras")
                                    SecurityText(text = "✓ Prendas con garantía")
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        Text(text = "Compartir", fontWeight = FontWeight.Bold)
                        val shareUrl = "https://ezzetacompany.com/prenda/polo-luxury-verde-uomo-cattivo/"
                        val shareText = "¡Mira este producto en EZZETA!: ${product.name} - S/ ${product.price}\n$shareUrl\n${product.imageUrl}"
                        
                        Row(
                            modifier = Modifier.padding(vertical = 8.dp),
                            horizontalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            // WhatsApp
                            ShareIconUrl(
                                url = "https://cdn-icons-png.flaticon.com/512/733/733585.png",
                                color = Color(0xFF25D366)
                            ) {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/?text=${Uri.encode(shareText)}"))
                                context.startActivity(intent)
                            }
                            
                            // Facebook
                            ShareIconUrl(
                                url = "https://cdn-icons-png.flaticon.com/512/145/145802.png",
                                color = Color(0xFF1877F2)
                            ) {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.facebook.com/sharer/sharer.php?u=${Uri.encode(shareUrl)}"))
                                context.startActivity(intent)
                            }
                            
                            // Instagram
                            ShareIconUrl(
                                url = "https://static.vecteezy.com/system/resources/thumbnails/018/930/413/small/instagram-logo-instagram-icon-transparent-free-png.png",
                                color = Color(0xFFE4405F)
                            ) {
                                val intent = Intent(Intent.ACTION_SEND).apply {
                                    type = "text/plain"
                                    putExtra(Intent.EXTRA_TEXT, shareText)
                                    `package` = "com.instagram.android"
                                }
                                try {
                                    context.startActivity(intent)
                                } catch (e: Exception) {
                                    // Si no está instalado, usar el genérico
                                    val genericIntent = Intent(Intent.ACTION_SEND).apply {
                                        type = "text/plain"
                                        putExtra(Intent.EXTRA_TEXT, shareText)
                                    }
                                    context.startActivity(Intent.createChooser(genericIntent, "Compartir en Instagram"))
                                }
                            }
                            
                            // Enlace (Copiar)
                            ShareIcon(icon = Icons.Default.Link, color = MaterialTheme.colorScheme.onSurface) {
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                val clip = ClipData.newPlainText("Producto EZZETA", shareText)
                                clipboard.setPrimaryClip(clip)
                                Toast.makeText(context, "Información copiada al portapapeles", Toast.LENGTH_SHORT).show()
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = "Descripción",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = product.description,
                            style = MaterialTheme.typography.bodyLarge,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }
                }

                item(key = "store_info") {
                    val store = viewModel.getStoreById(product.storeId)
                    if (store != null) {
                        val isFollowing = currentUser?.followedStoreIds?.contains(store.id) == true
                        
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "Sobre La Tienda",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(bottom = 16.dp)
                            )

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                AsyncImage(
                                    model = store.logoUrl,
                                    contentDescription = store.name,
                                    modifier = Modifier
                                        .size(60.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .border(1.dp, Color.LightGray, RoundedCornerShape(8.dp)),
                                    contentScale = ContentScale.Crop
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = store.name,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 18.sp
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Surface(
                                            color = Color(0xFF6200EE),
                                            shape = RoundedCornerShape(4.dp)
                                        ) {}
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedButton(
                                    onClick = { onStoreClick(store.id) },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(8.dp),
                                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
                                ) {
                                    Text("Todos los artículos", color = MaterialTheme.colorScheme.onSurface)
                                }
                                OutlinedButton(
                                    onClick = { viewModel.toggleFollowStore(context, store.id) },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(8.dp),
                                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
                                ) {
                                    Text(
                                        text = if (isFollowing) "Siguiendo" else "+ Seguir",
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        }
                    }
                }

                if (relatedProducts.isNotEmpty()) {
                    item(key = "related_products_header") {
                        Text(
                            text = "Otros Productos",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                        )
                    }

                    item(key = "related_products_pager") {
                        HorizontalPager(
                            state = relatedPagerState,
                            modifier = Modifier.fillMaxWidth().height(320.dp),
                            contentPadding = PaddingValues(horizontal = 16.dp),
                            pageSpacing = 12.dp
                        ) { page ->
                            val chunk = chunkedRelatedProducts[page]
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                chunk.forEach { relatedProduct ->
                                    ProductCard(
                                        product = relatedProduct,
                                        onFavoriteClick = { viewModel.toggleProductFavorite(context, relatedProduct.id) },
                                        onClick = { onProductClick(relatedProduct.id) },
                                        onQuickViewClick = { viewModel.onQuickViewProduct(context, relatedProduct) },
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                                if (chunk.size < 2) {
                                    Spacer(modifier = Modifier.weight(1f))
                                }
                            }
                        }
                    }
                }

                item {
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
}

@Composable
fun SecurityText(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.bodyMedium,
        color = Color(0xFF2E7D32), // Verde
        fontWeight = FontWeight.Medium,
        modifier = Modifier.padding(vertical = 2.dp)
    )
}

@Composable
fun ShareIcon(icon: androidx.compose.ui.graphics.vector.ImageVector, color: Color, onClick: () -> Unit) {
    Surface(
        modifier = Modifier.size(40.dp),
        shape = CircleShape,
        color = color.copy(alpha = 0.1f),
        onClick = onClick
    ) {
        Box(contentAlignment = Alignment.Center) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(20.dp))
        }
    }
}

@Composable
fun ShareIconUrl(url: String, color: Color, onClick: () -> Unit) {
    Surface(
        modifier = Modifier.size(40.dp),
        shape = CircleShape,
        color = color.copy(alpha = 0.1f),
        onClick = onClick
    ) {
        Box(contentAlignment = Alignment.Center) {
            AsyncImage(
                model = url,
                contentDescription = null,
                modifier = Modifier.size(24.dp)
            )
        }
    }
}
