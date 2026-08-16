package com.example.ezzeta.ui.screens.admin

import android.widget.Toast
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ezzeta.data.model.Product
import com.example.ezzeta.data.model.ProductVariant
import com.example.ezzeta.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminStoreProductEditScreen(
    viewModel: MainViewModel,
    productId: String?,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val allProducts by viewModel.allProducts.collectAsState()
    val product = remember(productId, allProducts) { allProducts.find { it.id == productId } }
    
    val categories by viewModel.storeCategories.collectAsState()
    
    // Form States
    var name by remember(product) { mutableStateOf(product?.name ?: "") }
    var description by remember(product) { mutableStateOf(product?.description ?: "") }
    var priceText by remember(product) { mutableStateOf(product?.price?.toString() ?: "0.0") }
    val imageList = remember(product) { 
        mutableStateListOf<String>().apply { 
            if (product != null) {
                if (product.imageUrls.isNotEmpty()) {
                    addAll(product.imageUrls)
                } else if (product.imageUrl.isNotEmpty()) {
                    add(product.imageUrl)
                }
            }
        } 
    }
    
    var storeId by remember(product) { mutableStateOf(product?.storeId ?: "s1") }
    var categoryId by remember(product) { mutableStateOf(product?.categoryId ?: (categories.firstOrNull()?.id ?: "2")) }
    var selectedSubCategory by remember(product) { mutableStateOf(product?.subCategories?.firstOrNull() ?: "") }
    
    var variants by remember(product) { 
        mutableStateOf(product?.variants?.toMutableList() ?: mutableListOf<ProductVariant>()) 
    }
    
    val stores = viewModel.getStores().filter { it.id.startsWith("s") }
    val currentCategory = categories.find { it.id == categoryId }
    val subcategories = currentCategory?.subCategories ?: emptyList()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (productId == null) "Crear Producto Tienda" else "Editar Producto") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                },
                actions = {
                    Button(
                        onClick = {
                            if (name.isBlank()) {
                                Toast.makeText(context, "El nombre es obligatorio", Toast.LENGTH_SHORT).show()
                                return@Button
                            }
                            val price = priceText.toDoubleOrNull() ?: 0.0
                            if (price < 0) {
                                Toast.makeText(context, "El precio no puede ser negativo", Toast.LENGTH_SHORT).show()
                                return@Button
                            }
                            
                            if (variants.map { it.name }.distinct().size != variants.size) {
                                Toast.makeText(context, "No se permiten tallas duplicadas", Toast.LENGTH_SHORT).show()
                                return@Button
                            }

                            if (imageList.isEmpty()) {
                                Toast.makeText(context, "Debes añadir al menos una imagen", Toast.LENGTH_SHORT).show()
                                return@Button
                            }

                            val finalVariants = variants.map { it.copy(price = price) }
                            val mainImage = imageList.first()

                            val updatedProduct = (product ?: Product(
                                id = "p${System.currentTimeMillis()}",
                                name = name,
                                price = price,
                                description = description,
                                imageUrl = mainImage,
                                imageUrls = imageList.toList(),
                                categoryId = categoryId,
                                subCategories = if (selectedSubCategory.isEmpty()) emptyList() else listOf(selectedSubCategory),
                                storeId = storeId,
                                isClientProduct = false,
                                stock = finalVariants.sumOf { it.stock },
                                createdAt = System.currentTimeMillis()
                            )).copy(
                                name = name,
                                description = description,
                                price = price,
                                imageUrl = mainImage,
                                imageUrls = imageList.toList(),
                                categoryId = categoryId,
                                subCategories = if (selectedSubCategory.isEmpty()) emptyList() else listOf(selectedSubCategory),
                                storeId = storeId,
                                variants = if (finalVariants.isEmpty()) null else finalVariants,
                                stock = finalVariants.sumOf { it.stock }
                            )
                            
                            if (productId == null) {
                                viewModel.addProduct(context, updatedProduct)
                            } else {
                                viewModel.updateProduct(context, updatedProduct)
                            }
                            onBack()
                        },
                        modifier = Modifier.padding(end = 8.dp)
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
                label = { Text("Nombre del Producto *") },
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

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                OutlinedTextField(
                    value = priceText,
                    onValueChange = { priceText = it },
                    label = { Text("Precio General *") },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    prefix = { Text("S/ ") }
                )

                var storeExpanded by remember { mutableStateOf(false) }
                ExposedDropdownMenuBox(
                    expanded = storeExpanded,
                    onExpandedChange = { storeExpanded = !storeExpanded },
                    modifier = Modifier.weight(1f)
                ) {
                    OutlinedTextField(
                        value = stores.find { it.id == storeId }?.name ?: "",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Tienda *") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = storeExpanded) },
                        modifier = Modifier.menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = storeExpanded,
                        onDismissRequest = { storeExpanded = false }
                    ) {
                        stores.forEach { store ->
                            DropdownMenuItem(
                                text = { Text(store.name) },
                                onClick = {
                                    storeId = store.id
                                    storeExpanded = false
                                }
                            )
                        }
                    }
                }
            }

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                var catExpanded by remember { mutableStateOf(false) }
                ExposedDropdownMenuBox(
                    expanded = catExpanded,
                    onExpandedChange = { catExpanded = !catExpanded },
                    modifier = Modifier.weight(1f)
                ) {
                    OutlinedTextField(
                        value = categories.find { it.id == categoryId }?.name ?: "",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Categoría") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = catExpanded) },
                        modifier = Modifier.menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = catExpanded,
                        onDismissRequest = { catExpanded = false }
                    ) {
                        categories.forEach { cat ->
                            DropdownMenuItem(
                                text = { Text(cat.name) },
                                onClick = {
                                    categoryId = cat.id
                                    selectedSubCategory = ""
                                    catExpanded = false
                                }
                            )
                        }
                    }
                }

                var subExpanded by remember { mutableStateOf(false) }
                ExposedDropdownMenuBox(
                    expanded = subExpanded,
                    onExpandedChange = { subExpanded = !subExpanded },
                    modifier = Modifier.weight(1f)
                ) {
                    OutlinedTextField(
                        value = selectedSubCategory,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Subcategoría") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = subExpanded) },
                        modifier = Modifier.menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = subExpanded,
                        onDismissRequest = { subExpanded = false }
                    ) {
                        subcategories.forEach { sub ->
                            DropdownMenuItem(
                                text = { Text(sub) },
                                onClick = {
                                    selectedSubCategory = sub
                                    subExpanded = false
                                }
                            )
                        }
                    }
                }
            }

            Text(text = "Galería de Imágenes", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            
            var newImageUrl by remember { mutableStateOf("") }
            
            Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = newImageUrl,
                    onValueChange = { newImageUrl = it },
                    label = { Text("Añadir URL de Imagen") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                IconButton(
                    onClick = {
                        if (newImageUrl.isNotBlank()) {
                            imageList.add(newImageUrl)
                            newImageUrl = ""
                        }
                    },
                    enabled = newImageUrl.isNotBlank()
                ) {
                    Icon(Icons.Default.AddCircle, contentDescription = "Añadir", tint = MaterialTheme.colorScheme.primary)
                }
            }

            // Lista de imágenes con controles
            imageList.forEachIndexed { index, url ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                ) {
                    Row(
                        modifier = Modifier.padding(8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        AsyncImage(
                            model = url,
                            contentDescription = null,
                            modifier = Modifier.size(60.dp).clip(RoundedCornerShape(4.dp)),
                            contentScale = ContentScale.Crop
                        )
                        
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = if (index == 0) "PRINCIPAL" else "Secundaria",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = if (index == 0) MaterialTheme.colorScheme.primary else Color.Gray
                            )
                            Text(text = url, maxLines = 1, style = MaterialTheme.typography.bodySmall)
                        }

                        // Controles de reordenamiento
                        IconButton(
                            onClick = {
                                val item = imageList.removeAt(index)
                                imageList.add(index - 1, item)
                            },
                            enabled = index > 0,
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(Icons.Default.ArrowUpward, contentDescription = "Subir", modifier = Modifier.size(18.dp))
                        }

                        IconButton(
                            onClick = {
                                val item = imageList.removeAt(index)
                                imageList.add(index + 1, item)
                            },
                            enabled = index < imageList.size - 1,
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(Icons.Default.ArrowDownward, contentDescription = "Bajar", modifier = Modifier.size(18.dp))
                        }

                        IconButton(
                            onClick = { imageList.removeAt(index) },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = Color.Red, modifier = Modifier.size(18.dp))
                        }
                    }
                }
            }

            if (imageList.isEmpty()) {
                Text(
                    text = "No hay imágenes añadidas aún. La primera imagen será la principal.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray,
                    fontStyle = FontStyle.Italic
                )
            }

            HorizontalDivider()
            
            Text(text = "Inventario por Talla", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            
            variants.forEachIndexed { index, variant ->
                SizeStockRow(
                    variant = variant,
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
            
            Button(
                onClick = {
                    variants = (variants + ProductVariant("S", priceText.toDoubleOrNull() ?: 0.0, 0)).toMutableList()
                },
                modifier = Modifier.align(Alignment.Start),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)
            ) {
                Icon(Icons.Default.Add, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Añadir Talla")
            }
        }
    }
}

@Composable
fun SizeStockRow(
    variant: ProductVariant,
    onVariantChange: (ProductVariant) -> Unit,
    onDelete: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        var sizeName by remember(variant) { mutableStateOf(variant.name) }
        var stockText by remember(variant) { mutableStateOf(variant.stock.toString()) }

        OutlinedTextField(
            value = sizeName,
            onValueChange = { 
                sizeName = it
                onVariantChange(variant.copy(name = it))
            },
            label = { Text("Talla") },
            modifier = Modifier.weight(1f),
            singleLine = true
        )

        OutlinedTextField(
            value = stockText,
            onValueChange = { 
                stockText = it
                it.toIntOrNull()?.let { stock ->
                    if (stock >= 0) {
                        onVariantChange(variant.copy(stock = stock))
                    }
                }
            },
            label = { Text("Stock") },
            modifier = Modifier.weight(1f),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
        )

        IconButton(onClick = onDelete) {
            Icon(Icons.Default.Delete, contentDescription = "Eliminar talla", tint = Color.Red)
        }
    }
}
