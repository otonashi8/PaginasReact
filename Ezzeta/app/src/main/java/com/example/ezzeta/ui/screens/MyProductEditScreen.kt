package com.example.ezzeta.ui.screens

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
import androidx.compose.ui.unit.sp
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
    val allProducts by viewModel.allProducts.collectAsState()
    val product = remember(productId, allProducts) { allProducts.find { it.id == productId } }
    val isModerating by viewModel.isModerating.collectAsState()
    
    if (product == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Producto no encontrado.")
        }
        return
    }

    var name by remember(product) { mutableStateOf(product.name) }
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

                            val finalVariants = variants.map { v ->
                                if (product.usePriceBySize) {
                                    v
                                } else {
                                    v
                                }
                            }

                            val updatedProduct = product.copy(
                                name = name,
                                variants = if (finalVariants.isEmpty()) null else finalVariants,
                                stock = if (product.useStockBySize) finalVariants.sumOf { it.stock } else globalStockText.toIntOrNull() ?: product.stock
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

            Button(
                onClick = {
                    val basePrice = originalPriceText.toDoubleOrNull() ?: 0.0
                    val baseStock = globalStockText.toIntOrNull() ?: 1
                    variants = (variants + ProductVariant("Nueva", basePrice, baseStock)).toMutableList()
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
                    onValueChange = { onVariantChange(variant.copy(name = it)) },
                    label = { Text("Talla") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
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
