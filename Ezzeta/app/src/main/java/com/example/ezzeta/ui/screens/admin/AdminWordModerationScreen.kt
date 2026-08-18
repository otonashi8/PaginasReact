package com.example.ezzeta.ui.screens.admin

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ezzeta.data.model.BlockedWord
import com.example.ezzeta.ui.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminWordModerationScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val blockedWords by viewModel.blockedWords.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    
    var showDialog by remember { mutableStateOf<BlockedWord?>(null) }
    var isAdding by remember { mutableStateOf(false) }

    val filteredWords = blockedWords.filter { 
        it.word.contains(searchQuery, ignoreCase = true)
    }.sortedByDescending { it.createdAt }

    if (isAdding || showDialog != null) {
        WordEditorDialog(
            wordToEdit = showDialog,
            onDismiss = {
                isAdding = false
                showDialog = null
            },
            onSave = { word, isPartial ->
                if (isAdding) {
                    viewModel.addBlockedWord(context, word, isPartial)
                } else if (showDialog != null) {
                    viewModel.updateBlockedWord(context, showDialog!!.copy(word = word, isPartialMatch = isPartial))
                }
                isAdding = false
                showDialog = null
            }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Moderación de Palabras", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                }
            )
        },
        floatingActionButton = {
            if (viewModel.hasPermission("Moderación de palabras", "CREATE")) {
                FloatingActionButton(onClick = { isAdding = true }) {
                    Icon(Icons.Default.Add, contentDescription = "Agregar palabra")
                }
            }
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                placeholder = { Text("Buscar palabra...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            if (filteredWords.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        text = if (searchQuery.isEmpty()) "No hay palabras prohibidas registradas." else "No se encontraron coincidencias.",
                        color = Color.Gray
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredWords, key = { it.id }) { word ->
                        BlockedWordItem(
                            blockedWord = word,
                            canEdit = viewModel.hasPermission("Moderación de palabras", "EDIT"),
                            canDelete = viewModel.hasPermission("Moderación de palabras", "DELETE"),
                            onEdit = { showDialog = word },
                            onDelete = { viewModel.deleteBlockedWord(context, word.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun BlockedWordItem(
    blockedWord: BlockedWord,
    canEdit: Boolean,
    canDelete: Boolean,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val sdf = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())
    val dateStr = sdf.format(Date(blockedWord.createdAt))

    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(text = blockedWord.word, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                Text(
                    text = if (blockedWord.isPartialMatch) "Coincidencia parcial" else "Palabra exacta",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(text = "Agregada el $dateStr", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
            }

            if (canEdit) {
                IconButton(onClick = onEdit) {
                    Icon(Icons.Default.Edit, contentDescription = "Editar", modifier = Modifier.size(20.dp))
                }
            }

            if (canDelete) {
                var showConfirm by remember { mutableStateOf(false) }
                IconButton(onClick = { showConfirm = true }) {
                    Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = Color.Red, modifier = Modifier.size(20.dp))
                }

                if (showConfirm) {
                    AlertDialog(
                        onDismissRequest = { showConfirm = false },
                        title = { Text("¿Eliminar palabra?") },
                        text = { Text("Se permitirá el uso de '${blockedWord.word}' nuevamente.") },
                        confirmButton = {
                            TextButton(onClick = {
                                onDelete()
                                showConfirm = false
                            }) { Text("Eliminar", color = Color.Red) }
                        },
                        dismissButton = {
                            TextButton(onClick = { showConfirm = false }) { Text("Cancelar") }
                        }
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WordEditorDialog(
    wordToEdit: BlockedWord?,
    onDismiss: () -> Unit,
    onSave: (String, Boolean) -> Unit
) {
    var word by remember { mutableStateOf(wordToEdit?.word ?: "") }
    var isPartial by remember { mutableStateOf(wordToEdit?.isPartialMatch ?: false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (wordToEdit == null) "Agregar Palabra" else "Editar Palabra") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = word,
                    onValueChange = { word = it },
                    label = { Text("Palabra o término") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(top = 8.dp)
                ) {
                    Checkbox(checked = isPartial, onCheckedChange = { isPartial = it })
                    Column(modifier = Modifier.padding(start = 8.dp)) {
                        Text(text = "Coincidencia parcial", style = MaterialTheme.typography.bodyMedium)
                        Text(
                            text = "Bloquea si la palabra está contenida dentro de otra.",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.Gray
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onSave(word, isPartial) },
                enabled = word.trim().isNotEmpty()
            ) { Text("Guardar") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancelar") }
        }
    )
}
