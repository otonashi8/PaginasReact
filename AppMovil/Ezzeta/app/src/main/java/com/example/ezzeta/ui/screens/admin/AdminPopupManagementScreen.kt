package com.example.ezzeta.ui.screens.admin

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ezzeta.data.model.AppPopup
import com.example.ezzeta.data.model.PopupActionType
import com.example.ezzeta.data.model.PopupContentType
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminPopupManagementScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val popups by viewModel.appPopups.collectAsState()
    var showEditDialog by remember { mutableStateOf<AppPopup?>(null) }
    var showCreateDialog by remember { mutableStateOf(false) }
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestión de Pop-ups", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                },
                actions = {
                    IconButton(onClick = { showCreateDialog = true }) {
                        Icon(Icons.Default.Add, contentDescription = "Nuevo Pop-up")
                    }
                }
            )
        }
    ) { padding ->
        if (popups.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("No hay pop-ups configurados", color = Color.Gray)
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(popups, key = { it.id }) { popup ->
                    PopupAdminItem(
                        popup = popup,
                        onEdit = { showEditDialog = popup },
                        onDelete = { viewModel.deletePopup(context, popup.id) },
                        onToggleStatus = { viewModel.togglePopupStatus(context, popup) }
                    )
                }
            }
        }

        if (showCreateDialog) {
            PopupEditDialog(
                popup = null,
                onDismiss = { showCreateDialog = false },
                onSave = { p, uri ->
                    viewModel.savePopup(context, p, uri) { success ->
                        if (success) showCreateDialog = false
                    }
                }
            )
        }

        if (showEditDialog != null) {
            PopupEditDialog(
                popup = showEditDialog,
                onDismiss = { showEditDialog = null },
                onSave = { p, uri ->
                    viewModel.savePopup(context, p, uri) { success ->
                        if (success) showEditDialog = null
                    }
                }
            )
        }
    }
}

