package com.example.ezzeta.data.repository

import android.content.Context
import com.example.ezzeta.data.model.SizeOption
import com.example.ezzeta.data.model.SizeSystem
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

class SizeRepository {
    private val GLOBAL_SIZES_FILE = "global_size_systems.json"
    private val USER_SIZES_FILE = "user_custom_sizes.json"

    private val _globalSystems = MutableStateFlow<List<SizeSystem>>(emptyList())
    val globalSystems: StateFlow<List<SizeSystem>> = _globalSystems.asStateFlow()

    private val _userCustomSizes = MutableStateFlow<List<SizeOption>>(emptyList())
    val allUserCustomSizes: StateFlow<List<SizeOption>> = _userCustomSizes.asStateFlow()

    fun init(context: Context) {
        val systemType = object : TypeToken<List<SizeSystem>>() {}.type
        val loadedSystems: List<SizeSystem>? = LocalJsonStorage.loadFromFile(context, GLOBAL_SIZES_FILE, systemType)
        
        if (loadedSystems != null) {
            _globalSystems.value = loadedSystems
        } else {
            // Seed "Talla prenda"
            val initialPredefinedSizes = listOf(
                "XS", "S", "M", "L", "XL", "XXL", "XXXL", 
                "2", "4", "6", "8", "10", "12", "14"
            ).map { name ->
                SizeOption(id = UUID.randomUUID().toString(), name = name, creatorName = "Sistema", isGlobal = true)
            }
            
            val defaultSystem = SizeSystem(
                id = "predefined_clothing",
                name = "Talla prenda",
                options = initialPredefinedSizes,
                isEditable = true
            )
            
            _globalSystems.value = listOf(defaultSystem)
            saveGlobal(context)
        }

        val userSizeType = object : TypeToken<List<SizeOption>>() {}.type
        val loadedUserSizes: List<SizeOption>? = LocalJsonStorage.loadFromFile(context, USER_SIZES_FILE, userSizeType)
        if (loadedUserSizes != null) {
            _userCustomSizes.value = loadedUserSizes
        }
    }

    private fun saveGlobal(context: Context) {
        LocalJsonStorage.saveToFile(context, GLOBAL_SIZES_FILE, _globalSystems.value)
    }

    private fun saveUserSizes(context: Context) {
        LocalJsonStorage.saveToFile(context, USER_SIZES_FILE, _userCustomSizes.value)
    }

    // admin tallas "globales"
    fun addSizeSystem(context: Context, name: String) {
        val newSystem = SizeSystem(id = UUID.randomUUID().toString(), name = name)
        _globalSystems.value = _globalSystems.value + newSystem
        saveGlobal(context)
    }

    fun deleteSizeSystem(context: Context, systemId: String) {
        _globalSystems.value = _globalSystems.value.filter { it.id != systemId }
        saveGlobal(context)
    }

    fun addSizeToGlobalSystem(context: Context, systemId: String, name: String) {
        val newOption = SizeOption(id = UUID.randomUUID().toString(), name = name, creatorName = "Admin", isGlobal = true)
        _globalSystems.value = _globalSystems.value.map { system ->
            if (system.id == systemId) system.copy(options = system.options + newOption) else system
        }
        saveGlobal(context)
    }

    fun removeSizeFromGlobalSystem(context: Context, systemId: String, optionId: String) {
        _globalSystems.value = _globalSystems.value.map { system ->
            if (system.id == systemId) system.copy(options = system.options.filter { it.id != optionId }) else system
        }
        saveGlobal(context)
    }

    // tallas personalizadas
    fun addUserCustomSize(context: Context, name: String, userId: String?, userName: String?) {
        val newOption = SizeOption(
            id = UUID.randomUUID().toString(),
            name = name,
            createdByUserId = userId,
            creatorName = userName,
            isGlobal = false
        )
        _userCustomSizes.value = _userCustomSizes.value + newOption
        saveUserSizes(context)
    }

    fun deleteUserCustomSize(context: Context, sizeId: String) {
        _userCustomSizes.value = _userCustomSizes.value.filter { it.id != sizeId }
        saveUserSizes(context)
    }
    
    fun updateClientSize(context: Context, updated: SizeOption) {
        _userCustomSizes.value = _userCustomSizes.value.map {
            if (it.id == updated.id) updated else it
        }
        saveUserSizes(context)
    }
}
