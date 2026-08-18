package com.example.ezzeta.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ezzeta.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddressBookScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val user by viewModel.currentUser.collectAsState()
    val context = LocalContext.current
    var addressToEdit by remember { mutableStateOf<com.example.ezzeta.data.model.UserAddress?>(null) }
    var showAddDialog by remember { mutableStateOf(false) }

    if (showAddDialog || addressToEdit != null) {
        AddressEditDialog(
            address = addressToEdit,
            viewModel = viewModel,
            onDismiss = { 
                showAddDialog = false
                addressToEdit = null
            },
            onConfirm = { name, fullAddress, dept, prov, dist, ubigeo ->
                viewModel.addAddress(
                    context = context,
                    address = fullAddress,
                    dept = dept,
                    prov = prov,
                    dist = dist,
                    ubigeo = ubigeo,
                    name = name,
                    addressId = addressToEdit?.id
                )
                showAddDialog = false
                addressToEdit = null
            }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Libreta de direcciones") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Agregar dirección")
            }
        }
    ) { padding ->
        val addresses = user?.addresses ?: emptyList()
        
        if (addresses.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        Icons.Default.LocationOn, 
                        contentDescription = null, 
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.outline
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("No tienes direcciones guardadas", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.padding(padding).fillMaxSize(),
                contentPadding = PaddingValues(16.dp)
            ) {
                items(
                    items = addresses,
                    key = { it.id }
                ) { addr ->
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                        shape = RoundedCornerShape(12.dp),
                        onClick = { addressToEdit = addr },
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.LocationOn, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Column(modifier = Modifier.padding(start = 16.dp).weight(1f)) {
                                if (!addr.name.isNullOrBlank()) {
                                    Text(addr.name, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
                                }
                                Text(addr.address, fontWeight = FontWeight.Bold)
                                Text("${addr.district}, ${addr.province}, ${addr.department}", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                                if (!addr.ubigeoCode.isNullOrBlank()) {
                                    Text("Ubigeo: ${addr.ubigeoCode}", style = MaterialTheme.typography.labelSmall, color = Color.Gray.copy(alpha = 0.7f))
                                }
                            }
                            IconButton(onClick = { viewModel.deleteAddress(context, addr.id) }) {
                                Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = MaterialTheme.colorScheme.error)
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddressEditDialog(
    address: com.example.ezzeta.data.model.UserAddress?,
    viewModel: MainViewModel,
    onDismiss: () -> Unit,
    onConfirm: (name: String, address: String, dept: String, prov: String, dist: String, ubigeo: String?) -> Unit
) {
    var name by remember { mutableStateOf(address?.name ?: "") }
    var fullAddress by remember { mutableStateOf(address?.address ?: "") }
    
    val ubigeoData by viewModel.ubigeoData.collectAsState()
    val isLoadingUbigeo by viewModel.isLoadingUbigeo.collectAsState()
    val ubigeoError by viewModel.ubigeoError.collectAsState()

    var selectedDept by remember { mutableStateOf(address?.department ?: "") }
    var selectedProv by remember { mutableStateOf(address?.province ?: "") }
    var selectedDistrict by remember { mutableStateOf(address?.district ?: "") }
    var selectedUbigeoCode by remember { mutableStateOf(address?.ubigeoCode) }

    val departments = remember(ubigeoData) { ubigeoData.keys.toList().sorted() }
    val provinces = remember(selectedDept, ubigeoData) {
        ubigeoData[selectedDept]?.keys?.toList()?.sorted() ?: emptyList()
    }
    val districts = remember(selectedDept, selectedProv, ubigeoData) {
        ubigeoData[selectedDept]?.get(selectedProv)?.keys?.toList()?.sorted() ?: emptyList()
    }

    // Actualizar ubigeo cuando cambia el distrito
    LaunchedEffect(selectedDept, selectedProv, selectedDistrict) {
        selectedUbigeoCode = ubigeoData[selectedDept]?.get(selectedProv)?.get(selectedDistrict)?.ubigeo
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (address == null) "Nueva Dirección" else "Editar Dirección", fontWeight = FontWeight.Bold) },
        text = {
            Column(
                modifier = Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Nombre (ej. Casa, Oficina)") },
                    placeholder = { Text("Opcional") },
                    modifier = Modifier.fillMaxWidth()
                )
                
                OutlinedTextField(
                    value = fullAddress,
                    onValueChange = { fullAddress = it },
                    label = { Text("Dirección completa*") },
                    modifier = Modifier.fillMaxWidth()
                )

                if (isLoadingUbigeo) {
                    LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                } else if (ubigeoError != null) {
                    Text(ubigeoError!!, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                }

                // Departamento
                var deptExpanded by remember { mutableStateOf(false) }
                ExposedDropdownMenuBox(
                    expanded = deptExpanded,
                    onExpandedChange = { if (!isLoadingUbigeo) deptExpanded = it }
                ) {
                    OutlinedTextField(
                        value = selectedDept,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Departamento*") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = deptExpanded) },
                        modifier = Modifier.fillMaxWidth().menuAnchor(),
                        enabled = !isLoadingUbigeo && departments.isNotEmpty()
                    )
                    ExposedDropdownMenu(
                        expanded = deptExpanded,
                        onDismissRequest = { deptExpanded = false }
                    ) {
                        departments.forEach { dept ->
                            DropdownMenuItem(
                                text = { Text(dept) },
                                onClick = {
                                    if (selectedDept != dept) {
                                        selectedDept = dept
                                        selectedProv = ""
                                        selectedDistrict = ""
                                        selectedUbigeoCode = null
                                    }
                                    deptExpanded = false
                                }
                            )
                        }
                    }
                }

                // Provincia
                var provExpanded by remember { mutableStateOf(false) }
                ExposedDropdownMenuBox(
                    expanded = provExpanded,
                    onExpandedChange = { if (selectedDept.isNotEmpty()) provExpanded = it }
                ) {
                    OutlinedTextField(
                        value = selectedProv,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Provincia*") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = provExpanded) },
                        modifier = Modifier.fillMaxWidth().menuAnchor(),
                        enabled = selectedDept.isNotEmpty() && provinces.isNotEmpty()
                    )
                    ExposedDropdownMenu(
                        expanded = provExpanded,
                        onDismissRequest = { provExpanded = false }
                    ) {
                        provinces.forEach { prov ->
                            DropdownMenuItem(
                                text = { Text(prov) },
                                onClick = {
                                    if (selectedProv != prov) {
                                        selectedProv = prov
                                        selectedDistrict = ""
                                        selectedUbigeoCode = null
                                    }
                                    provExpanded = false
                                }
                            )
                        }
                    }
                }

                // Distrito
                var distExpanded by remember { mutableStateOf(false) }
                ExposedDropdownMenuBox(
                    expanded = distExpanded,
                    onExpandedChange = { if (selectedProv.isNotEmpty()) distExpanded = it }
                ) {
                    OutlinedTextField(
                        value = selectedDistrict,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Distrito*") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = distExpanded) },
                        modifier = Modifier.fillMaxWidth().menuAnchor(),
                        enabled = selectedProv.isNotEmpty() && districts.isNotEmpty()
                    )
                    ExposedDropdownMenu(
                        expanded = distExpanded,
                        onDismissRequest = { distExpanded = false }
                    ) {
                        districts.forEach { dist ->
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

                // Ubigeo (Solo lectura)
                if (selectedUbigeoCode != null) {
                    OutlinedTextField(
                        value = selectedUbigeoCode!!,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Código Ubigeo") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                            unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                        ),
                        textStyle = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold)
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(name, fullAddress, selectedDept, selectedProv, selectedDistrict, selectedUbigeoCode) },
                enabled = fullAddress.isNotBlank() && selectedDept.isNotBlank() && selectedProv.isNotBlank() && selectedDistrict.isNotBlank() && selectedUbigeoCode != null
            ) {
                Text("Guardar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}
