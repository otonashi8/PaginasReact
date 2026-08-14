package com.example.ezzeta.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.HelpOutline
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
    var selectedCategoryId by remember { mutableStateOf("1") }
    val selectedSubCategories = remember { mutableStateListOf<String>() }
    var condition by remember { mutableStateOf("Nuevo") }
    val imageUrls = remember { mutableStateListOf<String>() }
    var newImageUrl by remember { mutableStateOf("") }

    // Variantes
    val variants = remember { mutableStateListOf<com.example.ezzeta.data.model.ProductVariant>() }
    var newVariantName by remember { mutableStateOf("") }
    var newVariantPrice by remember { mutableStateOf("") }
    
    // Sistema de tallas
    val globalSystems by viewModel.globalSizeSystems.collectAsState()
    val userSizes by viewModel.userCustomSizes.collectAsState()
    
    var selectedSystemId by remember { mutableStateOf<String?>("predefined_clothing") }
    val selectedPredefinedSizes = remember { mutableStateListOf<String>() }
    
    val context = LocalContext.current
    var expanded by remember { mutableStateOf(false) }
    var policiesAccepted by remember { mutableStateOf(false) }

    val tooltipState = rememberTooltipState()
    val scope = rememberCoroutineScope()

    val isFormValid = name.isNotBlank() && 
                      price.toDoubleOrNull() != null && 
                      stock.toIntOrNull() != null &&
                      description.isNotBlank() &&
                      contactName.isNotBlank() &&
                      contactPhone.isNotBlank() &&
                      policiesAccepted

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
            Column(modifier = Modifier.padding(vertical = 8.dp)) {
                imageUrls.forEachIndexed { index, url ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Foto ${index + 1}: ", style = MaterialTheme.typography.bodySmall)
                        Text(
                            text = url, 
                            modifier = Modifier.weight(1f), 
                            style = MaterialTheme.typography.bodySmall,
                            maxLines = 1
                        )
                        IconButton(onClick = { imageUrls.removeAt(index) }, modifier = Modifier.size(24.dp)) {
                            Icon(Icons.Default.Remove, contentDescription = null, tint = Color.Red)
                        }
                    }
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(
                        value = newImageUrl,
                        onValueChange = { newImageUrl = it },
                        label = { Text("URL de imagen") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
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
                            selectedPredefinedSizes.clear()
                        },
                        label = { Text(system.name) }
                    )
                }
                
                // Opción Mis Tallas
                FilterChip(
                    selected = selectedSystemId == "user_custom",
                    onClick = { 
                        selectedSystemId = "user_custom"
                        selectedPredefinedSizes.clear()
                    },
                    label = { Text("Mis tallas") },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(16.dp)) }
                )
            }

            // Mostrar opciones según sistema seleccionado
            val currentOptions = if (selectedSystemId == "user_custom") {
                userSizes.map { it.name }
            } else {
                globalSystems.find { it.id == selectedSystemId }?.options?.map { it.name } ?: emptyList()
            }

            if (currentOptions.isNotEmpty()) {
                FlowRow(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    currentOptions.forEach { sizeName ->
                        val isSelected = selectedPredefinedSizes.contains(sizeName)
                        FilterChip(
                            selected = isSelected,
                            onClick = {
                                if (isSelected) selectedPredefinedSizes.remove(sizeName)
                                else selectedPredefinedSizes.add(sizeName)
                            },
                            label = { Text(sizeName) }
                        )
                    }
                }
            } else if (selectedSystemId == "user_custom") {
                Text("Aún no tienes tallas personalizadas.", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
            }

            // Sección para Crear Talla Personalizada (Solo si está en modo Mis Tallas o quiere agregar una nueva)
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = "¿Necesitas una talla especial?", style = MaterialTheme.typography.labelMedium)
            
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
                IconButton(
                    onClick = {
                        if (newVariantName.isNotBlank()) {
                            viewModel.addUserCustomSize(context, newVariantName)
                            // Si puso precio, la agregamos directamente a la lista de variantes final
                            val customPrice = newVariantPrice.toDoubleOrNull() ?: price.toDoubleOrNull() ?: 0.0
                            variants.add(com.example.ezzeta.data.model.ProductVariant(newVariantName, customPrice))
                            
                            // También la marcamos como seleccionada si estamos en modo user_custom
                            if (selectedSystemId == "user_custom") {
                                selectedPredefinedSizes.add(newVariantName)
                            }
                            
                            newVariantName = ""
                            newVariantPrice = ""
                        }
                    }
                ) {
                    Icon(Icons.Default.Add, contentDescription = null)
                }
            }

            // Mostrar variantes con precio si se han agregado manualmente o vienen de un sistema
            if (variants.isNotEmpty()) {
                Text(text = "Resumen de variantes con precio:", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                variants.forEachIndexed { index, v ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("${v.name}: S/ ${v.price}", modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodySmall)
                        IconButton(onClick = { variants.removeAt(index) }, modifier = Modifier.size(24.dp)) {
                            Icon(Icons.Default.Remove, contentDescription = null, tint = Color.Red, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(text = "Categoría*", fontWeight = FontWeight.Bold)
            val categories by viewModel.marketplaceCategories.collectAsState()
            ExposedDropdownMenuBox(
                expanded = expanded,
                onExpandedChange = { expanded = !expanded },
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = categories.firstOrNull { it.id == selectedCategoryId }?.name ?: "",
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                    modifier = Modifier.menuAnchor().fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                )
                ExposedDropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false }
                ) {
                    categories.forEach { category ->
                        DropdownMenuItem(
                            text = { Text(category.name) },
                            onClick = {
                                if (selectedCategoryId != category.id) {
                                    selectedCategoryId = category.id
                                    selectedSubCategories.clear()
                                }
                                expanded = false
                            }
                        )
                    }
                }
            }

            // Sección Subcategorías
            val currentCategory = categories.find { it.id == selectedCategoryId }
            if (currentCategory != null && currentCategory.subCategories.isNotEmpty()) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(text = "Subcategorías*", fontWeight = FontWeight.Bold)
                Text(text = "Puedes seleccionar más de una.", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                
                FlowRow(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    currentCategory.subCategories.forEach { sub ->
                        val isSelected = selectedSubCategories.contains(sub)
                        FilterChip(
                            selected = isSelected,
                            onClick = {
                                if (isSelected) selectedSubCategories.remove(sub)
                                else selectedSubCategories.add(sub)
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
                        val basePrice = price.toDoubleOrNull() ?: 0.0
                        // Combinar variantes manuales con las seleccionadas de chips (que toman precio base)
                        val chipsVariants = selectedPredefinedSizes.map { com.example.ezzeta.data.model.ProductVariant(it, basePrice) }
                        val finalVariants = (variants + chipsVariants).distinctBy { it.name }
                        
                        viewModel.uploadSingleProduct(
                            context = context,
                            name = name,
                            price = basePrice,
                            categoryId = selectedCategoryId,
                            subCategories = selectedSubCategories.toList(),
                            condition = condition,
                            description = description,
                            imageUrls = imageUrls.toList(),
                            stock = stock.toIntOrNull() ?: 1,
                            contactName = contactName,
                            contactPhone = contactPhone,
                            variants = if (finalVariants.isEmpty()) null else finalVariants,
                            sizeSystemId = if (selectedSystemId != "user_custom") selectedSystemId else null
                        )
                        onBack()
                    },
                    modifier = Modifier.weight(1f),
                    enabled = isFormValid,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Por Correo", textAlign = TextAlign.Center)
                }

                Button(
                    onClick = {
                        val basePrice = price.toDoubleOrNull() ?: 0.0
                        val chipsVariants = selectedPredefinedSizes.map { com.example.ezzeta.data.model.ProductVariant(it, basePrice) }
                        val finalVariants = (variants + chipsVariants).distinctBy { it.name }
                        
                        viewModel.uploadSingleProductViaWhatsApp(
                            context = context,
                            name = name,
                            price = basePrice,
                            categoryId = selectedCategoryId,
                            subCategories = selectedSubCategories.toList(),
                            condition = condition,
                            description = description,
                            imageUrls = imageUrls.toList(),
                            stock = stock.toIntOrNull() ?: 1,
                            contactName = contactName,
                            contactPhone = contactPhone,
                            variants = if (finalVariants.isEmpty()) null else finalVariants,
                            sizeSystemId = if (selectedSystemId != "user_custom") selectedSystemId else null
                        )
                        onBack()
                    },
                    modifier = Modifier.weight(1f),
                    enabled = isFormValid,
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366))
                ) {
                    Text("Por WhatsApp", textAlign = TextAlign.Center)
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
