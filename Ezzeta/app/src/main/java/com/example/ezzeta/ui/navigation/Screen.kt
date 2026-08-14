package com.example.ezzeta.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String? = null, val icon: ImageVector? = null) {
    object Splash : Screen("splash")
    object Welcome : Screen("welcome")
    object Login : Screen("login")
    object Register : Screen("register")
    
    // Bottom Nav Screens
    object Home : Screen("home", "Inicio", Icons.Default.Home)
    object Categories : Screen("categories", "Categorías", Icons.Default.Category)
    object Marketplace : Screen("marketplace", "Marketplace", Icons.Default.Storefront)
    object Cart : Screen("cart", "Cesta", Icons.Default.ShoppingCart)
    object Profile : Screen("profile", "Perfil", Icons.Default.Person)
    
    // Additional Screens
    object EntrepreneurshipForm : Screen("entrepreneurship_form")
    object ProductDetail : Screen("product_detail/{productId}") {
        fun createRoute(productId: String) = "product_detail/$productId"
    }
    object StoreDetail : Screen("store_detail/{storeId}") {
        fun createRoute(storeId: String) = "store_detail/$storeId"
    }
    object History : Screen("history")
    object Wishlist : Screen("wishlist")
    object Orders : Screen("orders")
    object Following : Screen("following")
    object CustomerService : Screen("customer_service")
    object SingleProductUpload : Screen("single_product_upload")
    object Checkout : Screen("checkout")
    object AddressBook : Screen("address_book")
    object PaymentMethods : Screen("payment_methods")
    object MyProducts : Screen("my_products")
    
    // Admin Screens
    object AdminDashboard : Screen("admin_dashboard")
    object AdminProductManagement : Screen("admin_product_management/{type}") {
        fun createRoute(type: String) = "admin_product_management/$type"
    }
    object AdminCategoryManagement : Screen("admin_category_management")
    object AdminSizeManagement : Screen("admin_size_management")
    object AdminClientSizes : Screen("admin_client_sizes")
}

val bottomNavItems = listOf(
    Screen.Home,
    Screen.Categories,
    Screen.Marketplace,
    Screen.Cart,
    Screen.Profile
)
