package com.example.ezzeta.ui.screens.admin

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
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
    var imageUrl by remember(product) { mutableStateOf(product?.imageUrl ?: "") }
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

                            val finalVariants = variants.map { it.copy(price = price) }

                            val updatedProduct = (product ?: Product(
                                id = "p${System.currentTimeMillis()}",
                                name = name,
                                price = price,
                                description = description,
                                imageUrl = imageUrl,
                                imageUrls = listOf(imageUrl),
                                categoryId = categoryId,
                                subCategories = if (selectedSubCategory.isEmpty()) emptyList() else listOf(selectedSubCategory),
                                storeId = storeId,
                                isClientProduct = false,
                                stock = finalVariants.sumOf { it.stock }
                            )).copy(
                                name = name,
                                description = description,
                                price = price,
                                imageUrl = imageUrl,
                                imageUrls = listOf(imageUrl),
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

            OutlinedTextField(
                value = imageUrl,
                onValueChange = { imageUrl = it },
                label = { Text("URL de Imagen") },
                modifier = Modifier.fillMaxWidth()
            )

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
