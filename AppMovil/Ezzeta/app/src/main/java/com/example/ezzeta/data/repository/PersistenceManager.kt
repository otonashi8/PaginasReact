package com.example.ezzeta.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.example.ezzeta.data.model.*
import com.google.gson.reflect.TypeToken

object PersistenceManager {
    private const val PREFS_NAME = "ezzeta_persistence_prefs"
    private const val KEY_DARK_MODE = "dark_mode"
    private const val KEY_FAVORITES_PREFIX = "favorites_"
    
    private const val HISTORY_FILE_PREFIX = "history_"
    private const val CART_FILE_PREFIX = "cart_"
    private const val ORDERS_FILE_PREFIX = "orders_"
    private const val KEY_ADMIN_GROUP_PREFIX = "admin_group_"

    private var sharedPreferences: SharedPreferences? = null
    
    // Cache en memoria para conteos de wishlist para evitar lecturas de SharedPreferences
    private var wishlistCountsCache: Map<String, Int>? = null

    private fun getPrefs(context: Context): SharedPreferences {
        return sharedPreferences ?: synchronized(this) {
            sharedPreferences ?: context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).also {
                sharedPreferences = it
            }
        }
    }
    
    private fun getUserId() = UserRepository.getCurrentUserId()

    fun saveTheme(context: Context, isDark: Boolean) {
        getPrefs(context).edit().putBoolean(KEY_DARK_MODE, isDark).apply()
    }

    fun getTheme(context: Context): Boolean {
        return getPrefs(context).getBoolean(KEY_DARK_MODE, false)
    }

    fun saveFavorites(context: Context, favoriteIds: Set<String>) {
        getPrefs(context).edit().putStringSet(KEY_FAVORITES_PREFIX + getUserId(), favoriteIds).apply()
        // Invalidar cache tras guardar
        wishlistCountsCache = null
    }

    fun getFavorites(context: Context): Set<String> {
        return getPrefs(context).getStringSet(KEY_FAVORITES_PREFIX + getUserId(), emptySet()) ?: emptySet()
    }

    fun getAllWishlistCounts(context: Context): Map<String, Int> {
        wishlistCountsCache?.let { return it }
        
        val allEntries = getPrefs(context).all
        val counts = mutableMapOf<String, Int>()
        
        allEntries.filterKeys { it.startsWith(KEY_FAVORITES_PREFIX) }.forEach { (_, value) ->
            if (value is Set<*>) {
                value.filterIsInstance<String>().forEach { productId ->
                    counts[productId] = (counts[productId] ?: 0) + 1
                }
            }
        }
        wishlistCountsCache = counts
        return counts
    }

    fun saveHistory(context: Context, products: List<Product>) {
        LocalJsonStorage.saveToFile(context, "${HISTORY_FILE_PREFIX}${getUserId()}.json", products)
    }

    fun getHistory(context: Context): List<Product> {
        val type = object : TypeToken<List<Product>>() {}.type
        val loaded = LocalJsonStorage.loadFromFile(context, "${HISTORY_FILE_PREFIX}${getUserId()}.json", type) ?: emptyList<Product>()
        return loaded.filterNotNull().map { product ->
            product.copy(
                categoryIds = product.categoryIds ?: emptyList(),
                subCategoryIds = product.subCategoryIds ?: emptyList(),
                status = product.status ?: com.example.ezzeta.data.model.ProductStatus.APPROVED
            )
        }
    }

    fun getCart(context: Context): List<CartItem> {
        val type = object : TypeToken<List<CartItem>>() {}.type
        val loaded: List<CartItem>? = try { 
            LocalJsonStorage.loadFromFile(context, "${CART_FILE_PREFIX}${getUserId()}.json", type) 
        } catch (e: Exception) { null }
        
        if (loaded == null) return emptyList()
        
        return loaded.filterNotNull().mapNotNull { item ->
            try {
                val product = item.product ?: return@mapNotNull null
                // Asegurar que campos críticos del producto no sean nulos tras deserialización legacy
                val fixedProduct = product.copy(
                    categoryIds = product.categoryIds ?: emptyList(),
                    subCategoryIds = product.subCategoryIds ?: emptyList()
                )
                
                CartItem(
                    product = fixedProduct,
                    quantity = if (item.quantity <= 0) 1 else item.quantity,
                    size = item.size ?: "",
                    priceAtAddition = item.priceAtAddition,
                    isSelected = item.isSelected
                )
            } catch (e: Exception) { null }
        }
    }

    fun saveCart(context: Context, items: List<CartItem>) {
        LocalJsonStorage.saveToFile(context, "${CART_FILE_PREFIX}${getUserId()}.json", items)
    }

    fun saveOrders(context: Context, orders: List<Order>) {
        LocalJsonStorage.saveToFile(context, "orders.json", orders)
    }

    fun getOrders(context: Context): List<Order> {
        val type = object : TypeToken<List<Order>>() {}.type
        val loaded: List<Order>? = try { 
            LocalJsonStorage.loadFromFile(context, "orders.json", type) 
        } catch (e: Exception) { null }
        
        if (loaded == null) return emptyList()
        
        return loaded.filterNotNull().mapNotNull { order ->
            try {
                // Usar constructor para evitar fallos de copy con campos nulos de Gson
                Order(
                    id = order.id ?: "ORD-UNK",
                    date = order.date ?: "",
                    items = order.items ?: emptyList(),
                    total = order.total ?: 0.0,
                    buyerId = order.buyerId ?: "",
                    buyerName = order.buyerName ?: "",
                    buyerEmail = order.buyerEmail ?: "",
                    buyerPhone = order.buyerPhone ?: "",
                    shippingAddress = order.shippingAddress ?: "",
                    shippingDept = order.shippingDept ?: "",
                    shippingProv = order.shippingProv ?: "",
                    shippingDist = order.shippingDist ?: "",
                    status = order.status ?: OrderStatus.PAID,
                    orderStatus = order.orderStatus ?: "PROCESANDO"
                )
            } catch (e: Exception) { null }
        }
    }

    // organizar admin

    fun saveAdminGroupState(context: Context, groupKey: String, isExpanded: Boolean) {
        getPrefs(context).edit().putBoolean(KEY_ADMIN_GROUP_PREFIX + groupKey, isExpanded).apply()
    }

    fun getAdminGroupState(context: Context, groupKey: String): Boolean {
        return getPrefs(context).getBoolean(KEY_ADMIN_GROUP_PREFIX + groupKey, false)
    }

    fun clearUserData(context: Context, userId: String) {
        getPrefs(context).edit().remove(KEY_FAVORITES_PREFIX + userId).apply()
        
        val filesToDelete = listOf(
            "${HISTORY_FILE_PREFIX}${userId}.json",
            "${CART_FILE_PREFIX}${userId}.json"
        )
        
        filesToDelete.forEach { fileName ->
            val file = java.io.File(context.filesDir, fileName)
            if (file.exists()) {
                file.delete()
            }
        }
    }
}
