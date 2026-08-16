package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ezzeta.data.model.ComboRequirement
import com.example.ezzeta.data.model.PriceRule
import com.example.ezzeta.data.model.PriceRuleType
import com.example.ezzeta.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminPriceRulesScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val rules by viewModel.priceRules.collectAsState()
    var showRuleDialog by remember { mutableStateOf<PriceRule?>(null) }
    var isCreatingNew by remember { mutableStateOf(false) }

    if (showRuleDialog != null || isCreatingNew) {
        RuleEditorDialog(
            rule = showRuleDialog,
            onDismiss = {
                showRuleDialog = null
                isCreatingNew = false
            },
            onSave = { updatedRule ->
                if (isCreatingNew) {
                    viewModel.addPriceRule(context, updatedRule)
                } else {
                    viewModel.updatePriceRule(context, updatedRule)
                }
                showRuleDialog = null
                isCreatingNew = false
            },
            viewModel = viewModel
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Reglas de Precios", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { isCreatingNew = true }) {
                Icon(Icons.Default.Add, contentDescription = "Nueva Regla")
            }
        }
    ) { padding ->
        if (rules.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("No hay reglas de precios configuradas.", color = Color.Gray)
            }
        } else {
            LazyColumn(
                modifier = Modifier.padding(padding).fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(rules.sortedBy { it.priority }) { rule ->
                    PriceRuleItem(
                        rule = rule,
                        onEdit = { showRuleDialog = rule },
                        onDelete = { viewModel.deletePriceRule(context, rule.id) },
                        onToggle = { viewModel.updatePriceRule(context, rule.copy(isActive = !rule.isActive)) }
                    )
                }
            }
        }
    }
}

