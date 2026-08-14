package com.example.ezzeta.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.ezzeta.ui.screens.*
import com.example.ezzeta.ui.screens.admin.*
import com.example.ezzeta.ui.viewmodel.MainViewModel

@Composable
fun EzzetaNavGraph(navController: NavHostController, mainViewModel: MainViewModel) {
    val context = LocalContext.current
    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route
    ) {
        composable(Screen.Splash.route) { SplashScreen(navController, mainViewModel) }
        composable(Screen.Welcome.route) { WelcomeScreen(navController, mainViewModel) }
        composable(Screen.Login.route) { LoginScreen(navController, mainViewModel) }
        composable(Screen.Register.route) { RegisterScreen(navController, mainViewModel) }
        composable(Screen.Home.route) { 
            HomeScreen(
                viewModel = mainViewModel, 
                onProductClick = { productId -> 
                    navController.navigate(Screen.ProductDetail.createRoute(productId)) 
                },
                onStoreClick = { storeId ->
                    navController.navigate(Screen.StoreDetail.createRoute(storeId))
                },
                onWishlistClick = { navController.navigate(Screen.Wishlist.route) }
            ) 
        }
        composable(Screen.Categories.route) { 
            CategoriesScreen(
                viewModel = mainViewModel, 
                onProductClick = { productId -> 
                    navController.navigate(Screen.ProductDetail.createRoute(productId)) 
                },
                onWishlistClick = { navController.navigate(Screen.Wishlist.route) }
            ) 
        }
        composable(Screen.Marketplace.route) { 
            MarketplaceScreen(
                viewModel = mainViewModel, 
                onProductClick = { productId -> 
                    navController.navigate(Screen.ProductDetail.createRoute(productId)) 
                },
                onStoreClick = { storeId ->
                    navController.navigate(Screen.StoreDetail.createRoute(storeId))
                }
            ) 
        }
        composable(Screen.Cart.route) { 
            CartScreen(
                viewModel = mainViewModel,
                onNavigateToCategories = { 
                    navController.navigate(Screen.Categories.route) {
                        popUpTo(Screen.Home.route) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                onNavigateToCheckout = {
                    navController.navigate(Screen.Checkout.route)
                },
                onProductClick = { productId ->
                    navController.navigate(Screen.ProductDetail.createRoute(productId))
                }
            ) 
        }
        composable(Screen.Profile.route) { 
            ProfileScreen(
                viewModel = mainViewModel,
                onHistoryClick = { navController.navigate(Screen.History.route) },
                onOrdersClick = { navController.navigate(Screen.Orders.route) },
                onFollowingClick = { navController.navigate(Screen.Following.route) },
                onWishlistClick = { navController.navigate(Screen.Wishlist.route) },
                onCustomerServiceClick = { navController.navigate(Screen.CustomerService.route) },
                onSingleProductClick = { navController.navigate(Screen.SingleProductUpload.route) },
                onAddressBookClick = { navController.navigate(Screen.AddressBook.route) },
                onPaymentMethodsClick = { navController.navigate(Screen.PaymentMethods.route) },
                onLoginClick = { navController.navigate(Screen.Login.route) },
                onMyProductsClick = { navController.navigate(Screen.MyProducts.route) }
            ) 
        }

        composable(Screen.MyProducts.route) {
            MyProductsScreen(mainViewModel, onBack = { navController.popBackStack() })
        }
        
        composable(Screen.SingleProductUpload.route) {
            SingleProductUploadScreen(mainViewModel, onBack = { navController.popBackStack() })
        }
        
        composable(Screen.CustomerService.route) {
            CustomerServiceScreen(mainViewModel, onBack = { navController.popBackStack() })
        }

        composable(Screen.StoreDetail.route) { backStackEntry ->
            val storeId = backStackEntry.arguments?.getString("storeId")
            StoreDetailScreen(
                storeId = storeId,
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() },
                onProductClick = { productId ->
                    navController.navigate(Screen.ProductDetail.createRoute(productId))
                },
                onQuickViewClick = { product ->
                    mainViewModel.onQuickViewProduct(context, product)
                }
            )
        }
        composable(Screen.ProductDetail.route) { backStackEntry ->
            val productId = backStackEntry.arguments?.getString("productId")
            ProductDetailScreen(
                productId = productId, 
                viewModel = mainViewModel, 
                onBack = { navController.popBackStack() },
                onStoreClick = { storeId ->
                    navController.navigate(Screen.StoreDetail.createRoute(storeId))
                },
                onProductClick = { newProductId ->
                    navController.navigate(Screen.ProductDetail.createRoute(newProductId))
                }
            )
        }
        composable(Screen.History.route) {
            HistoryScreen(
                viewModel = mainViewModel, 
                onBack = { navController.popBackStack() }, 
                onProductClick = { productId -> 
                    navController.navigate(Screen.ProductDetail.createRoute(productId)) 
                }
            )
        }
        composable(Screen.Wishlist.route) {
            WishlistScreen(
                viewModel = mainViewModel, 
                onBack = { navController.popBackStack() }, 
                onProductClick = { productId -> 
                    navController.navigate(Screen.ProductDetail.createRoute(productId)) 
                }
            )
        }
        composable(Screen.Orders.route) {
            OrdersHistoryScreen(mainViewModel, onBack = { navController.popBackStack() })
        }
        composable(Screen.Following.route) {
            FollowingStoresScreen(mainViewModel, onBack = { navController.popBackStack() })
        }
        composable(Screen.Checkout.route) {
            CheckoutScreen(
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() },
                onOrderComplete = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                }
            )
        }
        composable(Screen.AddressBook.route) {
            AddressBookScreen(mainViewModel, onBack = { navController.popBackStack() })
        }

        composable(Screen.AdminDashboard.route) {
            AdminDashboardScreen(
                viewModel = mainViewModel,
                onLogout = {
                    mainViewModel.logout(context)
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onNavigateToProductManagement = { type: String ->
                    navController.navigate(Screen.AdminProductManagement.createRoute(type))
                },
                onNavigateToCategoryManagement = {
                    navController.navigate(Screen.AdminCategoryManagement.route)
                },
                onNavigateToSizeManagement = {
                    navController.navigate(Screen.AdminSizeManagement.route)
                },
                onNavigateToClientSizes = {
                    navController.navigate(Screen.AdminClientSizes.route)
                }
            )
        }

        composable(Screen.AdminProductManagement.route) { backStackEntry ->
            val type = backStackEntry.arguments?.getString("type") ?: "store"
            AdminProductManagementScreen(
                viewModel = mainViewModel,
                managementType = type,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.AdminCategoryManagement.route) {
            AdminCategoryManagementScreen(
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.AdminSizeManagement.route) {
            AdminSizeManagementScreen(
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.AdminClientSizes.route) {
            AdminClientSizesScreen(
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() }
            )
        }
    }
}
