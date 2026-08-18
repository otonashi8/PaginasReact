package com.example.ezzeta.data.repository

import android.content.Context
import com.example.ezzeta.data.model.CustomerForm
import com.example.ezzeta.data.model.FormStatus
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

object CustomerFormRepository {
    private const val FILE_NAME = "customer_forms.json"
    private val _forms = MutableStateFlow<List<CustomerForm>>(emptyList())
    val forms: StateFlow<List<CustomerForm>> = _forms.asStateFlow()

    fun init(context: Context) {
        val type = object : TypeToken<List<CustomerForm>>() {}.type
        val loaded: List<CustomerForm>? = LocalJsonStorage.loadFromFile(context, FILE_NAME, type)
        if (loaded != null) {
            _forms.value = loaded
        }
    }

    fun addForm(context: Context, form: CustomerForm): Boolean {
        return try {
            val current = _forms.value.toMutableList()
            current.add(0, form)
            _forms.value = current
            LocalJsonStorage.saveToFile(context, FILE_NAME, current)
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    fun updateStatus(context: Context, formId: String, newStatus: FormStatus) {
        val current = _forms.value.toMutableList()
        val index = current.indexOfFirst { it.id == formId }
        if (index != -1) {
            current[index] = current[index].copy(status = newStatus)
            _forms.value = current
            LocalJsonStorage.saveToFile(context, FILE_NAME, current)
        }
    }

    fun deleteForm(context: Context, formId: String) {
        val current = _forms.value.toMutableList()
        if (current.removeIf { it.id == formId }) {
            _forms.value = current
            LocalJsonStorage.saveToFile(context, FILE_NAME, current)
        }
    }
}
