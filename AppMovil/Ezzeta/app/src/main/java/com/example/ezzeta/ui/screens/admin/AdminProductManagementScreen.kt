package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Search
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
import com.example.ezzeta.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminProductManagementScreen(
    viewModel: MainViewModel,
    managementType: String,
    onBack: () -> Unit,
    onAddProduct: () -> Unit,
    onEditProduct: (String) -> Unit
) {
    val context = LocalContext.current
    val products by viewModel.allProducts.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    
    val filteredProducts = products.filter { product ->
        val matchesType = if (managementType == "client") product.isClientProduct else !product.isClientProduct
        val matchesSearch = product.name.contains(searchQuery, ignoreCase = true) || product.id.contains(searchQuery, ignoreCase = true)
        matchesType && matchesSearch
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (managementType == "client") "Productos Clientes" else "Productos Tienda") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                }
            )
        },
        floatingActionButton = {
            if (managementType != "client") {
                FloatingActionButton(onClick = onAddProduct) {
                    Icon(Icons.Default.Add, contentDescription = "Añadir Producto")
                }
            }
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                placeholder = { Text("Buscar por nombre o ID...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                singleLine = true,
                shape = MaterialTheme.shapes.medium
            )

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(filteredProducts, key = { it.id }) { product ->
                    AdminProductItem(
                        product = product,
                        viewModel = viewModel,
                        onUpdate = { updatedProduct ->
                            viewModel.updateProduct(context, updatedProduct)
                        },
                        onDelete = {
                            viewModel.deleteProduct(context, product.id)
                        },
                        onEdit = { onEditProduct(product.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun AdminProductItem(
    product: Product,
    viewModel: MainViewModel,
    onUpdate: (Product) -> Unit,
    onDelete: () -> Unit,
    onEdit: () -> Unit
) {
    var priceText by remember(product) { mutableStateOf(product.price.toString()) }
    var stockText by remember(product) { mutableStateOf(product.stock.toString()) }
    var isVisible by remember(product) { mutableStateOf(product.isVisible) }
    
    // Variantes actuales del producto
    var currentVariants by remember(product) { mutableStateOf(product.variants ?: emptyList()) }

    var showDeleteDialog by remember { mutableStateOf(false) }
    val globalSystems by viewModel.globalSizeSystems.collectAsState()

    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Eliminar Producto") },
            text = { Text("¿Estás seguro de que deseas eliminar '${product.name}'? Esta acción no se puede deshacer.") },
            confirmButton = {
                Button(
                    onClick = {
                        onDelete()
                        showDeleteDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Eliminar")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancelar")
                }
            }
        )
    }

    Card(
        modifier = Modifier.fillMaxWidth().clickable { onEdit() },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                AsyncImage(
                    model = product.imageUrl,
                    contentDescription = null,
                    modifier = Modifier
                        .size(60.dp)
                        .clip(MaterialTheme.shapes.small),
                    contentScale = ContentScale.Crop
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = product.name, fontWeight = FontWeight.Bold, maxLines = 1)
                    Text(text = "ID: ${product.id}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.secondary)
                    
                    if (product.categoryIds.isEmpty() && product.categoryId.isBlank()) {
                        Text(
                            text = "⚠ Sin categorías asignadas",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.error,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
                
                IconButton(onClick = onEdit) {
                    Icon(Icons.Default.Edit, contentDescription = "Editar detalladamente", tint = MaterialTheme.colorScheme.primary)
                }

                IconButton(onClick = { showDeleteDialog = true }) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Eliminar",
                        tint = MaterialTheme.colorScheme.error
                    )
                }

                if (product.isClientProduct) {
                    Surface(
                        shape = MaterialTheme.shapes.small,
                        color = when(product.status) {
                            com.example.ezzeta.data.model.ProductStatus.APPROVED -> Color(0xFFE8F5E9)
                            com.example.ezzeta.data.model.ProductStatus.PENDING -> Color(0xFFFFF3E0)
                            com.example.ezzeta.data.model.ProductStatus.REJECTED -> Color(0xFFFFEBEE)
                            com.example.ezzeta.data.model.ProductStatus.DISABLED -> Color(0xFFF5F5F5)
                        }
                    ) {
                        Text(
                            text = product.status.name,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                            style = MaterialTheme.typography.labelSmall,
                            color = when(product.status) {
                                com.example.ezzeta.data.model.ProductStatus.APPROVED -> Color(0xFF2E7D32)
                                com.example.ezzeta.data.model.ProductStatus.PENDING -> Color(0xFFEF6C00)
                                com.example.ezzeta.data.model.ProductStatus.REJECTED -> Color(0xFFC62828)
                                com.example.ezzeta.data.model.ProductStatus.DISABLED -> Color(0xFF616161)
                            }
                        )
                    }
                } else {
                    Switch(
                        checked = isVisible,
                        onCheckedChange = { 
                            isVisible = it
                            onUpdate(product.copy(isVisible = it))
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = priceText,
                    onValueChange = { 
                        priceText = it
                        it.toDoubleOrNull()?.let { newPrice ->
                            onUpdate(product.copy(price = newPrice))
                        }
                    },
                    label = { Text("Precio") },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    prefix = { Text("S/ ") }
                )
                OutlinedTextField(
                    value = stockText,
                    onValueChange = { 
                        stockText = it
                        it.toIntOrNull()?.let { newStock ->
                            onUpdate(product.copy(stock = newStock))
                        }
                    },
                    label = { Text("Stock") },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(text = "Gestión de Tallas / Variantes", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            
            // Si el producto usa un sistema global, mostrar chips de ese sistema
            val currentSystem = globalSystems.find { it.id == product.sizeSystemId }
            if (currentSystem != null) {
                Text("Sistema: ${currentSystem.name}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                FlowRow(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    currentSystem.options.forEach { option ->
                        val isSelected = currentVariants.any { it.name == option.name }
                        FilterChip(
                            selected = isSelected,
                            onClick = {
                                val newVariants = if (isSelected) {
                                    currentVariants.filter { it.name != option.name }
                                } else {
                                    currentVariants + com.example.ezzeta.data.model.ProductVariant(option.name, product.price)
                                }
                                currentVariants = newVariants
                                onUpdate(product.copy(variants = newVariants))
                            },
                            label = { Text(option.name) }
                        )
                    }
                }
            } else if (!product.variants.isNullOrEmpty()) {
                Text("Variantes Personalizadas", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.secondary)
                currentVariants.forEachIndexed { index, variant ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("${variant.name}: S/ ${variant.price}", style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                        IconButton(onClick = {
                            val newVariants = currentVariants.toMutableList().apply { removeAt(index) }
                            currentVariants = newVariants
                            onUpdate(product.copy(variants = if (newVariants.isEmpty()) null else newVariants))
                        }) {
                            Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            } else {
                Text("Sin tallas definidas.", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun FlowRow(
    modifier: Modifier = Modifier,
    horizontalArrangement: Arrangement.Horizontal = Arrangement.Start,
    content: @Composable () -> Unit
) {
    androidx.compose.foundation.layout.FlowRow(
        modifier = modifier,
        horizontalArrangement = horizontalArrangement,
        content = { content() }
    )
}
