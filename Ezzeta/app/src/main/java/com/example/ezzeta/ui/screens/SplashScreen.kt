package com.example.ezzeta.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.example.ezzeta.ui.navigation.Screen
import com.example.ezzeta.ui.viewmodel.MainViewModel
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(navController: NavHostController, viewModel: MainViewModel) {
    val user by viewModel.currentUser.collectAsState()

    LaunchedEffect(user) {
        // Garantizamos al menos 2 segundos de splash
        delay(2000)
        
        // Navegación segura basada en el estado del usuario
        val currentUser = user
        if (currentUser != null && currentUser.alias.isNotEmpty()) {
            navController.navigate(Screen.Home.route) {
                popUpTo(Screen.Splash.route) { inclusive = true }
            }
        } else {
            // Si el usuario es nulo o no tiene alias, vamos a Welcome
            navController.navigate(Screen.Welcome.route) {
                popUpTo(Screen.Splash.route) { inclusive = true }
            }
        }
    }
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.primary
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                text = "EZZETA",
                color = MaterialTheme.colorScheme.onPrimary,
                fontSize = 48.sp,
                fontWeight = FontWeight.Black
            )
        }
    }
}
