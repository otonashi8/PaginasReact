package com.example.ezzeta.data.repository

import android.content.Context
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class UserFollow(
    val followerId: String,
    val sellerId: String, // Usado como targetId para compatibilidad con JSON existente
    val targetType: String = "SELLER" // "SELLER" o "STORE"
)

class FollowRepository {
    private val _follows = MutableStateFlow<List<UserFollow>>(emptyList())
    val follows: StateFlow<List<UserFollow>> = _follows.asStateFlow()

    private val FOLLOWS_FILE = "user_follows.json"

    fun init(context: Context) {
        val type = object : TypeToken<List<UserFollow>>() {}.type
        val loaded: List<UserFollow>? = LocalJsonStorage.loadFromFile(context, FOLLOWS_FILE, type)
        if (loaded != null) {
            _follows.value = loaded
        }
    }

    fun toggleFollow(context: Context, followerId: String, targetId: String, targetType: String): Boolean {
        if (followerId == targetId || followerId == "guest") return false

        val currentList = _follows.value.toMutableList()
        val existing = currentList.find { 
            it.followerId == followerId && it.sellerId == targetId && it.targetType == targetType 
        }
        
        val result = if (existing != null) {
            currentList.remove(existing)
            false
        } else {
            currentList.add(UserFollow(followerId, targetId, targetType))
            true
        }
        
        _follows.value = currentList
        LocalJsonStorage.saveToFile(context, FOLLOWS_FILE, currentList)
        return result
    }

    fun getFollowerCount(targetId: String, targetType: String): Int {
        return _follows.value.count { it.sellerId == targetId && it.targetType == targetType }
    }
    
    fun isFollowing(followerId: String, targetId: String, targetType: String): Boolean {
        if (followerId == "guest") return false
        return _follows.value.any { it.followerId == followerId && it.sellerId == targetId && it.targetType == targetType }
    }
}
