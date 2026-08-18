package com.example.ezzeta.data.repository

import android.content.Context
import com.example.ezzeta.data.model.*
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

class AbandonedCartRepository {
    private val _abandonedCarts = MutableStateFlow<List<AbandonedCart>>(emptyList())
    val abandonedCarts: StateFlow<List<AbandonedCart>> = _abandonedCarts.asStateFlow()

    private val FILE_NAME = "abandoned_carts.json"

    fun init(context: Context) {
        val type = object : TypeToken<List<AbandonedCart>>() {}.type
        val loaded: List<AbandonedCart>? = LocalJsonStorage.loadFromFile(context, FILE_NAME, type)
        if (loaded != null) {
            _abandonedCarts.value = loaded
        }
    }

    // Sincroniza el estado actual del carrito del usuario con una sesión de abandono. Si no existe una sesión ACTIVE para el usuario, crea una nueva. //
    fun syncCartSnapshot(context: Context, items: List<CartItem>, user: User?) {
        val currentCarts = _abandonedCarts.value.toMutableList()
        
        // Buscar sesión activa para este usuario (o sesión actual si es invitado)
        val activeSessionIndex = currentCarts.indexOfFirst { 
            it.status == AbandonedCartStatus.ACTIVE && 
            (it.userId == user?.uuid || (it.isGuest && it.userId == null && user?.isGuest == true))
        }

        val snapshotItems = items.map { item ->
            AbandonedCartItem(
                productId = item.product.id,
                productName = item.product.name,
                size = item.size,
                quantity = item.quantity,
                unitPrice = item.product.price,
                discount = if (item.product.oldPrice != null) (item.product.oldPrice - item.product.price) else 0.0,
                finalPrice = item.effectivePrice,
                storeId = item.product.storeId,
                sellerId = item.product.sellerId,
                imageUrl = item.product.imageUrl
            )
        }

        if (activeSessionIndex != -1) {
            val updated = currentCarts[activeSessionIndex].copy(
                items = snapshotItems,
                lastActivity = System.currentTimeMillis(),
                userEmail = user?.email,
                userName = user?.alias
            )
            currentCarts[activeSessionIndex] = updated
        } else if (snapshotItems.isNotEmpty()) {
            val newSession = AbandonedCart(
                id = UUID.randomUUID().toString(),
                userId = if (user?.isGuest == false) user.uuid else null,
                items = snapshotItems,
                status = AbandonedCartStatus.ACTIVE,
                userEmail = user?.email,
                userName = user?.alias,
                isGuest = user?.isGuest ?: true
            )
            currentCarts.add(newSession)
        }

        _abandonedCarts.value = currentCarts
        LocalJsonStorage.saveToFile(context, FILE_NAME, currentCarts)
    }

    // Marca productos específicos como comprados. Se llama durante el checkout.//
    fun markItemsAsPurchased(context: Context, purchasedItemKeys: List<String>, user: User?) {
        val currentCarts = _abandonedCarts.value.toMutableList()
        
        val activeSessionIndex = currentCarts.indexOfFirst { 
            it.status == AbandonedCartStatus.ACTIVE && 
            (it.userId == user?.uuid || (it.isGuest && it.userId == null && user?.isGuest == true))
        }

        if (activeSessionIndex != -1) {
            val session = currentCarts[activeSessionIndex]
            val itemsAfterPurchase = session.items.filter { item ->
                val key = "${item.productId}_${item.size}"
                !purchasedItemKeys.contains(key)
            }
            
            val newlyPurchased = session.items.filter { item ->
                val key = "${item.productId}_${item.size}"
                purchasedItemKeys.contains(key)
            }

            val updatedPurchasedList = session.purchasedItems + newlyPurchased
            
            val finalStatus = if (itemsAfterPurchase.isEmpty()) {
                AbandonedCartStatus.RECUPERADO
            } else {
                AbandonedCartStatus.ACTIVE
            }

            val updatedSession = session.copy(
                items = itemsAfterPurchase,
                purchasedItems = updatedPurchasedList,
                status = finalStatus,
                lastActivity = System.currentTimeMillis()
            )
            
            currentCarts[activeSessionIndex] = updatedSession
            _abandonedCarts.value = currentCarts
            LocalJsonStorage.saveToFile(context, FILE_NAME, currentCarts)
        }
    }
}
