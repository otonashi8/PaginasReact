package com.example.ezzeta.ui.screens.admin

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.ui.draw.alpha
import com.example.ezzeta.data.model.HomeBanner
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminBannerManagementScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val banners by viewModel.homeBanners.collectAsState()
    var showEditDialog by remember { mutableStateOf<HomeBanner?>(null) }
    var showCreateDialog by remember { mutableStateOf(false) }
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Gestión de Banners Home", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                },
                actions = {
                    IconButton(onClick = { showCreateDialog = true }) {
                        Icon(Icons.Default.Add, contentDescription = "Nuevo Banner")
                    }
                }
            )
        }
    ) { padding ->
        if (banners.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("No hay banners configurados", color = Color.Gray)
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(banners, key = { it.id }) { banner ->
                    BannerAdminItem(
                        banner = banner,
                        onEdit = { showEditDialog = banner },
                        onDelete = { viewModel.deleteHomeBanner(context, banner.id) },
                        onToggleStatus = { viewModel.toggleBannerStatus(context, banner) },
                        onMoveUp = { viewModel.moveBanner(context, banner.id, true) },
                        onMoveDown = { viewModel.moveBanner(context, banner.id, false) }
                    )
                }
            }
        }

        if (showCreateDialog) {
            BannerEditDialog(
                banner = null,
                onDismiss = { showCreateDialog = false },
                onSave = { b, dUri, mUri ->
                    viewModel.saveHomeBanner(context, b, dUri, mUri) { success ->
                        if (success) showCreateDialog = false
                    }
                }
            )
        }

        if (showEditDialog != null) {
            BannerEditDialog(
                banner = showEditDialog,
                onDismiss = { showEditDialog = null },
                onSave = { b, dUri, mUri ->
                    viewModel.saveHomeBanner(context, b, dUri, mUri) { success ->
                        if (success) showEditDialog = null
                    }
                }
            )
        }
    }
}