@Composable
fun PriceRuleItem(
    rule: PriceRule,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onToggle: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (rule.isActive) MaterialTheme.colorScheme.surface else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = rule.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Text(
                        text = "Tipo: ${rule.type.name} | Prioridad: ${rule.priority}",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }
                
                Switch(checked = rule.isActive, onCheckedChange = { onToggle() })
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            val discountText = if (rule.isPercentage) "${rule.discountValue}%" else "S/ ${rule.discountValue}"
            Text(
                text = "Descuento: $discountText",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            
            if (rule.requiresCoupon) {
                Text(
                    text = "Cupón: ${rule.couponCode}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.secondary
                )
            }
            
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                IconButton(onClick = onEdit) { Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(20.dp)) }
                IconButton(onClick = onDelete) { Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red, modifier = Modifier.size(20.dp)) }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RuleEditorDialog(
    rule: PriceRule?,
    onDismiss: () -> Unit,
    onSave: (PriceRule) -> Unit,
    viewModel: MainViewModel
) {
    var name by remember { mutableStateOf(rule?.name ?: "") }
    var type by remember { mutableStateOf(rule?.type ?: PriceRuleType.PRODUCT) }
    var discountValue by remember { mutableStateOf(rule?.discountValue?.toString() ?: "") }
    var isPercentage by remember { mutableStateOf(rule?.isPercentage ?: true) }
    var priority by remember { mutableStateOf(rule?.priority?.toString() ?: "10") }
    var requiresCoupon by remember { mutableStateOf(rule?.requiresCoupon ?: false) }
    var couponCode by remember { mutableStateOf(rule?.couponCode ?: "") }
    var minSubtotal by remember { mutableStateOf(rule?.minSubtotal?.toString() ?: "") }
    var finalComboPrice by remember { mutableStateOf(rule?.finalComboPrice?.toString() ?: "") }
    
    val targetIds = remember { mutableStateListOf<String>().apply { addAll(rule?.targetIds ?: emptyList()) } }
    val comboReqs = remember { mutableStateListOf<ComboRequirement>().apply { addAll(rule?.comboRequirements ?: emptyList()) } }

    val allProducts by viewModel.allProducts.collectAsState()
    val storeProducts = remember(allProducts) { allProducts.filter { !it.isClientProduct } }
    val categories by viewModel.storeCategories.collectAsState()

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (rule == null) "Nueva Regla" else "Editar Regla") },
        text = {
            Column(
                modifier = Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Nombre de la Regla") }, modifier = Modifier.fillMaxWidth())
                
                var typeExpanded by remember { mutableStateOf(false) }
                ExposedDropdownMenuBox(expanded = typeExpanded, onExpandedChange = { typeExpanded = it }) {
                    OutlinedTextField(
                        value = type.name,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Tipo de Regla") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = typeExpanded) },
                        modifier = Modifier.fillMaxWidth().menuAnchor()
                    )
                    ExposedDropdownMenu(expanded = typeExpanded, onDismissRequest = { typeExpanded = false }) {
                        PriceRuleType.values().forEach { t ->
                            DropdownMenuItem(text = { Text(t.name) }, onClick = { type = t; typeExpanded = false })
                        }
                    }
                }

                if (type != PriceRuleType.COMBO) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        OutlinedTextField(
                            value = discountValue,
                            onValueChange = { discountValue = it },
                            label = { Text("Valor del Descuento") },
                            modifier = Modifier.weight(1f),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(if (isPercentage) "%" else "S/", fontWeight = FontWeight.Bold)
                            Switch(checked = isPercentage, onCheckedChange = { isPercentage = it })
                        }
                    }
                }

                if (type == PriceRuleType.PRODUCT) {
                    Text("Productos Seleccionados (${targetIds.size})", fontWeight = FontWeight.Bold)
                    targetIds.forEach { id ->
                        val prod = storeProducts.find { it.id == id }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = prod?.name ?: id, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodySmall)
                            IconButton(onClick = { targetIds.remove(id) }) { Icon(Icons.Default.Delete, null, tint = Color.Red) }
                        }
                    }
                    var searchProd by remember { mutableStateOf("") }
                    OutlinedTextField(value = searchProd, onValueChange = { searchProd = it }, label = { Text("Buscar producto para añadir...") }, modifier = Modifier.fillMaxWidth())
                    val filteredProds = if (searchProd.length > 2) storeProducts.filter { it.name.contains(searchProd, ignoreCase = true) && it.id !in targetIds }.take(5) else emptyList()
                    filteredProds.forEach { p ->
                        DropdownMenuItem(text = { Text(p.name) }, onClick = { targetIds.add(p.id); searchProd = "" })
                    }
                }

                if (type == PriceRuleType.CATEGORY) {
                    var catExpanded by remember { mutableStateOf(false) }
                    val selectedCat = categories.find { it.id in targetIds }
                    ExposedDropdownMenuBox(expanded = catExpanded, onExpandedChange = { catExpanded = it }) {
                        OutlinedTextField(
                            value = selectedCat?.name ?: "Seleccionar Categoría",
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Categoría Objetivo") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = catExpanded) },
                            modifier = Modifier.fillMaxWidth().menuAnchor()
                        )
                        ExposedDropdownMenu(expanded = catExpanded, onDismissRequest = { catExpanded = false }) {
                            categories.forEach { c ->
                                DropdownMenuItem(text = { Text(c.name) }, onClick = { 
                                    targetIds.clear()
                                    targetIds.add(c.id)
                                    catExpanded = false 
                                })
                            }
                        }
                    }
                }

                if (type == PriceRuleType.ORDER_TOTAL) {
                    OutlinedTextField(
                        value = minSubtotal, 
                        onValueChange = { minSubtotal = it }, 
                        label = { Text("Subtotal Mínimo (EZZETA)") }, 
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), 
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                if (type == PriceRuleType.COMBO) {
                    OutlinedTextField(
                        value = finalComboPrice, 
                        onValueChange = { finalComboPrice = it }, 
                        label = { Text("Precio Final del Combo") }, 
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), 
                        modifier = Modifier.fillMaxWidth()
                    )
                    Text("Requisitos del Combo", fontWeight = FontWeight.Bold)
                    comboReqs.forEachIndexed { index, req ->
                        Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))) {
                            Column(modifier = Modifier.padding(8.dp)) {
                                val prod = storeProducts.find { it.id == req.productId }
                                Text(text = prod?.name ?: "Seleccionar producto...", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    OutlinedTextField(
                                        value = req.quantity.toString(),
                                        onValueChange = { comboReqs[index] = req.copy(quantity = it.toIntOrNull() ?: 1) },
                                        label = { Text("Cantidad") },
                                        modifier = Modifier.weight(1f),
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                                    )
                                    IconButton(onClick = { comboReqs.removeAt(index) }) { Icon(Icons.Default.Delete, null, tint = Color.Red) }
                                }
                            }
                        }
                    }
                    var searchComboProd by remember { mutableStateOf("") }
                    OutlinedTextField(value = searchComboProd, onValueChange = { searchComboProd = it }, label = { Text("Buscar producto para el combo...") }, modifier = Modifier.fillMaxWidth())
                    val comboFiltered = if (searchComboProd.length > 2) storeProducts.filter { it.name.contains(searchComboProd, ignoreCase = true) }.take(5) else emptyList()
                    comboFiltered.forEach { p ->
                        DropdownMenuItem(text = { Text(p.name) }, onClick = { 
                            comboReqs.add(ComboRequirement(productId = p.id, quantity = 1))
                            searchComboProd = "" 
                        })
                    }
                }

                OutlinedTextField(value = priority, onValueChange = { priority = it }, label = { Text("Prioridad (Menor = Más importante)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(checked = requiresCoupon, onCheckedChange = { requiresCoupon = it })
                    Text("Requiere Cupón")
                }
                
                if (requiresCoupon) {
                    OutlinedTextField(value = couponCode, onValueChange = { couponCode = it.uppercase() }, label = { Text("Código de Cupón") }, modifier = Modifier.fillMaxWidth())
                }
            }
        },
        confirmButton = {
            Button(onClick = {
                val updatedRule = PriceRule(
                    id = rule?.id ?: "rule_${System.currentTimeMillis()}",
                    name = name,
                    type = type,
                    discountValue = discountValue.toDoubleOrNull() ?: 0.0,
                    isPercentage = isPercentage,
                    priority = priority.toIntOrNull() ?: 10,
                    requiresCoupon = requiresCoupon,
                    couponCode = if (requiresCoupon) couponCode else null,
                    targetIds = targetIds.toList(),
                    comboRequirements = comboReqs.toList(),
                    minSubtotal = minSubtotal.toDoubleOrNull(),
                    finalComboPrice = finalComboPrice.toDoubleOrNull(),
                    isActive = rule?.isActive ?: true
                )
                onSave(updatedRule)
            }, enabled = name.isNotBlank()) { Text("Guardar") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancelar") } }
    )
}
