package com.example.ezzeta.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ezzeta.ui.components.UserAvatar
import com.example.ezzeta.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FollowingScreen(
    viewModel: MainViewModel, 
    onBack: () -> Unit,
    onNavigateToStore: (String) -> Unit,
    onNavigateToUser: (String) -> Unit
) {
    val context = LocalContext.current
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("Tiendas", "Usuarios")

    val followedStores by viewModel.followedStoresInfo.collectAsState()
    val followedUsers by viewModel.followedUsersInfo.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Siguiendo", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            TabRow(selectedTabIndex = selectedTab) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title) }
                    )
                }
            }

            if (selectedTab == 0) {
                // Tiendas
                if (followedStores.isEmpty()) {
                    EmptyFollowingState("Aún no sigues ninguna tienda oficial.")
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(followedStores, key = { it.id }) { store ->
                            FollowingItem(
                                imageUrl = store.logoUrl,
                                title = store.name,
                                subtitle = formatFollowers(store.followerCount),
                                onUnfollow = { viewModel.toggleFollowStore(context, store.id) },
                                onClick = { onNavigateToStore(store.id) }
                            )
                        }
                    }
                }
            } else {
                // Usuarios
                if (followedUsers.isEmpty()) {
                    EmptyFollowingState("Aún no sigues a ningún vendedor o usuario.")
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(followedUsers, key = { it.id }) { user ->
                            FollowingItem(
                                user = viewModel.getUserById(user.id), // Para UserAvatar
                                title = user.alias,
                                subtitle = formatFollowers(user.followerCount),
                                onUnfollow = { viewModel.toggleFollowUser(context, user.id) },
                                onClick = if (user.hasMarketplaceProducts) { 
                                    { onNavigateToUser(user.id) } 
                                } else null
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FollowingItem(
    imageUrl: String? = null,
    user: com.example.ezzeta.data.model.User? = null,
    title: String,
    subtitle: String,
    onUnfollow: () -> Unit,
    onClick: (() -> Unit)? = null
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (user != null) {
                UserAvatar(user = user, size = 50.dp)
            } else {
                AsyncImage(
                    model = imageUrl,
                    contentDescription = null,
                    modifier = Modifier.size(50.dp).clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
            }
            
            Column(modifier = Modifier.padding(start = 12.dp).weight(1f)) {
                Text(text = title, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium)
                Text(text = subtitle, style = MaterialTheme.typography.bodySmall, color = Color.Gray)
            }
            
            Button(
                onClick = onUnfollow,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant,
                    contentColor = MaterialTheme.colorScheme.onSurfaceVariant
                ),
                contentPadding = PaddingValues(horizontal = 12.dp),
                modifier = Modifier.height(36.dp)
            ) {
                Text("Dejar de seguir", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun EmptyFollowingState(message: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(text = message, color = Color.Gray, textAlign = TextAlign.Center, modifier = Modifier.padding(32.dp))
    }
}

private fun formatFollowers(count: Int): String {
    return if (count == 1) "1 seguidor" else "$count seguidores"
}
