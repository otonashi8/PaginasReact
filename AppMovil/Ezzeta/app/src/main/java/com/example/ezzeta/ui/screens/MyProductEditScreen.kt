package com.example.ezzeta.ui.screens

import android.widget.Toast
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ezzeta.data.model.Product
import com.example.ezzeta.data.model.ProductVariant
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyProductEditScreen(
    productId: String,
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val user by viewModel.currentUser.collectAsState()
    val allProducts by viewModel.allProducts.collectAsState()
    val product = remember(productId, allProducts) { allProducts.find { it.id == productId } }
    val isModerating by viewModel.isModerating.collectAsState()
    
    // Validación de propiedad del producto
    if (product != null && user != null && product.sellerId != user?.uuid) {
        LaunchedEffect(Unit) {
            Toast.makeText(context, "No tienes permiso para editar este producto", Toast.LENGTH_LONG).show()
            onBack()
        }
        return
    }

    if (product == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Producto no encontrado.")
        }
        return
    }

    var name by remember(product) { mutableStateOf(product.name) }
    var description by remember(product) { mutableStateOf(product.description) }
    
    // Imágenes y Galería
    val imageUrls = remember(product) { mutableStateListOf<String>().apply { addAll(product.imageUrls.ifEmpty { listOf(product.imageUrl) }) } }
    var newImageUrl by remember { mutableStateOf("") }

    // Categorías y Subcategorías
    val selectedCategoryIds = remember(product) { mutableStateListOf<String>().apply { addAll(product.categoryIds) } }
    val selectedSubCategoryIds = remember(product) { mutableStateListOf<String>().apply { addAll(product.subCategoryIds) } }
    
    var basePriceText by remember(product) { mutableStateOf(product.price.toString()) }
    var globalStockText by remember(product) { mutableStateOf(product.stock.toString()) }

    var hasDiscount by remember(product) { mutableStateOf(product.oldPrice != null && product.oldPrice!! > product.price) }

    var originalPriceText by remember(product) { 
        mutableStateOf(if (hasDiscount) product.oldPrice.toString() else product.price.toString()) 
    }
    var salePriceText by remember(product) { 
        mutableStateOf(if (hasDiscount) product.price.toString() else "") 
    }

    var variants by remember(product) { 
        mutableStateOf(product.variants?.toMutableList() ?: mutableListOf<ProductVariant>()) 
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Editar Producto") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                },
                actions = {
                    if (isModerating) {
                        CircularProgressIndicator(modifier = Modifier.padding(end = 16.dp).size(24.dp), strokeWidth = 2.dp)
                    }
                    Button(
                        onClick = {
                            if (name.isBlank()) {
                                Toast.makeText(context, "El nombre es obligatorio", Toast.LENGTH_SHORT).show()
                                return@Button
                            }

                            val updatedProduct = product.copy(
                                name = name,
                                description = description,
                                imageUrl = imageUrls.firstOrNull() ?: "",
                                imageUrls = imageUrls.toList(),
                                categoryIds = selectedCategoryIds.toList(),
                                subCategoryIds = selectedSubCategoryIds.toList(),
                                variants = if (variants.isEmpty()) null else variants,
                                stock = if (product.useStockBySize) variants.sumOf { it.stock } else globalStockText.toIntOrNull() ?: product.stock
                            ).let { p ->
                                if (!product.usePriceBySize) {
                                    val orig = originalPriceText.toDoubleOrNull() ?: p.price
                                    val sale = if (hasDiscount) salePriceText.toDoubleOrNull() else null
                                    
                                    if (hasDiscount && sale != null && sale < orig) {
                                        p.copy(price = sale, oldPrice = orig)
                                    } else {
                                        p.copy(price = orig, oldPrice = null)
                                    }
                                } else {
                                    p
                                }
                            }

                            viewModel.updateProduct(context, updatedProduct) { success ->
                            if (success) onBack()
                        }
                        },
                        modifier = Modifier.padding(end = 8.dp),
                        enabled = !isModerating
                    ) {
                        Text("Guardar")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .padding(16.dp)
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Nombre del Producto") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            
            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Descripción") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3
            )

            Text("Galería de Imágenes", fontWeight = FontWeight.Bold)
            imageUrls.forEachIndexed { index, url ->
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        modifier = Modifier.size(50.dp).clip(RoundedCornerShape(8.dp)),
                        color = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        AsyncImage(model = url, contentDescription = null, contentScale = ContentScale.Crop)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (index == 0) "Imagen Principal" else "Imagen ${index + 1}",
                        modifier = Modifier.weight(1f),
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = if (index == 0) FontWeight.Bold else FontWeight.Normal
                    )
                    Row {
                        if (index > 0) {
                            IconButton(onClick = { 
                                val item = imageUrls.removeAt(index)
                                imageUrls.add(index - 1, item)
                            }) { Icon(Icons.Default.ArrowUpward, contentDescription = "Subir") }
                        }
                        IconButton(onClick = { imageUrls.removeAt(index) }) {
                            Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = Color.Red)
                        }
                    }
                }
            }
            
            Row(verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(
                    value = newImageUrl,
                    onValueChange = { newImageUrl = it },
                    label = { Text("Nueva URL de imagen") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                IconButton(onClick = {
                    if (newImageUrl.isNotBlank()) {
                        imageUrls.add(newImageUrl)
                        newImageUrl = ""
                    }
                }) { Icon(Icons.Default.Add, contentDescription = "Añadir") }
            }

            // Gestión de Categorías
            Text("Categorías*", fontWeight = FontWeight.Bold)
            val categories by viewModel.categories.collectAsState()
            val marketplaceCategories = categories.filter { it.visibility == "MARKETPLACE" || it.visibility == "BOTH" }
            
            androidx.compose.foundation.layout.FlowRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                marketplaceCategories.filter { it.id != "1" }.forEach { category ->
                    val isSelected = selectedCategoryIds.contains(category.id)
                    FilterChip(
                        selected = isSelected,
                        onClick = {
                            if (isSelected) {
                                selectedCategoryIds.remove(category.id)
                                // Limpieza de subcategorías huérfanas
                                val remainingCategories = categories.filter { it.id in selectedCategoryIds }
                                val allValidSubCats = remainingCategories.flatMap { it.subCategories }.toSet()
                                selectedSubCategoryIds.toList().forEach { sub ->
                                    if (sub !in allValidSubCats) selectedSubCategoryIds.remove(sub)
                                }
                            } else {
                                selectedCategoryIds.add(category.id)
                            }
                        },
                        label = { Text(category.name) }
                    )
                }
            }

            if (selectedCategoryIds.isNotEmpty()) {
                val availableSubCategories = categories.filter { it.id in selectedCategoryIds }.flatMap { it.subCategories }.distinct()
                if (availableSubCategories.isNotEmpty()) {
                    Text("Subcategorías", fontWeight = FontWeight.Bold)
                    androidx.compose.foundation.layout.FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        availableSubCategories.forEach { sub ->
                            val isSelected = selectedSubCategoryIds.contains(sub)
                            FilterChip(
                                selected = isSelected,
                                onClick = {
                                    if (isSelected) selectedSubCategoryIds.remove(sub)
                                    else selectedSubCategoryIds.add(sub)
                                },
                                label = { Text(sub) }
                            )
                        }
                    }
                }
            }

            Text("Precio y Descuento", fontWeight = FontWeight.Bold)
            if (!product.usePriceBySize) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(
                        value = originalPriceText,
                        onValueChange = { originalPriceText = it },
                        label = { Text(if (hasDiscount) "Precio Original" else "Precio") },
                        modifier = Modifier.weight(1f),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        prefix = { Text("S/ ") }
                    )
                    
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Oferta", style = MaterialTheme.typography.labelSmall)
                        Switch(checked = hasDiscount, onCheckedChange = { hasDiscount = it })
                    }
                }
                
                if (hasDiscount) {
                    OutlinedTextField(
                        value = salePriceText,
                        onValueChange = { salePriceText = it },
                        label = { Text("Precio de Oferta") },
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        prefix = { Text("S/ ") },
                        supportingText = {
                            val orig = originalPriceText.toDoubleOrNull() ?: 0.0
                            val sale = salePriceText.toDoubleOrNull() ?: 0.0
                            if (sale > 0 && orig > sale) {
                                val pct = ((1 - (sale / orig)) * 100).toInt()
                                Text("Ahorro del $pct%")
                            }
                        }
                    )
                }
            } else {
                Text("El precio se gestiona por talla", color = Color.Gray, fontSize = 12.sp)
            }

            if (!product.useStockBySize) {
                OutlinedTextField(
                    value = globalStockText,
                    onValueChange = { globalStockText = it },
                    label = { Text("Stock General") },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
            } else {
                Text("El stock se gestiona por talla", color = Color.Gray, fontSize = 12.sp)
            }

            HorizontalDivider()

            Text("Gestión de Tallas", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text("Elige tallas del catálogo global para asegurar la compatibilidad.", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
            
            val globalSystems by viewModel.globalSizeSystems.collectAsState()
            var selectedSystemId by remember { mutableStateOf(product.sizeSystemId ?: "predefined_clothing") }
            
            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp).horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                globalSystems.forEach { system ->
                    FilterChip(
                        selected = selectedSystemId == system.id,
                        onClick = { selectedSystemId = system.id },
                        label = { Text(system.name) }
                    )
                }
            }

            val currentSystemOptions = globalSystems.find { it.id == selectedSystemId }?.options ?: emptyList()
            androidx.compose.foundation.layout.FlowRow(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                currentSystemOptions.forEach { option ->
                    val isSelected = variants.any { it.sizeId == option.id }
                    FilterChip(
                        selected = isSelected,
                        onClick = {
                            if (isSelected) {
                                variants = variants.filter { it.sizeId != option.id }.toMutableList()
                            } else {
                                val basePrice = originalPriceText.toDoubleOrNull() ?: product.price
                                val baseStock = globalStockText.toIntOrNull() ?: 1
                                variants = (variants + ProductVariant(option.name, basePrice, baseStock, sizeId = option.id)).toMutableList()
                            }
                        },
                        label = { Text(option.name) }
                    )
                }
            }

            if (variants.isNotEmpty()) {
                Text("Precios y Stock por Talla:", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                variants.forEachIndexed { index, variant ->
                    MySizeEditRow(
                        variant = variant,
                        usePrice = product.usePriceBySize,
                        useStock = product.useStockBySize,
                        onVariantChange = { updated ->
                            val newList = variants.toMutableList()
                            newList[index] = updated
                            variants = newList
                        },
                        onDelete = {
                            val newList = variants.toMutableList()
                            newList.removeAt(index)
                            variants = newList
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun MySizeEditRow(
    variant: ProductVariant,
    usePrice: Boolean,
    useStock: Boolean,
    onVariantChange: (ProductVariant) -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = variant.name,
                    onValueChange = { /* Las tallas vienen del catálogo */ },
                    label = { Text("Talla") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    readOnly = true
                )
                
                IconButton(onClick = onDelete) {
                    Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = Color.Red)
                }
            }
            
            if (usePrice || useStock) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (usePrice) {
                        OutlinedTextField(
                            value = variant.price.toString(),
                            onValueChange = { newVal ->
                                newVal.toDoubleOrNull()?.let { onVariantChange(variant.copy(price = it)) }
                            },
                            label = { Text("Precio") },
                            modifier = Modifier.weight(1f),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            prefix = { Text("S/ ") }
                        )
                    }
                    if (useStock) {
                        OutlinedTextField(
                            value = variant.stock.toString(),
                            onValueChange = { newVal ->
                                newVal.toIntOrNull()?.let { onVariantChange(variant.copy(stock = it)) }
                            },
                            label = { Text("Stock") },
                            modifier = Modifier.weight(1f),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                        )
                    }
                }
            }
        }
    }
}
