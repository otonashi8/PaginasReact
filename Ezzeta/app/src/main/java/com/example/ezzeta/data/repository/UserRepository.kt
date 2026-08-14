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
    private const val KEY_UUID = "user_uuid"
    private const val KEY_ALIAS = "user_alias"
    private const val USERS_FILE = "users.json"
    
    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

    fun getCurrentUserId(): String = _currentUser.value?.uuid ?: "guest"

    fun init(context: Context) {
        try {
            val type = object : TypeToken<User>() {}.type
            val loaded: User? = LocalJsonStorage.loadFromFile(context, USERS_FILE, type)
            
            if (loaded != null) {
                // Asegurar que campos no nulos realmente no lo sean tras deserialización (Gson bypasses null safety)
                val fixedUser = loaded.copy(
                    addresses = loaded.addresses ?: emptyList(),
                    savedCards = loaded.savedCards ?: emptyList(),
                    followedStoreIds = loaded.followedStoreIds ?: emptySet()
                )
                _currentUser.value = fixedUser
            } else {
                // Legacy support: check SharedPreferences
                val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                val uuid = prefs.getString(KEY_UUID, null)
                
                if (uuid != null) {
                    val alias = prefs.getString(KEY_ALIAS, "") ?: ""
                    val user = User(uuid = uuid, alias = alias)
                    _currentUser.value = user
                    saveToLocal(context, user)
                } else {
                    createDefaultUser(context)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            createDefaultUser(context)
        }
    }

    private fun createDefaultUser(context: Context) {
        val newUuid = UUID.randomUUID().toString()
        val newUser = User(uuid = newUuid, alias = "")
        _currentUser.value = newUser
        saveToLocal(context, newUser)
    }

    fun setUser(context: Context, alias: String, email: String? = null, isGuest: Boolean = true, isAdmin: Boolean = false) {
        val current = _currentUser.value ?: User(uuid = UUID.randomUUID().toString(), alias = alias)
        val updated = current.copy(
            alias = alias,
            email = email,
            isGuest = isGuest,
            isAdmin = isAdmin
        )
        _currentUser.value = updated
        saveToLocal(context, updated)
    }

    fun logout(context: Context) {
        // Al cerrar sesión, lo convertimos en un nuevo invitado con UUID fresco
        val newGuest = User(uuid = UUID.randomUUID().toString(), alias = "")
        _currentUser.value = newGuest
        saveToLocal(context, newGuest)
    }

    fun updateAlias(context: Context, newAlias: String) {
        _currentUser.value?.let {
            val updated = it.copy(alias = newAlias)
            _currentUser.value = updated
            saveToLocal(context, updated)
        }
    }

    fun updateUser(context: Context, user: User) {
        _currentUser.value = user
        saveToLocal(context, user)
    }

    private fun saveToLocal(context: Context, user: User) {
        LocalJsonStorage.saveToFile(context, USERS_FILE, user)
        
        // Keep Prefs in sync for simple things
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().apply {
            putString(KEY_UUID, user.uuid)
            putString(KEY_ALIAS, user.alias)
            apply()
        }
    }
}