@Composable
fun PopupAdminItem(
    popup: AppPopup,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onToggleStatus: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Mini Preview
                Box(
                    modifier = Modifier
                        .size(60.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    if (popup.contentType == PopupContentType.IMAGE) {
                        AsyncImage(
                            model = popup.mediaPath,
                            contentDescription = null,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        Icon(Icons.Default.VideoLibrary, contentDescription = "Video")
                    }
                }
                
                Spacer(modifier = Modifier.width(16.dp))
                
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = popup.name, fontWeight = FontWeight.Bold)
                    Text(
                        text = "Aparece en: ${popup.triggerScreen}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "Tipo: ${popup.contentType} | Orden: ${popup.order}",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.Gray
                    )
                }
                
                Switch(
                    checked = popup.isActive,
                    onCheckedChange = { onToggleStatus() },
                    modifier = Modifier.scale(0.8f)
                )
            }
            
            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp).alpha(0.3f))
            
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (popup.showOncePerSession) {
                        Icon(Icons.Default.Timer10, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color.Gray)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("1 vez/sesión", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                    }
                }
                
                Row {
                    IconButton(onClick = onEdit) {
                        Icon(Icons.Default.Edit, contentDescription = "Editar", tint = MaterialTheme.colorScheme.primary)
                    }
                    IconButton(onClick = onDelete) {
                        Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = MaterialTheme.colorScheme.error)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PopupEditDialog(
    popup: AppPopup?,
    onDismiss: () -> Unit,
    onSave: (AppPopup, Uri?) -> Unit
) {
    var name by remember { mutableStateOf(popup?.name ?: "") }
    var triggerScreen by remember { mutableStateOf(popup?.triggerScreen ?: "home") }
    var contentType by remember { mutableStateOf(popup?.contentType ?: PopupContentType.IMAGE) }
    var mediaUri by remember { mutableStateOf<Uri?>(null) }
    var mediaLink by remember { mutableStateOf(popup?.mediaPath?.let { if (it.startsWith("http")) it else "" } ?: "") }
    var isActive by remember { mutableStateOf(popup?.isActive ?: true) }
    var order by remember { mutableStateOf(popup?.order?.toString() ?: "0") }
    var showOnce by remember { mutableStateOf(popup?.showOncePerSession ?: true) }
    var actionType by remember { mutableStateOf(popup?.actionType ?: PopupActionType.NONE) }
    var actionRoute by remember { mutableStateOf(popup?.actionRoute ?: "") }

    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) {
            mediaUri = uri
            mediaLink = ""
        }
    }

    // Listas de pantallas reales basadas en Screen.kt
    val availableScreens = listOf(
        "home", "categories", "marketplace", "profile", "cart", "history", "wishlist", "orders", "following"
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (popup == null) "Nuevo Pop-up" else "Editar Pop-up") },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Nombre interno") },
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                Text("Sección donde aparecerá", style = MaterialTheme.typography.labelMedium)
                ExposedDropdownMenuBox(
                    expanded = false, // Simplified for now, using a simple Row or just Text for demo
                    onExpandedChange = { }
                ) {
                    // Fallback to simple selection if ExposedDropdown is complex to implement here
                }
                
                // Simplified screen selector
                availableScreens.forEach { screen ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { triggerScreen = screen }
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(selected = triggerScreen == screen, onClick = { triggerScreen = screen })
                        Text(screen.replaceFirstChar { it.uppercase() }, style = MaterialTheme.typography.bodySmall)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
                
                Text("Contenido", style = MaterialTheme.typography.labelMedium)
                Row {
                    FilterChip(
                        selected = contentType == PopupContentType.IMAGE,
                        onClick = { contentType = PopupContentType.IMAGE },
                        label = { Text("Imagen") }
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    FilterChip(
                        selected = contentType == PopupContentType.VIDEO,
                        onClick = { contentType = PopupContentType.VIDEO },
                        label = { Text("Video") }
                    )
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
                        .clickable { launcher.launch(if (contentType == PopupContentType.IMAGE) "image/*" else "video/*") },
                    contentAlignment = Alignment.Center
                ) {
                    val model = if (mediaLink.isNotBlank()) mediaLink else (mediaUri ?: popup?.mediaPath)
                    if (model != null) {
                        if (contentType == PopupContentType.IMAGE) {
                            AsyncImage(model = model, contentDescription = null, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Fit)
                        } else {
                            Icon(Icons.Default.VideoLibrary, contentDescription = null, modifier = Modifier.size(48.dp))
                            Text("Video seleccionado", modifier = Modifier.align(Alignment.BottomCenter).padding(8.dp), fontSize = 10.sp)
                        }
                    } else {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.CloudUpload, contentDescription = null)
                            Text("Subir archivo", fontSize = 12.sp)
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = mediaLink,
                    onValueChange = { 
                        mediaLink = it
                        if (it.isNotBlank()) mediaUri = null
                    },
                    label = { Text("O pega un link directo") },
                    modifier = Modifier.fillMaxWidth(),
                    textStyle = androidx.compose.ui.text.TextStyle(fontSize = 11.sp)
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = order,
                    onValueChange = { order = it },
                    label = { Text("Orden") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(checked = showOnce, onCheckedChange = { showOnce = it })
                    Text("Mostrar solo una vez por sesión", style = MaterialTheme.typography.bodySmall)
                }

                Spacer(modifier = Modifier.height(16.dp))
                
                Text("Acción al pulsar", style = MaterialTheme.typography.labelMedium)
                Row {
                    FilterChip(
                        selected = actionType == PopupActionType.NONE,
                        onClick = { actionType = PopupActionType.NONE },
                        label = { Text("Nada") }
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    FilterChip(
                        selected = actionType == PopupActionType.NAVIGATE,
                        onClick = { actionType = PopupActionType.NAVIGATE },
                        label = { Text("Navegar") }
                    )
                }
                
                if (actionType == PopupActionType.NAVIGATE) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Destino de navegación:", style = MaterialTheme.typography.labelSmall)
                    availableScreens.forEach { screen ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { actionRoute = screen }
                                .padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(selected = actionRoute == screen, onClick = { actionRoute = screen })
                            Text(screen.replaceFirstChar { it.uppercase() }, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(checked = isActive, onCheckedChange = { isActive = it })
                    Text("Pop-up Activo")
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val finalPopup = (popup ?: AppPopup(
                        id = UUID.randomUUID().toString(),
                        name = "",
                        triggerScreen = "",
                        contentType = contentType,
                        mediaPath = ""
                    )).copy(
                        name = name,
                        triggerScreen = triggerScreen,
                        contentType = contentType,
                        mediaPath = if (mediaLink.isNotBlank()) mediaLink else (popup?.mediaPath ?: ""),
                        isActive = isActive,
                        order = order.toIntOrNull() ?: 0,
                        showOncePerSession = showOnce,
                        actionType = actionType,
                        actionRoute = if (actionType == PopupActionType.NAVIGATE) actionRoute else null,
                        updatedAt = System.currentTimeMillis()
                    )
                    onSave(finalPopup, mediaUri)
                },
                enabled = name.isNotBlank() && (mediaUri != null || mediaLink.isNotBlank() || popup?.mediaPath != null)
            ) {
                Text("Guardar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancelar") }
        }
    )
}
