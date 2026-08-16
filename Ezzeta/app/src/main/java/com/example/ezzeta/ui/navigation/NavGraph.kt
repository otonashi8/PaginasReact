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
                onLogout = {
                    mainViewModel.logout(context)
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onMyProductsClick = { navController.navigate(Screen.MyProducts.route) },
                onMySalesClick = { navController.navigate(Screen.MySales.route) }
            ) 
        }

        composable(Screen.MyProducts.route) {
            MyProductsScreen(
                viewModel = mainViewModel, 
                onBack = { navController.popBackStack() },
                onEditProduct = { productId ->
                    navController.navigate(Screen.MyProductEdit.createRoute(productId))
                }
            )
        }

        composable(Screen.MyProductEdit.route) { backStackEntry ->
            val productId = backStackEntry.arguments?.getString("productId") ?: ""
            MyProductEditScreen(
                productId = productId,
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.MySales.route) {
            MySalesScreen(
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() },
                onNavigateToDetail = { orderId, productId ->
                    navController.navigate(Screen.MySaleDetail.createRoute(orderId, productId))
                }
            )
        }

        composable(Screen.MySaleDetail.route) { backStackEntry ->
            val orderId = backStackEntry.arguments?.getString("orderId") ?: ""
            val productId = backStackEntry.arguments?.getString("productId") ?: ""
            MySaleDetailScreen(
                orderId = orderId,
                productId = productId,
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() }
            )
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
                },
                onSellerClick = { sellerId ->
                    navController.navigate(Screen.SellerCatalog.createRoute(sellerId))
                }
            )
        }

        composable(Screen.SellerCatalog.route) { backStackEntry ->
            val sellerId = backStackEntry.arguments?.getString("sellerId")
            SellerCatalogScreen(
                sellerId = sellerId,
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() },
                onProductClick = { productId ->
                    navController.navigate(Screen.ProductDetail.createRoute(productId))
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
                        popUpTo(navController.graph.startDestinationId) {
                            inclusive = true
                        }
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
                    navController.navigate(Screen.Login.route) {
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
                },
                onNavigateToMarketplaceRequests = {
                    navController.navigate(Screen.AdminMarketplaceRequests.route)
                },
                onNavigateToShippingManagement = {
                    navController.navigate(Screen.AdminShipping.route)
                },
                onNavigateToPriceRules = {
                    navController.navigate(Screen.AdminPriceRules.route)
                },
                onNavigateToStats = {
                    navController.navigate(Screen.AdminStats.route)
                },
                onNavigateToCustomers = {
                    navController.navigate(Screen.AdminCustomers.route)
                },
                onNavigateToAbandonedCarts = {
                    navController.navigate(Screen.AdminAbandonedCarts.route)
                }
            )
        }

        composable(Screen.AdminProductManagement.route) { backStackEntry ->
            val type = backStackEntry.arguments?.getString("type") ?: "store"
            AdminProductManagementScreen(
                viewModel = mainViewModel,
                managementType = type,
                onBack = { navController.popBackStack() },
                onAddProduct = {
                    navController.navigate(Screen.AdminProductEdit.createRoute("new"))
                },
                onEditProduct = { productId ->
                    navController.navigate(Screen.AdminProductEdit.createRoute(productId))
                }
            )
        }

        composable(Screen.AdminProductEdit.route) { backStackEntry ->
            val productId = backStackEntry.arguments?.getString("productId")
            AdminStoreProductEditScreen(
                viewModel = mainViewModel,
                productId = if (productId == "new") null else productId,
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

        composable(Screen.AdminShipping.route) {
            AdminShippingManagementScreen(
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.AdminPriceRules.route) {
            AdminPriceRulesScreen(
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.AdminStats.route) {
            AdminStatsScreen(
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() },
                onNavigateToProduct = { productId ->
                    navController.navigate(Screen.ProductDetail.createRoute(productId))
                }
            )
        }

        composable(Screen.AdminCustomers.route) {
            AdminCustomersScreen(
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.AdminAbandonedCarts.route) {
            AdminAbandonedCartsScreen(
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.AdminMarketplaceRequests.route) {
            AdminMarketplaceRequestsScreen(
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() },
                onNavigateToDetail = { requestId ->
                    navController.navigate(Screen.AdminMarketplaceRequestDetail.createRoute(requestId))
                }
            )
        }

        composable(Screen.AdminMarketplaceRequestDetail.route) { backStackEntry ->
            val requestId = backStackEntry.arguments?.getString("requestId") ?: ""
            AdminMarketplaceRequestDetailScreen(
                requestId = requestId,
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() }
            )
        }
    }
}
