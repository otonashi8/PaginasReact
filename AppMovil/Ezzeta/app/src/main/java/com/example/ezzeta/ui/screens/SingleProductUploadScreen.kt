package com.example.ezzeta.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.HelpOutline
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ezzeta.data.model.Product
import com.example.ezzeta.data.model.RequestStatus
import com.example.ezzeta.ui.viewmodel.MainViewModel
import kotlinx.coroutines.launch
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun SingleProductUploadScreen(viewModel: MainViewModel, onBack: () -> Unit) {
    val user by viewModel.currentUser.collectAsState()
    
    // Redirección de seguridad: si no hay usuario o es invitado, volver atrás
    LaunchedEffect(user) {
        if (user == null || user?.isGuest == true) {
            onBack()
        }
    }

    var name by remember { mutableStateOf("") }
    var price by remember { mutableStateOf("") }
    var stock by remember { mutableStateOf("1") }
    var description by remember { mutableStateOf("") }
    var contactName by remember { mutableStateOf("") }
    var contactPhone by remember { mutableStateOf("") }
    
    // Soporte para múltiples categorías y subcategorías
    val selectedCategoryIds = remember { mutableStateListOf<String>() }
    val selectedSubCategoryIds = remember { mutableStateListOf<String>() }
    
    var condition by remember { mutableStateOf("Nuevo") }
    val imageUrls = remember { mutableStateListOf<String>() }
    var newImageUrl by remember { mutableStateOf("") }

    // Flags de configuración flexible
    var usePriceBySize by remember { mutableStateOf(false) }
    var useStockBySize by remember { mutableStateOf(false) }

    // Variantes
    val variants = remember { mutableStateListOf<com.example.ezzeta.data.model.ProductVariant>() }
    var newVariantName by remember { mutableStateOf("") }
    var newVariantPrice by remember { mutableStateOf("") }
    
    // Sistema de tallas
    val globalSystems by viewModel.globalSizeSystems.collectAsState()
    val userSizes by viewModel.userCustomSizes.collectAsState()
    
    var selectedSystemId by remember { mutableStateOf<String?>("predefined_clothing") }
    val selectedSizeOptions = remember { mutableStateListOf<com.example.ezzeta.data.model.SizeOption>() }
    
    val context = LocalContext.current
    var expanded by remember { mutableStateOf(false) }
    var policiesAccepted by remember { mutableStateOf(false) }
    var showSuccessDialog by remember { mutableStateOf(false) }

    val tooltipState = rememberTooltipState()
    val scope = rememberCoroutineScope()
    val isModerating by viewModel.isModerating.collectAsState()

    val isFormValid = name.isNotBlank() && 
                      description.isNotBlank() &&
                      contactName.isNotBlank() &&
                      contactPhone.isNotBlank() &&
                      policiesAccepted &&
                      selectedCategoryIds.isNotEmpty() &&
                      (if (usePriceBySize) variants.all { it.price >= 0 } && variants.isNotEmpty() else price.toDoubleOrNull() != null && (price.toDoubleOrNull() ?: -1.0) >= 0) &&
                      (if (useStockBySize) variants.all { it.stock >= 0 } && variants.isNotEmpty() else stock.toIntOrNull() != null && (stock.toIntOrNull() ?: -1) >= 0) &&
                      (if (usePriceBySize || useStockBySize) variants.isNotEmpty() else true) &&
                      !isModerating

    if (showSuccessDialog) {
        AlertDialog(
            onDismissRequest = { 
                showSuccessDialog = false
                onBack()
            },
            title = { Text("Solicitud Enviada", fontWeight = FontWeight.Bold) },
            text = { Text("Tu producto ha sido enviado correctamente. Será revisado por un administrador antes de ser publicado en el Marketplace.") },
            confirmButton = {
                Button(onClick = { 
                    showSuccessDialog = false
                    onBack()
                }) {
                    Text("Entendido")
                }
            }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Publicar mi producto", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            Text(
                text = "Detalles del Producto",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            // imagenes
            Text(text = "Imágenes del Producto", fontWeight = FontWeight.Bold)
            Text(text = "La primera imagen será la principal.", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
            Column(modifier = Modifier.padding(vertical = 8.dp)) {
                imageUrls.forEachIndexed { index, url ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            modifier = Modifier.size(40.dp).clip(RoundedCornerShape(4.dp)),
                            color = MaterialTheme.colorScheme.surfaceVariant
                        ) {
                            AsyncImage(model = url, contentDescription = null, contentScale = ContentScale.Crop)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (index == 0) "Principal" else "Foto ${index + 1}", 
                            modifier = Modifier.weight(1f), 
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = if (index == 0) FontWeight.Bold else FontWeight.Normal
                        )
                        
                        Row {
                            if (index > 0) {
                                IconButton(onClick = { 
                                    val item = imageUrls.removeAt(index)
                                    imageUrls.add(index - 1, item)
                                }, modifier = Modifier.size(24.dp)) {
                                    Icon(Icons.Default.ArrowUpward, contentDescription = null, modifier = Modifier.size(16.dp))
                                }
                            }
                            IconButton(onClick = { imageUrls.removeAt(index) }, modifier = Modifier.size(24.dp)) {
                                Icon(Icons.Default.Remove, contentDescription = null, tint = Color.Red, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(
                        value = newImageUrl,
                        onValueChange = { newImageUrl = it },
                        label = { Text("Pegar URL de imagen") },
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 12.sp)
                    )
                    IconButton(
                        onClick = {
                            if (newImageUrl.isNotBlank()) {
                                imageUrls.add(newImageUrl)
                                newImageUrl = ""
                            }
                        }
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Nombre del producto*") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            
            Spacer(modifier = Modifier.height(8.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = price,
                    onValueChange = { price = it },
                    label = { Text("Precio (S/)*") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = stock,
                    onValueChange = { stock = it },
                    label = { Text("Stock*") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
            
            Text(text = "Tus Datos de Contacto*", fontWeight = FontWeight.Bold)
            OutlinedTextField(
                value = contactName,
                onValueChange = { contactName = it },
                label = { Text("Tu nombre") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = contactPhone,
                onValueChange = { contactPhone = it },
                label = { Text("WhatsApp / Celular") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Configuración de Tallas y Precios/Stocks
            Text(text = "Configuración de Tallas", fontWeight = FontWeight.Bold)
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "Precio por talla", style = MaterialTheme.typography.bodyMedium)
                Switch(
                    checked = usePriceBySize,
                    onCheckedChange = { checked ->
                        usePriceBySize = checked
                        if (checked) {
                            // Inicializar precios de variantes existentes con el precio general
                            val currentBasePrice = price.toDoubleOrNull() ?: 0.0
                            val updatedVariants = variants.map { it.copy(price = currentBasePrice) }
                            variants.clear()
                            variants.addAll(updatedVariants)
                        }
                    }
                )
            }
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "Stock por talla", style = MaterialTheme.typography.bodyMedium)
                Switch(
                    checked = useStockBySize,
                    onCheckedChange = { checked ->
                        useStockBySize = checked
                        if (checked) {
                            // Inicializar stock de variantes existentes con el stock general
                            val currentBaseStock = stock.toIntOrNull() ?: 1
                            val updatedVariants = variants.map { it.copy(stock = currentBaseStock) }
                            variants.clear()
                            variants.addAll(updatedVariants)
                        }
                    }
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(text = "Variantes / Tallas*", fontWeight = FontWeight.Bold)
            Text(text = "Elige un catálogo o crea tus propias opciones en 'Mis tallas'.", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
            
            // Selector de Tipo de Sistema
            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp).horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                globalSystems.forEach { system ->
                    FilterChip(
                        selected = selectedSystemId == system.id,
                        onClick = { 
                            selectedSystemId = system.id
                            selectedSizeOptions.clear()
                        },
                        label = { Text(system.name) }
                    )
                }
                
                // Opción Mis Tallas
                FilterChip(
                    selected = selectedSystemId == "user_custom",
                    onClick = { 
                        selectedSystemId = "user_custom"
                        selectedSizeOptions.clear()
                    },
                    label = { Text("Mis tallas") },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(16.dp)) }
                )
            }

            // Mostrar opciones según sistema seleccionado
            val currentOptions = if (selectedSystemId == "user_custom") {
                userSizes
            } else {
                globalSystems.find { it.id == selectedSystemId }?.options ?: emptyList()
            }

            if (currentOptions.isNotEmpty()) {
                FlowRow(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    currentOptions.forEach { option ->
                        val isSelected = selectedSizeOptions.any { it.id == option.id }
                        FilterChip(
                            selected = isSelected,
                            onClick = {
                                if (isSelected) selectedSizeOptions.removeAll { it.id == option.id }
                                else selectedSizeOptions.add(option)
                            },
                            label = { Text(option.name) }
                        )
                    }
                }
            } else if (selectedSystemId == "user_custom") {
                Text("Aún no tienes tallas personalizadas.", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
            }

            // Sección para Crear Talla Personalizada (Solo si está en modo Mis Tallas o quiere agregar una nueva)
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = "¿Necesitas una talla especial?", style = MaterialTheme.typography.labelMedium)
            
            val addSpecialSize = {
                if (newVariantName.isNotBlank()) {
                    viewModel.addUserCustomSize(context, newVariantName)
                    
                    val customPrice = if (usePriceBySize) (newVariantPrice.toDoubleOrNull() ?: price.toDoubleOrNull() ?: 0.0) else (price.toDoubleOrNull() ?: 0.0)
                    val customStock = if (useStockBySize) (stock.toIntOrNull() ?: 1) else (stock.toIntOrNull() ?: 1)
                    
                    // Nota: Como addUserCustomSize es asíncrono en repo (Flow), 
                    // creamos un SizeOption temporal para la UI inmediata o esperamos al refresh.
                    // Para simplificar, buscaremos el nuevo item en userSizes tras el delay o usaremos el ID generado.
                    val tempOption = com.example.ezzeta.data.model.SizeOption(
                        id = java.util.UUID.randomUUID().toString(), // No será el real pero sirve para el mapeo inicial
                        name = newVariantName,
                        isGlobal = false
                    )

                    if (variants.none { it.name.equals(newVariantName, ignoreCase = true) }) {
                        variants.add(com.example.ezzeta.data.model.ProductVariant(newVariantName, customPrice, customStock, sizeId = tempOption.id))
                    }
                    
                    if (selectedSizeOptions.none { it.name.equals(newVariantName, ignoreCase = true) }) {
                        selectedSizeOptions.add(tempOption)
                    }
                    
                    selectedSystemId = "user_custom"
                    newVariantName = ""
                    newVariantPrice = ""
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = newVariantName,
                    onValueChange = { newVariantName = it },
                    label = { Text("Nombre (ej. 1un rosa)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = newVariantPrice,
                    onValueChange = { newVariantPrice = it },
                    label = { Text("Precio (opcional)") },
                    modifier = Modifier.weight(0.6f),
                    singleLine = true,
                    placeholder = { Text(price) }
                )
                IconButton(onClick = addSpecialSize) {
                    Icon(Icons.Default.Add, contentDescription = null)
                }
            }

            // Mostrar variantes con precio/stock si se han agregado manualmente o vienen de un sistema
            if (selectedSizeOptions.isNotEmpty() || variants.isNotEmpty()) {
                val basePrice = price.toDoubleOrNull() ?: 0.0
                val baseStock = stock.toIntOrNull() ?: 1
                
                // Sincronizar variants con selectedSizeOptions
                val currentSizeIds = variants.mapNotNull { it.sizeId }.toSet()
                selectedSizeOptions.forEach { option ->
                    if (!currentSizeIds.contains(option.id)) {
                        variants.add(com.example.ezzeta.data.model.ProductVariant(option.name, basePrice, baseStock, sizeId = option.id))
                    }
                }
                
                // Limpiar variantes que ya no están seleccionadas en los chips
                val selectedIds = selectedSizeOptions.map { it.id }.toSet()
                variants.removeAll { it.sizeId != null && !selectedIds.contains(it.sizeId) }

                Text(text = "Resumen de Tallas:", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                
                variants.toList().forEachIndexed { index, v ->
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    ) {
                        Row(
                            modifier = Modifier.padding(8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(text = v.name, modifier = Modifier.weight(0.8f), fontWeight = FontWeight.Bold)
                            
                            if (usePriceBySize) {
                                OutlinedTextField(
                                    value = v.price.toString(),
                                    onValueChange = { newVal ->
                                        newVal.toDoubleOrNull()?.let { p ->
                                            variants[index] = v.copy(price = p)
                                        }
                                    },
                                    label = { Text("Precio") },
                                    modifier = Modifier.weight(1f),
                                    singleLine = true,
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                                )
                            }
                            
                            if (useStockBySize) {
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
                            }

                            IconButton(onClick = { 
                                variants.removeAt(index)
                                selectedSizeOptions.removeAll { it.id == v.sizeId }
                            }, modifier = Modifier.size(24.dp)) {
                                Icon(Icons.Default.Remove, contentDescription = null, tint = Color.Red, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(text = "Categoría(s)*", fontWeight = FontWeight.Bold)
            val categories by viewModel.marketplaceCategories.collectAsState()
            
            FlowRow(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                categories.filter { it.id != "1" }.forEach { category ->
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

            // Sección Subcategorías Dinámicas
            val currentCategories = categories.filter { it.id in selectedCategoryIds }
            val availableSubCategories = currentCategories.flatMap { it.subCategories }.distinct()
            
            if (availableSubCategories.isNotEmpty()) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(text = "Subcategorías*", fontWeight = FontWeight.Bold)
                Text(text = "Solo se muestran subcategorías de las categorías elegidas.", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                
                FlowRow(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
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

            Spacer(modifier = Modifier.height(16.dp))

            Text(text = "Estado del producto*", fontWeight = FontWeight.Bold)
            Row(
                modifier = Modifier.padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                ConditionRadioButton(text = "Nuevo", selected = condition == "Nuevo", onClick = { condition = "Nuevo" })
                ConditionRadioButton(text = "Usado", selected = condition == "Usado", onClick = { condition = "Usado" })
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    ConditionRadioButton(text = "Caja Abierta", selected = condition == "Caja Abierta", onClick = { condition = "Caja Abierta" })
                    TooltipBox(
                        positionProvider = TooltipDefaults.rememberTooltipPositionProvider(),
                        tooltip = {
                            PlainTooltip {
                                Text(
                                    text = "Son productos nuevos y en perfecto estado. Deben incluir accesorios originales. Su empaque puede tener marcas y no cuenta con sello de fábrica.",
                                    modifier = Modifier.padding(8.dp).widthIn(max = 250.dp)
                                )
                            }
                        },
                        state = tooltipState
                    ) {
                        IconButton(
                            onClick = { scope.launch { tooltipState.show() } },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.HelpOutline,
                                contentDescription = "Ayuda",
                                modifier = Modifier.size(16.dp),
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Descripción*") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Políticas de Venta
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Políticas de Venta",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Al publicar un producto en Ezzeta, aceptas que la aplicación retendrá una comisión del 10% sobre el precio de venta final por cada transacción exitosa.",
                        style = MaterialTheme.typography.bodySmall,
                        textAlign = TextAlign.Justify
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.clickable { policiesAccepted = !policiesAccepted }
                    ) {
                        Checkbox(
                            checked = policiesAccepted,
                            onCheckedChange = { policiesAccepted = it }
                        )
                        Text(
                            text = "He leído y acepto la comisión del 10%",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = {
                        // Procesar cualquier talla especial pendiente de añadir antes de enviar
                        if (newVariantName.isNotBlank()) {
                            addSpecialSize()
                        }

                        val basePrice = price.toDoubleOrNull() ?: 0.0
                        val baseStock = stock.toIntOrNull() ?: 1
                        
                        // Finalización de variantes: asegurar que todas las seleccionadas estén en la lista
                        val chipsVariants = selectedSizeOptions.filter { option -> 
                            variants.none { it.sizeId == option.id } 
                        }.map { com.example.ezzeta.data.model.ProductVariant(it.name, basePrice, baseStock, sizeId = it.id) }
                        
                        val finalVariants = (variants + chipsVariants).distinctBy { it.sizeId ?: it.name }
                        
                        val productToRequest = Product(
                            id = "cp_${System.currentTimeMillis()}",
                            name = name,
                            price = basePrice,
                            description = "$description (Estado: $condition)",
                            imageUrl = imageUrls.firstOrNull() ?: "",
                            imageUrls = imageUrls.toList(),
                            categoryIds = selectedCategoryIds.toList(),
                            subCategoryIds = selectedSubCategoryIds.toList(),
                            campaign = "Del cliente para el cliente",
                            storeId = "client_store",
                            sellerName = contactName,
                            sellerId = user?.uuid ?: "unknown",
                            isClientProduct = true,
                            stock = baseStock,
                            isVisible = false, // Obsoleto en favor de status
                            status = com.example.ezzeta.data.model.ProductStatus.PENDING,
                            variants = if (finalVariants.isEmpty()) null else finalVariants,
                            sizeSystemId = if (selectedSystemId != "user_custom") selectedSystemId else null,
                            usePriceBySize = usePriceBySize,
                            useStockBySize = useStockBySize,
                            createdAt = System.currentTimeMillis()
                        )

                        viewModel.sendMarketplaceRequest(context, productToRequest) { success ->
                            if (success) {
                                showSuccessDialog = true
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = isFormValid,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    if (isModerating) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimary, strokeWidth = 2.dp)
                        Spacer(modifier = Modifier.width(12.dp))
                        Text("Validando...")
                    } else {
                        Text("Mandar solicitud", textAlign = TextAlign.Center)
                    }
                }
            }
            
            Text(
                text = "* Campos obligatorios",
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray,
                modifier = Modifier.padding(top = 8.dp)
            )
        }
    }
}

@Composable
fun ConditionRadioButton(text: String, selected: Boolean, onClick: () -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .selectable(
                selected = selected,
                onClick = onClick,
                role = Role.RadioButton
            )
            .padding(vertical = 4.dp)
    ) {
        RadioButton(selected = selected, onClick = null)
        Text(text = text, modifier = Modifier.padding(start = 8.dp))
    }
}
