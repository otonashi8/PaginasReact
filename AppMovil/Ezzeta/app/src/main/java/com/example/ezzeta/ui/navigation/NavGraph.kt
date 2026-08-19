package com.example.ezzeta.ui.navigation

import android.widget.Toast
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.ezzeta.ui.screens.*
import com.example.ezzeta.ui.screens.admin.*
import com.example.ezzeta.ui.viewmodel.MainViewModel

@Composable
fun AdminRouteGuard(
    viewModel: MainViewModel,
    module: String,
    action: String = "VIEW",
    onUnauthorized: () -> Unit,
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    val hasPermission = viewModel.hasPermission(module, action)
    
    if (hasPermission) {
        content()
    } else {
        LaunchedEffect(Unit) {
            Toast.makeText(context, "No tienes permiso para acceder a este módulo", Toast.LENGTH_SHORT).show()
            onUnauthorized()
        }
    }
}

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
                },
                onWishlistClick = { navController.navigate(Screen.Wishlist.route) }
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
                onMySizesClick = { navController.navigate(Screen.MySizes.route) },
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
                onManageAccountClick = { navController.navigate(Screen.ManageAccount.route) },
                onMyProductsClick = { navController.navigate(Screen.MyProducts.route) },
                onMySalesClick = { navController.navigate(Screen.MySales.route) }
            ) 
        }

        composable(Screen.ManageAccount.route) {
            ManageAccountScreen(
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() },
                onAccountDeleted = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
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
            FollowingScreen(
                viewModel = mainViewModel, 
                onBack = { navController.popBackStack() },
                onNavigateToStore = { storeId ->
                    navController.navigate(Screen.StoreDetail.createRoute(storeId))
                },
                onNavigateToUser = { userId ->
                    navController.navigate(Screen.SellerCatalog.createRoute(userId))
                }
            )
        }
        composable(Screen.MySizes.route) {
            MySizesScreen(mainViewModel, onBack = { navController.popBackStack() })
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
        composable(Screen.PaymentMethods.route) {
            PaymentMethodsScreen(mainViewModel, onBack = { navController.popBackStack() })
        }

        composable(Screen.AdminDashboard.route) {
            AdminRouteGuard(
                viewModel = mainViewModel,
                module = "Dashboard", // El dashboard base se permite a todos los que puedan entrar al panel
                onUnauthorized = { navController.popBackStack() }
            ) {
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
                    },
                    onNavigateToAdminUsers = {
                        navController.navigate(Screen.AdminUsers.route)
                    },
                    onNavigateToAdminRoles = {
                        navController.navigate(Screen.AdminRoles.route)
                    },
                    onNavigateToAdminForms = {
                        navController.navigate(Screen.AdminForms.route)
                    },
                    onNavigateToWordModeration = {
                        navController.navigate(Screen.AdminWordModeration.route)
                    },
                    onNavigateToReports = {
                        navController.navigate(Screen.AdminReports.route)
                    },
                    onNavigateToBanners = {
                        navController.navigate(Screen.AdminBanners.route)
                    },
                    onNavigateToPopups = {
                        navController.navigate(Screen.AdminPopups.route)
                    }
                )
            }
        }

        composable(Screen.AdminProductManagement.route) { backStackEntry ->
            val type = backStackEntry.arguments?.getString("type") ?: "store"
            val module = if (type == "client") "Productos Clientes" else "Productos Tienda"
            AdminRouteGuard(
                viewModel = mainViewModel,
                module = module,
                onUnauthorized = { navController.popBackStack() }
            ) {
                AdminProductManagementScreen(
                    viewModel = mainViewModel,
                    managementType = type,
                    onBack = { navController.popBackStack() },
                    onAddProduct = {
                        navController.navigate(Screen.AdminProductEdit.createRoute("new"))
                    },
                    onEditProduct = { productId ->
                        if (type == "client") {
                            navController.navigate(Screen.AdminCustomerProductEdit.createRoute(productId))
                        } else {
                            navController.navigate(Screen.AdminProductEdit.createRoute(productId))
                        }
                    }
                )
            }
        }

        composable(Screen.AdminProductEdit.route) { backStackEntry ->
            val productId = backStackEntry.arguments?.getString("productId")
            // Asumimos que si llegó aquí es porque tiene permiso de VIEW en el módulo padre
            AdminStoreProductEditScreen(
                viewModel = mainViewModel,
                productId = if (productId == "new") null else productId,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.AdminCustomerProductEdit.route) { backStackEntry ->
            val productId = backStackEntry.arguments?.getString("productId")
            AdminCustomerProductEditScreen(
                viewModel = mainViewModel,
                productId = productId,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.AdminCategoryManagement.route) {
            AdminRouteGuard(viewModel = mainViewModel, module = "Categorías", onUnauthorized = { navController.popBackStack() }) {
                AdminCategoryManagementScreen(
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }

        composable(Screen.AdminSizeManagement.route) {
            AdminRouteGuard(viewModel = mainViewModel, module = "Tallas", onUnauthorized = { navController.popBackStack() }) {
                AdminSizeManagementScreen(
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }

        composable(Screen.AdminClientSizes.route) {
            AdminRouteGuard(viewModel = mainViewModel, module = "Tallas Clientes", onUnauthorized = { navController.popBackStack() }) {
                AdminClientSizesScreen(
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }

        composable(Screen.AdminShipping.route) {
            AdminRouteGuard(viewModel = mainViewModel, module = "Envíos", onUnauthorized = { navController.popBackStack() }) {
                AdminShippingManagementScreen(
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }

        composable(Screen.AdminPriceRules.route) {
            AdminRouteGuard(viewModel = mainViewModel, module = "Reglas de Precios", onUnauthorized = { navController.popBackStack() }) {
                AdminPriceRulesScreen(
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }

        composable(Screen.AdminStats.route) {
            AdminRouteGuard(viewModel = mainViewModel, module = "Estadísticas", onUnauthorized = { navController.popBackStack() }) {
                AdminStatsScreen(
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() },
                    onNavigateToProduct = { productId ->
                        navController.navigate(Screen.ProductDetail.createRoute(productId))
                    }
                )
            }
        }

        composable(Screen.AdminCustomers.route) {
            AdminRouteGuard(viewModel = mainViewModel, module = "Clientes", onUnauthorized = { navController.popBackStack() }) {
                AdminCustomersScreen(
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }

        composable(Screen.AdminAbandonedCarts.route) {
            AdminRouteGuard(viewModel = mainViewModel, module = "Carritos Abandonados", onUnauthorized = { navController.popBackStack() }) {
                AdminAbandonedCartsScreen(
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }

        composable(Screen.AdminMarketplaceRequests.route) {
            AdminRouteGuard(viewModel = mainViewModel, module = "Marketplace", onUnauthorized = { navController.popBackStack() }) {
                AdminMarketplaceRequestsScreen(
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() },
                    onNavigateToDetail = { requestId ->
                        navController.navigate(Screen.AdminMarketplaceRequestDetail.createRoute(requestId))
                    }
                )
            }
        }

        composable(Screen.AdminMarketplaceRequestDetail.route) { backStackEntry ->
            val requestId = backStackEntry.arguments?.getString("requestId") ?: ""
            AdminMarketplaceRequestDetailScreen(
                requestId = requestId,
                viewModel = mainViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.AdminUsers.route) {
            AdminRouteGuard(viewModel = mainViewModel, module = "Sistema", onUnauthorized = { navController.popBackStack() }) {
                AdminUserManagementScreen(
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }

        composable(Screen.AdminRoles.route) {
            AdminRouteGuard(viewModel = mainViewModel, module = "Sistema", onUnauthorized = { navController.popBackStack() }) {
                AdminRoleManagementScreen(
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }

        composable(Screen.AdminForms.route) {
            AdminRouteGuard(viewModel = mainViewModel, module = "Formularios", onUnauthorized = { navController.popBackStack() }) {
                AdminFormsScreen(
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }

        composable(Screen.AdminWordModeration.route) {
            AdminRouteGuard(viewModel = mainViewModel, module = "Moderación de palabras", onUnauthorized = { navController.popBackStack() }) {
                AdminWordModerationScreen(
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }

        composable(Screen.AdminReports.route) {
            AdminRouteGuard(viewModel = mainViewModel, module = "Reportes", onUnauthorized = { navController.popBackStack() }) {
                AdminReportsScreen(
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }

        composable(Screen.AdminBanners.route) {
            AdminRouteGuard(viewModel = mainViewModel, module = "Banners", onUnauthorized = { navController.popBackStack() }) {
                AdminBannerManagementScreen(
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }

        composable(Screen.AdminPopups.route) {
            AdminRouteGuard(viewModel = mainViewModel, module = "Pop-ups", onUnauthorized = { navController.popBackStack() }) {
                AdminPopupManagementScreen(
                    viewModel = mainViewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}
