package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ezzeta.data.model.SizeOption
import com.example.ezzeta.data.model.User
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminClientSizesScreen(viewModel: MainViewModel, onBack: () -> Unit) {
    val clientSizes by viewModel.adminFilteredClientSizes.collectAsState()
    val searchQuery by viewModel.clientSizesSearchQuery.collectAsState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Tallas Clientes", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { viewModel.setClientSizeSearchQuery(it) },
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                placeholder = { Text("Buscar por talla, cliente o email...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                singleLine = true,
                shape = RoundedCornerShape(8.dp)
            )

            if (clientSizes.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) {
                    Text("No hay tallas que coincidan con la búsqueda.", color = Color.Gray)
                }
            } else {
                LazyColumn(modifier = Modifier.fillMaxSize()) {
                    items(clientSizes) { (option, owner) ->
                        val sdf = remember { SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()) }
                        val dateStr = remember(option.createdAt) { sdf.format(Date(option.createdAt)) }

                        ListItem(
                            headlineContent = { Text(option.name, fontWeight = FontWeight.Bold) },
                            supportingContent = {
                                Column {
                                    Text("Cliente: ${owner?.alias ?: option.creatorName ?: "Desconocido"}", style = MaterialTheme.typography.bodySmall)
                                    Text("Email: ${owner?.email ?: "N/A"}", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                                    Text("ID Usuario: ${option.createdByUserId ?: "N/A"}", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                                    Text("Fecha: $dateStr", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                                }
                            }
                        )
                        HorizontalDivider()
                    }
                }
            }
        }
    }
}