// Helper to fix context issues in Composable
@Composable
fun BannerAdminItem(
    banner: HomeBanner,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onToggleStatus: (android.content.Context) -> Unit,
    onMoveUp: (android.content.Context) -> Unit,
    onMoveDown: (android.content.Context) -> Unit
) {
    val context = LocalContext.current
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Preview
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    AsyncImage(
                        model = banner.desktopImageUrl,
                        contentDescription = null,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                }
                
                Spacer(modifier = Modifier.width(16.dp))
                
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = "Orden: ${banner.order + 1}", fontWeight = FontWeight.Bold)
                    Text(text = "Duración: ${banner.rotationDurationMillis / 1000}s", style = MaterialTheme.typography.bodySmall)
                    
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = if (banner.isActive) Color(0xFFE8F5E9) else Color(0xFFFBE9E7)
                        ) {
                            Text(
                                text = if (banner.isActive) "ACTIVO" else "INACTIVO",
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                style = MaterialTheme.typography.labelSmall,
                                color = if (banner.isActive) Color(0xFF2E7D32) else Color(0xFFC62828),
                                fontWeight = FontWeight.Bold
                            )
                        }
                        if (banner.mobileImageUrl != null) {
                            Spacer(modifier = Modifier.width(8.dp))
                            Icon(Icons.Default.PhoneAndroid, contentDescription = "Tiene Mobile", modifier = Modifier.size(14.dp), tint = Color.Gray)
                        }
                    }
                }
                
                Column {
                    IconButton(onClick = { onMoveUp(context) }, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.ArrowUpward, contentDescription = "Subir")
                    }
                    IconButton(onClick = { onMoveDown(context) }, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.ArrowDownward, contentDescription = "Bajar")
                    }
                }
            }
            
            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp).alpha(0.5f))
            
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                TextButton(onClick = { onToggleStatus(context) }) {
                    Text(if (banner.isActive) "Desactivar" else "Activar")
                }
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BannerEditDialog(
    banner: HomeBanner?,
    onDismiss: () -> Unit,
    onSave: (HomeBanner, Uri?, Uri?) -> Unit
) {
    var isActive by remember { mutableStateOf(banner?.isActive ?: true) }
    var durationSecs by remember { mutableStateOf((banner?.rotationDurationMillis ?: 3000L) / 1000) }
    
    var desktopUri by remember { mutableStateOf<Uri?>(null) }
    var mobileUri by remember { mutableStateOf<Uri?>(null) }
    
    var desktopUrl by remember { mutableStateOf(banner?.desktopImageUrl?.let { if (it.startsWith("http")) it else "" } ?: "") }
    var mobileUrl by remember { mutableStateOf(banner?.mobileImageUrl?.let { if (it.startsWith("http")) it else "" } ?: "") }
    
    val desktopLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) {
            desktopUri = uri
            desktopUrl = "" // Limpiar url si se sube archivo
        }
    }
    val mobileLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) {
            mobileUri = uri
            mobileUrl = "" // Limpiar url si se sube archivo
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (banner == null) "Nuevo Banner" else "Editar Banner") },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                Text("Imagen Desktop (Principal)", style = MaterialTheme.typography.labelMedium)
                Spacer(modifier = Modifier.height(4.dp))
                
                // Picker / Preview
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(100.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
                        .clickable { desktopLauncher.launch("image/*") },
                    contentAlignment = Alignment.Center
                ) {
                    val model = if (desktopUrl.isNotBlank()) desktopUrl else (desktopUri ?: banner?.desktopImageUrl)
                    if (model != null) {
                        AsyncImage(model = model, contentDescription = null, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                    } else {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.CloudUpload, contentDescription = null)
                            Text("Subir archivo", fontSize = 12.sp)
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = desktopUrl,
                    onValueChange = { 
                        desktopUrl = it
                        if (it.isNotBlank()) desktopUri = null
                    },
                    label = { Text("O pega un link (URL) directo") },
                    placeholder = { Text("https://...") },
                    modifier = Modifier.fillMaxWidth(),
                    textStyle = TextStyle(fontSize = 12.sp)
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text("Imagen Mobile (Opcional)", style = MaterialTheme.typography.labelMedium)
                Spacer(modifier = Modifier.height(4.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(100.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp))
                        .clickable { mobileLauncher.launch("image/*") },
                    contentAlignment = Alignment.Center
                ) {
                    val model = if (mobileUrl.isNotBlank()) mobileUrl else (mobileUri ?: banner?.mobileImageUrl)
                    if (model != null) {
                        AsyncImage(model = model, contentDescription = null, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                    } else {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.AddPhotoAlternate, contentDescription = null)
                            Text("Subir archivo mobile", fontSize = 12.sp)
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = mobileUrl,
                    onValueChange = { 
                        mobileUrl = it
                        if (it.isNotBlank()) mobileUri = null
                    },
                    label = { Text("O pega un link mobile") },
                    placeholder = { Text("https://...") },
                    modifier = Modifier.fillMaxWidth(),
                    textStyle = TextStyle(fontSize = 12.sp)
                )
                
                if (mobileUri != null || mobileUrl.isNotBlank() || banner?.mobileImageUrl != null) {
                    TextButton(onClick = { 
                        mobileUri = null
                        mobileUrl = ""
                        // Nota: Para limpiar el del banner real si se está editando, 
                        // el b.copy abajo se encargará si pasamos mobileUrl/mobileUri vacíos
                    }) {
                        Text("Quitar imagen mobile", color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = durationSecs.toString(),
                    onValueChange = { durationSecs = it.toLongOrNull() ?: 0 },
                    label = { Text("Duración rotación (segundos)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(checked = isActive, onCheckedChange = { isActive = it })
                    Text("Banner Activo")
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val finalBanner = (banner ?: HomeBanner(
                        id = UUID.randomUUID().toString(),
                        desktopImageUrl = "",
                        order = 999
                    )).copy(
                        isActive = isActive,
                        rotationDurationMillis = durationSecs.coerceAtLeast(1) * 1000,
                        desktopImageUrl = if (desktopUrl.isNotBlank()) desktopUrl else (banner?.desktopImageUrl ?: ""),
                        mobileImageUrl = if (mobileUrl.isNotBlank()) mobileUrl else (if (mobileUri == null) null else banner?.mobileImageUrl)
                    )
                    onSave(finalBanner, desktopUri, mobileUri)
                },
                enabled = desktopUri != null || desktopUrl.isNotBlank() || banner?.desktopImageUrl != null
            ) {
                Text("Guardar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancelar") }
        }
    )
}
