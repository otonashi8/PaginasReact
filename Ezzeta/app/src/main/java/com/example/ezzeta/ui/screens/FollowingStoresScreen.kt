package com.example.ezzeta.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ezzeta.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FollowingStoresScreen(viewModel: MainViewModel, onBack: () -> Unit) {
    val context = LocalContext.current
    val allFollows by viewModel.userFollows.collectAsState()
    val allStores = remember { viewModel.getStores() }
    val followedStores = remember(allFollows) {
        allStores.filter { viewModel.isFollowingStore(it.id) }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Siguiendo", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
                    }
                }
            )
        }
    ) { padding ->
        if (followedStores.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Aún no sigues ninguna tienda")
            }
        } else {
            LazyColumn(
                modifier = Modifier.padding(padding).fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(followedStores) { store ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            AsyncImage(
                                model = store.logoUrl,
                                contentDescription = null,
                                modifier = Modifier.size(50.dp).clip(CircleShape),
                                contentScale = ContentScale.Crop
                            )
                            Column(modifier = Modifier.padding(start = 12.dp).weight(1f)) {
                                Text(text = store.name, fontWeight = FontWeight.Bold)
                                val count = remember(allFollows) { viewModel.getStoreFollowerCount(store.id) }
                                Text(text = "$count seguidores", style = MaterialTheme.typography.labelSmall)
                            }
                            Button(
                                onClick = { viewModel.toggleFollowStore(context, store.id) },
                                shape = RoundedCornerShape(20.dp)
                            ) {
                                Text("Dejar de seguir", fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
