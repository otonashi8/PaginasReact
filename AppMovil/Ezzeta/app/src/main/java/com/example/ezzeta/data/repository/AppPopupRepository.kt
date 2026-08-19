package com.example.ezzeta.data.repository

import android.content.Context
import android.net.Uri
import com.example.ezzeta.data.model.AppPopup
import com.example.ezzeta.data.model.PopupContentType
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.File
import java.io.FileOutputStream

object AppPopupRepository {
    private const val POPUPS_FILE = "app_popups.json"
    private val _popups = MutableStateFlow<List<AppPopup>>(emptyList())
    val popups: StateFlow<List<AppPopup>> = _popups.asStateFlow()

    fun init(context: Context) {
        val type = object : TypeToken<List<AppPopup>>() {}.type
        val saved: List<AppPopup>? = LocalJsonStorage.loadFromFile(context, POPUPS_FILE, type)
        _popups.value = saved?.sortedBy { it.order } ?: emptyList()
    }

    fun savePopup(context: Context, popup: AppPopup) {
        val current = _popups.value.toMutableList()
        val index = current.indexOfFirst { it.id == popup.id }
        if (index != -1) {
            current[index] = popup
        } else {
            current.add(popup)
        }
        _popups.value = current.sortedBy { it.order }
        saveAll(context)
    }

    fun deletePopup(context: Context, popupId: String) {
        val popup = _popups.value.find { it.id == popupId }
        if (popup != null) {
            // Eliminar archivo físico si es local
            if (!popup.mediaPath.startsWith("http")) {
                val file = File(popup.mediaPath)
                if (file.exists()) {
                    // Verificar que no sea usado por otros popups
                    val isUsedByOthers = _popups.value.any { it.id != popupId && it.mediaPath == popup.mediaPath }
                    if (!isUsedByOthers) {
                        file.delete()
                    }
                }
            }
        }
        _popups.value = _popups.value.filter { it.id != popupId }
        saveAll(context)
    }

    fun saveMedia(context: Context, uri: Uri, popupId: String, type: PopupContentType): String? {
        return try {
            val inputStream = context.contentResolver.openInputStream(uri) ?: return null
            val directory = File(context.filesDir, "popups")
            if (!directory.exists()) directory.mkdirs()

            val extension = if (type == PopupContentType.VIDEO) "mp4" else "jpg"
            val fileName = "popup_${popupId}_${System.currentTimeMillis()}.$extension"
            val file = File(directory, fileName)
            
            FileOutputStream(file).use { outputStream ->
                inputStream.copyTo(outputStream)
            }
            file.absolutePath
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun saveAll(context: Context) {
        LocalJsonStorage.saveToFile(context, POPUPS_FILE, _popups.value)
    }
}
