package com.example.ezzeta.data.repository

import android.content.Context
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class UserFollow(
    val followerId: String,
    val sellerId: String
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

    fun toggleFollow(context: Context, followerId: String, sellerId: String): Boolean {
        if (followerId == sellerId || followerId == "guest") return false

        val currentList = _follows.value.toMutableList()
        val existing = currentList.find { it.followerId == followerId && it.sellerId == sellerId }
        
        val result = if (existing != null) {
            currentList.remove(existing)
            false
        } else {
            currentList.add(UserFollow(followerId, sellerId))
            true
        }
        
        _follows.value = currentList
        LocalJsonStorage.saveToFile(context, FOLLOWS_FILE, currentList)
        return result
    }

    fun getFollowerCount(sellerId: String): Int {
        return _follows.value.count { it.sellerId == sellerId }
    }
    
    fun isFollowing(followerId: String, sellerId: String): Boolean {
        if (followerId == "guest") return false
        return _follows.value.any { it.followerId == followerId && it.sellerId == sellerId }
    }
}
