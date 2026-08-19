package com.example.ezzeta.data.repository

import android.content.Context
import com.example.ezzeta.data.model.HomeBanner
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

object HomeBannerRepository {
    private const val BANNERS_FILE = "home_banners.json"
    private val _banners = MutableStateFlow<List<HomeBanner>>(emptyList())
    val banners: StateFlow<List<HomeBanner>> = _banners.asStateFlow()

    fun init(context: Context) {
        val type = object : TypeToken<List<HomeBanner>>() {}.type
        val saved: List<HomeBanner>? = LocalJsonStorage.loadFromFile(context, BANNERS_FILE, type)
        
        if (saved.isNullOrEmpty()) {
            _banners.value = getDefaultBanners()
            saveAll(context)
        } else {
            _banners.value = saved.sortedBy { it.order }
        }
    }

    private fun getDefaultBanners(): List<HomeBanner> {
        val urls = listOf(
            "https://3x100.pe/wp-content/uploads/2026/05/BANNER-02-2048x1186.png",
            "https://3x100.pe/wp-content/uploads/2026/05/BANNER-01-2048x1186.png",
            "https://crepante.com/wp-content/uploads/2026/04/BANNER-4-scaled.jpg.webp",
            "https://uomocattivo.com/wp-content/uploads/2026/07/BANNER-VITTORIO.png.webp",
            "https://crepante.com/wp-content/uploads/2026/07/BANNER-NOCTURNO-CREPANTEjpg.jpg.jpeg.webp"
        )
        return urls.mapIndexed { index, url ->
            HomeBanner(
                id = "default_$index",
                desktopImageUrl = url,
                order = index
            )
        }
    }

    fun saveBanner(context: Context, banner: HomeBanner) {
        val current = _banners.value.toMutableList()
        val index = current.indexOfFirst { it.id == banner.id }
        if (index != -1) {
            current[index] = banner
        } else {
            current.add(banner)
        }
        _banners.value = current.sortedBy { it.order }
        saveAll(context)
    }

    fun deleteBanner(context: Context, bannerId: String) {
        _banners.value = _banners.value.filter { it.id != bannerId }
        saveAll(context)
    }

    fun updateOrder(context: Context, bannerId: String, newOrder: Int) {
        val current = _banners.value.toMutableList()
        val index = current.indexOfFirst { it.id == bannerId }
        if (index != -1) {
            current[index] = current[index].copy(order = newOrder, updatedAt = System.currentTimeMillis())
            _banners.value = current.sortedBy { it.order }
            saveAll(context)
        }
    }

    private fun saveAll(context: Context) {
        LocalJsonStorage.saveToFile(context, BANNERS_FILE, _banners.value)
    }
}
