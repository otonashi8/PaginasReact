package com.example.ezzeta.ui.screens.admin

import android.widget.Toast
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ezzeta.data.model.Product
import com.example.ezzeta.data.model.ProductStatus
import com.example.ezzeta.data.model.ProductVariant
import com.example.ezzeta.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun AdminCustomerProductEditScreen(
    viewModel: MainViewModel,
    productId: String?,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val allProducts by viewModel.allProducts.collectAsState()
    val product = remember(productId, allProducts) { allProducts.find { it.id == productId } }
    val categories by viewModel.categories.collectAsState()
    val isModerating by viewModel.isModerating.collectAsState()

    if (product == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Producto no encontrado")
        }
        return
    }

    var name by remember(product) { mutableStateOf(product.name) }
    var description by remember(product) { mutableStateOf(product.description) }
    var priceText by remember(product) { mutableStateOf(product.price.toString()) }
    var stockText by remember(product) { mutableStateOf(product.stock.toString()) }
    var status by remember(product) { mutableStateOf(product.status) }
    
    val selectedCategoryIds = remember(product) { mutableStateListOf<String>().apply { addAll(product.categoryIds) } }
    val selectedSubCategoryIds = remember(product) { mutableStateListOf<String>().apply { addAll(product.subCategoryIds) } }
    
    val imageUrls = remember(product) { mutableStateListOf<String>().apply { addAll(product.imageUrls.ifEmpty { listOf(product.imageUrl) }) } }
    val variants = remember(product) { mutableStateListOf<ProductVariant>().apply { addAll(product.variants ?: emptyList()) } }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Administrar Producto Cliente") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                },
                actions = {
                    Button(
                        onClick = {
                            val updatedProduct = product.copy(
                                name = name,
                                description = description,
                                price = priceText.toDoubleOrNull() ?: product.price,
                                stock = if (product.useStockBySize) variants.sumOf { it.stock } else stockText.toIntOrNull() ?: product.stock,
                                status = status,
                                categoryIds = selectedCategoryIds.toList(),
                                subCategoryIds = selectedSubCategoryIds.toList(),
                                imageUrl = imageUrls.firstOrNull() ?: "",
                                imageUrls = imageUrls.toList(),
                                variants = if (variants.isEmpty()) null else variants.toList(),
                                updatedAt = System.currentTimeMillis()
                            )
                            viewModel.updateProduct(context, updatedProduct) { success ->
                                if (success) {
                                    Toast.makeText(context, "Producto actualizado", Toast.LENGTH_SHORT).show()
                                    onBack()
                                }
                            }
                        },
                        enabled = !isModerating
                    ) {
                        Text("Guardar Cambios")
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
            // Estado de Publicación y Gestión
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.1f))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Verified, contentDescription = null, tint = Color(0xFF2E7D32), modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Producto Autorizado", fontWeight = FontWeight.Bold, color = Color(0xFF2E7D32))
                    }
                    Text(
                        "Este producto ya pasó por la validación inicial de 'Solicitudes Marketplace'. Puedes desactivarlo o cambiar su estado si es necesario.",
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                    
                    Text("Estado Actual", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(ProductStatus.APPROVED, ProductStatus.DISABLED, ProductStatus.REJECTED).forEach { s ->
                            FilterChip(
                                selected = status == s,
                                onClick = { status = s },
                                label = { 
                                    Text(
                                        text = when(s) {
                                            ProductStatus.APPROVED -> "Publicado"
                                            ProductStatus.DISABLED -> "Oculto"
                                            ProductStatus.REJECTED -> "Retirado"
                                            else -> s.name
                                        },
                                        fontSize = 11.sp 
                                    ) 
                                }
                            )
                        }
                    }
                }
            }

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Nombre") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Descripción") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3
            )

            // Categorías
            Text("Categorías Marketplace", fontWeight = FontWeight.Bold)
            val marketplaceCats = categories.filter { it.visibility == "MARKETPLACE" || it.visibility == "BOTH" }
            FlowRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                marketplaceCats.filter { it.id != "1" }.forEach { cat ->
                    val isSelected = selectedCategoryIds.contains(cat.id)
                    FilterChip(
                        selected = isSelected,
                        onClick = {
                            if (isSelected) {
                                selectedCategoryIds.remove(cat.id)
                                val validSubCats = categories.filter { it.id in selectedCategoryIds }.flatMap { it.subCategories }.toSet()
                                selectedSubCategoryIds.toList().forEach { sub ->
                                    if (sub !in validSubCats) selectedSubCategoryIds.remove(sub)
                                }
                            } else {
                                selectedCategoryIds.add(cat.id)
                            }
                        },
                        label = { Text(cat.name) }
                    )
                }
            }

            if (selectedCategoryIds.isNotEmpty()) {
                val availableSub = categories.filter { it.id in selectedCategoryIds }.flatMap { it.subCategories }.distinct()
                if (availableSub.isNotEmpty()) {
                    Text("Subcategorías", fontWeight = FontWeight.Bold)
                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        availableSub.forEach { sub ->
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

            // Imágenes
            Text("Galería de Imágenes", fontWeight = FontWeight.Bold)
            imageUrls.forEachIndexed { index, url ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(modifier = Modifier.size(50.dp).clip(RoundedCornerShape(8.dp))) {
                        AsyncImage(model = url, contentDescription = null, contentScale = ContentScale.Crop)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(if (index == 0) "Principal" else "Imagen ${index+1}", modifier = Modifier.weight(1f), fontSize = 12.sp)
                    IconButton(onClick = { imageUrls.removeAt(index) }) {
                        Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red)
                    }
                }
            }

            // Tallas Globales
            Text("Gestión de Tallas (Catálogo Global)", fontWeight = FontWeight.Bold)
            val globalSystems by viewModel.globalSizeSystems.collectAsState()
            var selectedSysId by remember { mutableStateOf(product.sizeSystemId ?: "predefined_clothing") }
            
            Row(modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                globalSystems.forEach { sys ->
                    FilterChip(selected = selectedSysId == sys.id, onClick = { selectedSysId = sys.id }, label = { Text(sys.name) })
                }
            }
            
            val options = globalSystems.find { it.id == selectedSysId }?.options ?: emptyList()
            FlowRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                options.forEach { opt ->
                    val isSelected = variants.any { it.sizeId == opt.id || (it.sizeId == null && it.name.equals(opt.name, ignoreCase = true)) }
                    FilterChip(
                        selected = isSelected,
                        onClick = {
                            if (isSelected) {
                                variants.removeAll { it.sizeId == opt.id || (it.sizeId == null && it.name.equals(opt.name, ignoreCase = true)) }
                            } else {
                                variants.add(ProductVariant(opt.name, priceText.toDoubleOrNull() ?: 0.0, 1, sizeId = opt.id))
                            }
                        },
                        label = { Text(opt.name) }
                    )
                }
            }

            if (variants.isNotEmpty()) {
                Text("Resumen de Tallas Seleccionadas:", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                variants.toList().forEachIndexed { index, v ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    ) {
                        Row(
                            modifier = Modifier.padding(8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(text = v.name, modifier = Modifier.weight(1f), fontWeight = FontWeight.Bold)
                            
                            OutlinedTextField(
                                value = v.stock.toString(),
                                onValueChange = { newVal ->
                                    newVal.toIntOrNull()?.let { s ->
                                        variants[index] = v.copy(stock = s)
                                    }
                                },
                                label = { Text("Stock") },
                                modifier = Modifier.weight(1f),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                            )

                            IconButton(onClick = { 
                                variants.removeAt(index)
                            }) {
                                Icon(Icons.Default.RemoveCircleOutline, contentDescription = null, tint = Color.Red)
                            }
                        }
                    }
                }
            }
        }
    }
}
