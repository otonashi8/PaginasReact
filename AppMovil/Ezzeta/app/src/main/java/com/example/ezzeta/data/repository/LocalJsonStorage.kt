package com.example.ezzeta.data.repository

import android.content.Context
import com.google.gson.Gson
import java.io.File
import java.lang.reflect.Type

object LocalJsonStorage {
    private val gson = Gson()

    fun <T> saveToFile(context: Context, fileName: String, data: T) {
        try {
            val file = File(context.filesDir, fileName)
            file.bufferedWriter().use { writer ->
                gson.toJson(data, writer)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun <T> loadFromFile(context: Context, fileName: String, type: Type): T? {
        val file = File(context.filesDir, fileName)
        if (!file.exists()) return null
        
        return try {
            file.bufferedReader().use { reader ->
                gson.fromJson(reader, type)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    fun loadRaw(context: Context, fileName: String): String? {
        val file = File(context.filesDir, fileName)
        if (!file.exists()) return null
        return try {
            file.readText()
        } catch (e: Exception) {
            null
        }
    }
}
