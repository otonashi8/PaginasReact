package com.example.ezzeta.ui.components

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.currentBackStackEntryAsState
import com.example.ezzeta.ui.navigation.Screen
import com.example.ezzeta.ui.navigation.bottomNavItems
import com.example.ezzeta.ui.viewmodel.MainViewModel

@Composable
fun EzzetaBottomBar(navController: NavHostController, viewModel: MainViewModel) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination
    val cartItemCount by viewModel.cartItemCount.collectAsState()

    NavigationBar {
        bottomNavItems.forEach { screen ->
            NavigationBarItem(
                icon = { 
                    BadgedBox(
                        badge = {
                            if (screen.route == Screen.Cart.route && cartItemCount > 0) {
                                Badge { Text(cartItemCount.toString()) }
                            }
                        }
                    ) {
                        screen.icon?.let { Icon(it, contentDescription = screen.title) }
                    }
                },
                label = { screen.title?.let { Text(it) } },
                selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true,
                onClick = {
                    navController.navigate(screen.route) {
                        popUpTo(navController.graph.findStartDestination().id) {
                            saveState = true
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        }
    }
}
