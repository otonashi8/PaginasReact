package com.example.ezzeta.data.repository

import android.content.Context
import com.example.ezzeta.data.model.ShippingConfig
import com.example.ezzeta.data.model.ShippingRate
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class ShippingRepository {
    private val _rates = MutableStateFlow<List<ShippingRate>>(emptyList())
    val rates: StateFlow<List<ShippingRate>> = _rates.asStateFlow()

    private val _config = MutableStateFlow(ShippingConfig())
    val config: StateFlow<ShippingConfig> = _config.asStateFlow()

    private val RATES_FILE = "shipping_rates.json"
    private val CONFIG_FILE = "shipping_config.json"

    fun init(context: Context) {
        val ratesType = object : TypeToken<List<ShippingRate>>() {}.type
        val loadedRates: List<ShippingRate>? = LocalJsonStorage.loadFromFile(context, RATES_FILE, ratesType)
        
        if (loadedRates != null) {
            _rates.value = loadedRates
        } else {
            // Default: envío general S/20, Prioridad 2
            val defaultRates = listOf(
                ShippingRate(id = "default_general", region = "GENERAL", cost = 20.0, priority = 2, isActive = true)
            )
            _rates.value = defaultRates
            LocalJsonStorage.saveToFile(context, RATES_FILE, defaultRates)
        }

        val configType = object : TypeToken<ShippingConfig>() {}.type
        val loadedConfig: ShippingConfig? = LocalJsonStorage.loadFromFile(context, CONFIG_FILE, configType)
        
        if (loadedConfig != null) {
            _config.value = loadedConfig
        } else {
            val defaultConfig = ShippingConfig(freeShippingThreshold = 100.0)
            _config.value = defaultConfig
            LocalJsonStorage.saveToFile(context, CONFIG_FILE, defaultConfig)
        }
    }

    fun addRate(context: Context, rate: ShippingRate) {
        val current = _rates.value.toMutableList()
        current.add(rate)
        _rates.value = current
        LocalJsonStorage.saveToFile(context, RATES_FILE, current)
    }

    fun updateRate(context: Context, rate: ShippingRate) {
        val current = _rates.value.map { if (it.id == rate.id) rate else it }
        _rates.value = current
        LocalJsonStorage.saveToFile(context, RATES_FILE, current)
    }

    fun deleteRate(context: Context, rateId: String) {
        val current = _rates.value.filter { it.id != rateId }
        _rates.value = current
        LocalJsonStorage.saveToFile(context, RATES_FILE, current)
    }

    fun updateConfig(context: Context, config: ShippingConfig) {
        _config.value = config
        LocalJsonStorage.saveToFile(context, CONFIG_FILE, config)
    }
}
