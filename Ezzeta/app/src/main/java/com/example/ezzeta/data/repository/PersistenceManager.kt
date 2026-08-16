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

    private var sharedPreferences: SharedPreferences? = null

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
    }

    fun getFavorites(context: Context): Set<String> {
        return getPrefs(context).getStringSet(KEY_FAVORITES_PREFIX + getUserId(), emptySet()) ?: emptySet()
    }

    fun saveHistory(context: Context, products: List<Product>) {
        LocalJsonStorage.saveToFile(context, "${HISTORY_FILE_PREFIX}${getUserId()}.json", products)
    }

    fun getHistory(context: Context): List<Product> {
        val type = object : TypeToken<List<Product>>() {}.type
        return LocalJsonStorage.loadFromFile(context, "${HISTORY_FILE_PREFIX}${getUserId()}.json", type) ?: emptyList()
    }

    fun getCart(context: Context): List<CartItem> {
        val type = object : TypeToken<List<CartItem>>() {}.type
        val loaded: List<CartItem>? = try { 
            LocalJsonStorage.loadFromFile(context, "${CART_FILE_PREFIX}${getUserId()}.json", type) 
        } catch (e: Exception) { null }
        
        if (loaded == null) return emptyList()
        
        return loaded.filterNotNull().mapNotNull { item ->
            try {
                // Usar constructor para evitar fallos de copy con campos nulos de Gson
                CartItem(
                    product = item.product ?: return@mapNotNull null,
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
}
