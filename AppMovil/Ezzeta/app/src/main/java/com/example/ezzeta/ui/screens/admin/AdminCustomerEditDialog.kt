package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.example.ezzeta.data.model.User
import com.example.ezzeta.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminCustomerEditDialog(
    user: User?, // null if creating new
    viewModel: MainViewModel,
    onDismiss: () -> Unit
) {
    var name by remember { mutableStateOf(user?.alias ?: "") }
    var email by remember { mutableStateOf(user?.email ?: "") }
    var phone by remember { mutableStateOf(user?.phone ?: "") }
    var dniRuc by remember { mutableStateOf(user?.dniRuc ?: "") }
    var isAdmin by remember { mutableStateOf(user?.isAdmin ?: false) }
    var isActive by remember { mutableStateOf(user?.isActive ?: true) }

    val context = androidx.compose.ui.platform.LocalContext.current

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(
                onClick = {
                    if (name.isNotBlank() && email.isNotBlank()) {
                        if (user == null) {
                            viewModel.adminCreateUser(context, name, email, phone, roleId = null, isAdminUser = isAdmin)
                        } else {
                            viewModel.adminUpdateUser(context, user.copy(
                                alias = name,
                                email = email,
                                phone = phone,
                                dniRuc = dniRuc,
                                isAdmin = isAdmin,
                                isAdminUser = isAdmin,
                                isActive = isActive
                            ))
                        }
                        onDismiss()
                    }
                }
            ) {
                Text(if (user == null) "Crear Cliente" else "Guardar Cambios")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancelar") }
        },
        title = { Text(text = if (user == null) "Nuevo Cliente" else "Editar Cliente", fontWeight = FontWeight.Bold) },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Nombre Completo") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(
                    value = email, 
                    onValueChange = { email = it }, 
                    label = { Text("Correo electrónico") }, 
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                )
                OutlinedTextField(
                    value = phone, 
                    onValueChange = { phone = it }, 
                    label = { Text("Teléfono") }, 
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
                )
                OutlinedTextField(value = dniRuc, onValueChange = { dniRuc = it }, label = { Text("DNI / RUC") }, modifier = Modifier.fillMaxWidth())
                
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Activo")
                    Switch(checked = isActive, onCheckedChange = { isActive = it })
                }
                
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Es Administrador")
                    Switch(checked = isAdmin, onCheckedChange = { isAdmin = it })
                }
            }
        }
    )
}
