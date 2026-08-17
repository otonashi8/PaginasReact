package com.example.ezzeta

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.ezzeta.ui.components.EzzetaBottomBar
import com.example.ezzeta.ui.components.ProductQuickViewContent
import com.example.ezzeta.ui.navigation.EzzetaNavGraph
import com.example.ezzeta.ui.navigation.Screen
import com.example.ezzeta.ui.theme.EzzetaTheme
import com.example.ezzeta.ui.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {

    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        enableEdgeToEdge()
        setContent {
            val mainViewModel: MainViewModel = viewModel()

            LaunchedEffect(Unit) {
                mainViewModel.initUser(this@MainActivity)
            }
            
            val isDarkTheme by mainViewModel.isDarkTheme.collectAsState()
            val quickViewProduct by mainViewModel.quickViewProduct.collectAsState()
            val showOrderSuccess by mainViewModel.showOrderSuccessAlert.collectAsState()
            
            EzzetaTheme(darkTheme = isDarkTheme) {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route
                
                val sheetState = rememberModalBottomSheetState()

                quickViewProduct?.let { product ->
                    ModalBottomSheet(
                        onDismissRequest = { mainViewModel.onQuickViewProduct(this@MainActivity, null) },
                        sheetState = sheetState
                    ) {
                        ProductQuickViewContent(
                            product = product,
                            viewModel = mainViewModel,
                            onAddToCart = { size, quantity, price -> 
                                mainViewModel.addToCart(this@MainActivity, product, size, quantity, price) 
                            },
                            onToggleFavorite = { mainViewModel.toggleProductFavorite(this@MainActivity, product.id) },
                            onClose = { mainViewModel.onQuickViewProduct(this@MainActivity, null) }
                        )
                    }
                }

                val showBottomBar = currentRoute in listOf(
                    Screen.Home.route,
                    Screen.Categories.route,
                    Screen.Marketplace.route,
                    Screen.Cart.route,
                    Screen.Profile.route
                )

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        if (showBottomBar) {
                            EzzetaBottomBar(navController, mainViewModel)
                        }
                    }
                ) { innerPadding ->
                    Box(modifier = Modifier.padding(innerPadding).fillMaxSize()) {
                        EzzetaNavGraph(navController = navController, mainViewModel = mainViewModel)

                        AnimatedVisibility(
                            visible = showOrderSuccess,
                            enter = slideInVertically(initialOffsetY = { -it }) + fadeIn(),
                            exit = slideOutVertically(targetOffsetY = { -it }) + fadeOut(),
                            modifier = Modifier.zIndex(100f).align(Alignment.TopCenter)
                        ) {
                            OrderSuccessBanner(
                                onDismiss = { mainViewModel.dismissOrderSuccessAlert() },
                                onViewOrder = {
                                    mainViewModel.dismissOrderSuccessAlert()
                                    navController.navigate(Screen.Orders.route)
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun OrderSuccessBanner(onDismiss: () -> Unit, onViewOrder: () -> Unit) {
    Surface(
        modifier = Modifier
            .padding(16.dp)
            .fillMaxWidth()
            .statusBarsPadding(),
        color = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(16.dp),
        shadowElevation = 8.dp,
        tonalElevation = 4.dp
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = Color(0xFF2E7D32),
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "¡Pedido realizado!",
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = "Tu compra se ha procesado con éxito.",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(onClick = onDismiss) {
                    Text("Continuar", color = Color.Gray)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = onViewOrder,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Ver Pedido")
                }
            }
        }
    }
}
