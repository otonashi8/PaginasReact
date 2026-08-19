package com.example.ezzeta.data.repository

import android.content.Context
import com.example.ezzeta.data.model.AdminPermission
import com.example.ezzeta.data.model.AdminRole
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

object AdminRoleRepository {
    private const val ROLES_FILE = "admin_roles.json"
    private val _roles = MutableStateFlow<List<AdminRole>>(emptyList())
    val roles: StateFlow<List<AdminRole>> = _roles.asStateFlow()

    fun init(context: Context) {
        val type = object : TypeToken<List<AdminRole>>() {}.type
        val savedRoles: List<AdminRole>? = LocalJsonStorage.loadFromFile(context, ROLES_FILE, type)
        
        if (savedRoles.isNullOrEmpty()) {
            createDefaultRoles(context)
        } else {
            _roles.value = savedRoles
            // Asegurar que Super Admin exista y tenga todo activado
            ensureSuperAdmin(context)
        }
    }

    private fun createDefaultRoles(context: Context) {
        val modules = listOf(
            "Dashboard", "Productos Tienda", "Productos Clientes", "Marketplace", "Clientes",
            "Pedidos", "Reglas de Precios", "Estadísticas", "Carritos Abandonados",
            "Categorías", "Tallas", "Tallas Clientes", "Envíos", "Sistema", "Formularios",
            "Moderación de palabras", "Reportes", "Banners", "Pop-ups"
        )
        
        val superAdminPermissions = modules.associateWith { 
            AdminPermission(view = true, create = true, edit = true, delete = true)
        }
        
        val superAdmin = AdminRole(
            id = "super_admin",
            name = "Super Admin",
            permissions = superAdminPermissions,
            isProtected = true
        )
        
        _roles.value = listOf(superAdmin)
        saveAll(context)
    }

    private fun ensureSuperAdmin(context: Context) {
        val currentRoles = _roles.value.toMutableList()
        val index = currentRoles.indexOfFirst { it.id == "super_admin" }
        
        val modules = listOf(
            "Dashboard", "Productos Tienda", "Productos Clientes", "Marketplace", "Clientes",
            "Pedidos", "Reglas de Precios", "Estadísticas", "Carritos Abandonados",
            "Categorías", "Tallas", "Tallas Clientes", "Envíos", "Sistema", "Formularios",
            "Moderación de palabras", "Reportes", "Banners", "Pop-ups"
        )
        val fullPermissions = modules.associateWith { 
            AdminPermission(view = true, create = true, edit = true, delete = true)
        }

        if (index != -1) {
            currentRoles[index] = currentRoles[index].copy(
                permissions = fullPermissions,
                isProtected = true
            )
        } else {
            currentRoles.add(AdminRole("super_admin", "Super Admin", fullPermissions, true))
        }
        _roles.value = currentRoles
        saveAll(context)
    }

    fun saveRole(context: Context, role: AdminRole) {
        val current = _roles.value.toMutableList()
        val index = current.indexOfFirst { it.id == role.id }
        if (index != -1) {
            if (current[index].isProtected && role.id == "super_admin") {
                // No permitir quitar permisos al super admin real
                return
            }
            current[index] = role
        } else {
            current.add(role)
        }
        _roles.value = current
        saveAll(context)
    }

    fun deleteRole(context: Context, roleId: String) {
        val role = _roles.value.find { it.id == roleId }
        if (role?.isProtected == true) return
        
        _roles.value = _roles.value.filter { it.id != roleId }
        saveAll(context)
    }

    private fun saveAll(context: Context) {
        LocalJsonStorage.saveToFile(context, ROLES_FILE, _roles.value)
    }
}
