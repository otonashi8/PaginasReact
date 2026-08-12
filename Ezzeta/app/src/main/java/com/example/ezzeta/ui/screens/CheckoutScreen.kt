package com.example.ezzeta.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ezzeta.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit,
    onOrderComplete: () -> Unit
) {
    val context = LocalContext.current
    var email by remember { mutableStateOf("") }
    var document by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var selectedDept by remember { mutableStateOf("") }
    var selectedDistrict by remember { mutableStateOf("") }
    
    var saveAddress by remember { mutableStateOf(false) }
    var addressName by remember { mutableStateOf("") }
    val user by viewModel.currentUser.collectAsState()
    
    var paymentMethod by remember { mutableStateOf("card") } // "tarjeta" o"yape"
    
    // Form tarjeta
    var cardNumber by remember { mutableStateOf("") }
    var cardName by remember { mutableStateOf("") }
    var cardExpiry by remember { mutableStateOf("") }
    var cardCvc by remember { mutableStateOf("") }
    
    // fomulario iape+
    var yapePhone by remember { mutableStateOf("") }
    var yapeCode by remember { mutableStateOf("") }
    
    var couponCode by remember { mutableStateOf("") }
    var termsAccepted by remember { mutableStateOf(false) }

    val departments = listOf("Lima", "Arequipa", "Cusco", "La Libertad", "Piura")
    val districtsMap = mapOf(
        "Lima" to listOf("Miraflores", "San Isidro", "Barranco", "Surco", "La Molina"),
        "Arequipa" to listOf("Yanahuara", "Cayma", "Cercado", "Selva Alegre"),
        "Cusco" to listOf("Cercado", "San Blas", "San Sebastian"),
        "La Libertad" to listOf("Trujillo", "Victor Larco", "Huanchaco"),
        "Piura" to listOf("Piura", "Castilla", "Catacaos")
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Finalizar Compra", fontWeight = FontWeight.Bold) },
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
            Text("Información de contacto", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Dirección de correo electrónico*") },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
            )

            Spacer(modifier = Modifier.height(24.dp))
            Text("Detalles de facturación", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(12.dp))

            // Saved Addresses Section
            if (user?.addresses?.isNotEmpty() == true) {
                Text(
                    "Usar dirección guardada", 
                    style = MaterialTheme.typography.labelMedium, 
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                )
                androidx.compose.foundation.lazy.LazyRow(
                    modifier = Modifier.padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(user?.addresses?.size ?: 0) { index ->
                        val addr = user?.addresses?.get(index) ?: return@items
                        Surface(
                            onClick = {
                                address = addr.address
                                selectedDept = addr.department
                                selectedDistrict = addr.district
                            },
                            shape = RoundedCornerShape(12.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.5f)),
                            color = if (address == addr.address) MaterialTheme.colorScheme.primaryContainer else Color.Transparent
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                val displayName = if (!addr.name.isNullOrBlank()) addr.name else addr.address
                                Text(displayName, fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1, overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis, color = MaterialTheme.colorScheme.onSurface)
                                Text("${addr.district}, ${addr.department}", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }
            
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = document,
                    onValueChange = { document = it },
                    label = { Text("DNI/CE/RUC*") },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Telf/Cel* (+51)") },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Nombre/Alias*") },
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = lastName,
                    onValueChange = { lastName = it },
                    label = { Text("Apellidos*") },
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))
            
            // Dept Dropdown
            var deptExpanded by remember { mutableStateOf(false) }
            ExposedDropdownMenuBox(
                expanded = deptExpanded,
                onExpandedChange = { deptExpanded = it }
            ) {
                OutlinedTextField(
                    value = selectedDept,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Departamento*") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = deptExpanded) },
                    modifier = Modifier.fillMaxWidth().menuAnchor()
                )
                ExposedDropdownMenu(
                    expanded = deptExpanded,
                    onDismissRequest = { deptExpanded = false }
                ) {
                    departments.forEach { dept ->
                        DropdownMenuItem(
                            text = { Text(dept) },
                            onClick = {
                                selectedDept = dept
                                selectedDistrict = ""
                                deptExpanded = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // District Dropdown
            var distExpanded by remember { mutableStateOf(false) }
            ExposedDropdownMenuBox(
                expanded = distExpanded,
                onExpandedChange = { if (selectedDept.isNotEmpty()) distExpanded = it }
            ) {
                OutlinedTextField(
                    value = selectedDistrict,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Distrito*") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = distExpanded) },
                    modifier = Modifier.fillMaxWidth().menuAnchor(),
                    enabled = selectedDept.isNotEmpty()
                )
                ExposedDropdownMenu(
                    expanded = distExpanded,
                    onDismissRequest = { distExpanded = false }
                ) {
                    districtsMap[selectedDept]?.forEach { dist ->
                        DropdownMenuItem(
                            text = { Text(dist) },
                            onClick = {
                                selectedDistrict = dist
                                distExpanded = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = address,
                onValueChange = { address = it },
                label = { Text("Dirección Completa*") },
                modifier = Modifier.fillMaxWidth()
            )

            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 8.dp)) {
                Checkbox(checked = saveAddress, onCheckedChange = { saveAddress = it })
                Text("Guardar en mi libreta de direcciones", fontSize = 12.sp)
            }

            AnimatedVisibility(visible = saveAddress) {
                OutlinedTextField(
                    value = addressName,
                    onValueChange = { addressName = it },
                    label = { Text("Nombre de la dirección (ej. Casa, Oficina)") },
                    placeholder = { Text("Opcional") },
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    singleLine = true
                )
            }

            Spacer(modifier = Modifier.height(32.dp))
            Text("Pago", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text(
                "(todas las transacciones son seguras y encriptadas)",
                style = MaterialTheme.typography.labelSmall,
                color = Color.Gray
            )
            Spacer(modifier = Modifier.height(16.dp))
            
            // Payment Methods
            Card(
                modifier = Modifier.fillMaxWidth(),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color.LightGray),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent)
            ) {
                Column {
                    // Credit Card Option
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { paymentMethod = "card" }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(selected = paymentMethod == "card", onClick = { paymentMethod = "card" })
                        Text("Tarjeta de Crédito y Débito", modifier = Modifier.weight(1f))
                        Icon(Icons.Default.CreditCard, contentDescription = null, tint = Color.Gray)
                    }
                    
                    AnimatedVisibility(visible = paymentMethod == "card") {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Icon(Icons.Default.CreditCard, null, tint = Color.Blue)
                                Text("Visa / Mastercard / AMEX / Diners", fontSize = 12.sp, color = Color.Gray)
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            OutlinedTextField(
                                value = cardNumber,
                                onValueChange = { cardNumber = it },
                                label = { Text("Número de tarjeta*") },
                                modifier = Modifier.fillMaxWidth(),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            OutlinedTextField(
                                value = cardName,
                                onValueChange = { cardName = it },
                                label = { Text("Nombre del titular*") },
                                modifier = Modifier.fillMaxWidth()
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                OutlinedTextField(
                                    value = cardExpiry,
                                    onValueChange = { cardExpiry = it },
                                    label = { Text("Vencimiento*") },
                                    modifier = Modifier.weight(1f),
                                    placeholder = { Text("MM/YY") }
                                )
                                OutlinedTextField(
                                    value = cardCvc,
                                    onValueChange = { cardCvc = it },
                                    label = { Text("CVC*") },
                                    modifier = Modifier.weight(1f),
                                    trailingIcon = {
                                        IconButton(onClick = {}) { Icon(Icons.Default.Help, null, modifier = Modifier.size(16.dp)) }
                                    },
                                    placeholder = { Text("123") }
                                )
                            }
                        }
                    }
                    
                    HorizontalDivider()
                    
                    // Yape Option
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { paymentMethod = "yape" }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(selected = paymentMethod == "yape", onClick = { paymentMethod = "yape" })
                        Text("Yape", modifier = Modifier.weight(1f))
                        // Simulated Yape icon placeholder
                        Icon(Icons.Default.QrCodeScanner, contentDescription = null, tint = Color(0xFF8E24AA))
                    }
                    
                    AnimatedVisibility(visible = paymentMethod == "yape") {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Paga con Yape en pocos segundos", fontWeight = FontWeight.Bold)
                            Text("Completa los siguientes datos para seguir con tu compra", fontSize = 12.sp, color = Color.Gray)
                            Spacer(modifier = Modifier.height(12.dp))
                            OutlinedTextField(
                                value = yapePhone,
                                onValueChange = { yapePhone = it },
                                label = { Text("Celular asociado a Yape*") },
                                modifier = Modifier.fillMaxWidth(),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            OutlinedTextField(
                                value = yapeCode,
                                onValueChange = { yapeCode = it },
                                label = { Text("Código de aprobación*") },
                                modifier = Modifier.fillMaxWidth(),
                                trailingIcon = {
                                    IconButton(onClick = {}) { Icon(Icons.Default.Help, null, modifier = Modifier.size(16.dp)) }
                                },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Surface(
                                color = Color.LightGray.copy(alpha = 0.2f),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(modifier = Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Info, null, tint = Color.Gray, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        "Recuerda tener activada la opción de \"Compras por internet\" en Yape",
                                        fontSize = 10.sp,
                                        lineHeight = 12.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Handshake, null, tint = Color.Gray, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Procesado por Mercado Pago", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            }

            Spacer(modifier = Modifier.height(32.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(
                    value = couponCode,
                    onValueChange = { couponCode = it },
                    label = { Text("Código de cupón") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                Button(onClick = {}, shape = RoundedCornerShape(8.dp)) {
                    Text("Aplicar")
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                "Sus datos personales se utilizarán para procesar su pedido, respaldar su experiencia en este sitio web y para otros fines descritos en nuestra política de privacidad.",
                style = MaterialTheme.typography.labelSmall,
                color = Color.Gray,
                textAlign = TextAlign.Justify
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(checked = termsAccepted, onCheckedChange = { termsAccepted = it })
                Text("He leído y estoy de acuerdo con los términos y condiciones de la web*", fontSize = 12.sp)
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            Button(
                onClick = { 
                    if (saveAddress && address.isNotBlank() && selectedDept.isNotBlank() && selectedDistrict.isNotBlank()) {
                        viewModel.addAddress(context, address, selectedDept, selectedDistrict, addressName)
                    }
                    viewModel.checkout(context)
                    onOrderComplete()
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                enabled = termsAccepted,
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Lock, null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("REALIZAR PEDIDO", fontWeight = FontWeight.Bold)
            }
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
