package com.example.ezzeta.data.repository

import android.content.Context
import com.example.ezzeta.data.model.User
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

object UserRepository {
    private const val PREFS_NAME = "ezzeta_user_prefs"
    private const val KEY_CURRENT_UUID = "current_user_uuid"
    private const val USERS_FILE = "users.json"
    
    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

    private val _allUsers = MutableStateFlow<List<User>>(emptyList())
    val allUsers: StateFlow<List<User>> = _allUsers.asStateFlow()

    fun getCurrentUserId(): String = _currentUser.value?.uuid ?: "guest"

    fun init(context: Context) {
        try {
            val rawData = LocalJsonStorage.loadRaw(context, USERS_FILE)
            
            var users: MutableList<User> = mutableListOf()
            
            if (rawData != null) {
                val trimmed = rawData.trim()
                if (trimmed.startsWith("[")) {
                    val listType = object : TypeToken<List<User>>() {}.type
                    val list: List<User>? = com.google.gson.Gson().fromJson(trimmed, listType)
                    if (list != null) users.addAll(list)
                } else if (trimmed.startsWith("{")) {
                    val singleType = object : TypeToken<User>() {}.type
                    val singleUser: User? = com.google.gson.Gson().fromJson(trimmed, singleType)
                    if (singleUser != null) users.add(singleUser)
                }
            }
            
            // Asegurar campos no nulos tras deserialización
            val fixedUsers = users.map { u ->
                u.copy(
                    addresses = u.addresses ?: emptyList(),
                    savedCards = u.savedCards ?: emptyList(),
                    followedStoreIds = u.followedStoreIds ?: emptySet()
                )
            }
            
            _allUsers.value = fixedUsers
            saveAllToLocal(context)

            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val currentUuid = prefs.getString(KEY_CURRENT_UUID, null)
            
            val user = _allUsers.value.find { it.uuid == currentUuid }
            if (user != null) {
                _currentUser.value = user
            } else {
                createDefaultUser(context)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            createDefaultUser(context)
        }
    }

    private fun createDefaultUser(context: Context) {
        val newUuid = UUID.randomUUID().toString()
        val newUser = User(uuid = newUuid, alias = "", isGuest = true)
        
        val currentList = _allUsers.value.toMutableList()
        currentList.add(newUser)
        _allUsers.value = currentList
        
        _currentUser.value = newUser
        saveSession(context, newUser)
        saveAllToLocal(context)
    }

    fun setUser(context: Context, alias: String, email: String? = null, isGuest: Boolean = true, isAdmin: Boolean = false) {
        val currentList = _allUsers.value.toMutableList()
        
        var user = if (email != null) currentList.find { it.email == email } else null
        
        if (user != null) {
            user = user.copy(alias = alias, isGuest = isGuest, isAdmin = isAdmin, isActive = true)
            val index = currentList.indexOfFirst { it.uuid == user?.uuid }
            if (index != -1) currentList[index] = user
        } else {
            val current = _currentUser.value
            if (current != null && current.isGuest && current.email == null) {
                user = current.copy(alias = alias, email = email, isGuest = isGuest, isAdmin = isAdmin)
                val index = currentList.indexOfFirst { it.uuid == current.uuid }
                if (index != -1) currentList[index] = user else currentList.add(user)
            } else {
                user = User(uuid = UUID.randomUUID().toString(), alias = alias, email = email, isGuest = isGuest, isAdmin = isAdmin)
                currentList.add(user)
            }
        }
        
        _allUsers.value = currentList
        _currentUser.value = user
        saveSession(context, user!!)
        saveAllToLocal(context)
    }

    fun logout(context: Context) {
        val newUuid = UUID.randomUUID().toString()
        val newGuest = User(uuid = newUuid, alias = "", isGuest = true)
        
        val currentList = _allUsers.value.toMutableList()
        currentList.add(newGuest)
        _allUsers.value = currentList
        
        _currentUser.value = newGuest
        saveSession(context, newGuest)
        saveAllToLocal(context)
    }

    fun updateAlias(context: Context, newAlias: String) {
        _currentUser.value?.let {
            val updated = it.copy(alias = newAlias)
            updateUser(context, updated)
        }
    }

    fun updateUser(context: Context, user: User) {
        val currentList = _allUsers.value.toMutableList()
        val index = currentList.indexOfFirst { it.uuid == user.uuid }
        if (index != -1) {
            currentList[index] = user
            _allUsers.value = currentList
            
            if (_currentUser.value?.uuid == user.uuid) {
                _currentUser.value = user
            }
            saveAllToLocal(context)
        }
    }

    private fun saveSession(context: Context, user: User) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().apply {
            putString(KEY_CURRENT_UUID, user.uuid)
            apply()
        }
    }

    private fun saveAllToLocal(context: Context) {
        LocalJsonStorage.saveToFile(context, USERS_FILE, _allUsers.value)
    }
    
    fun adminAddUser(context: Context, user: User) {
        val currentList = _allUsers.value.toMutableList()
        if (currentList.none { it.uuid == user.uuid || (it.email != null && it.email == user.email) }) {
            currentList.add(user)
            _allUsers.value = currentList
            saveAllToLocal(context)
        }
    }
}
