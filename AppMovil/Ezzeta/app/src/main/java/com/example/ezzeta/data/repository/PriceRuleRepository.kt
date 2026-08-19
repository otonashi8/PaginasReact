package com.example.ezzeta.data.repository

import android.content.Context
import com.example.ezzeta.data.model.PriceRule
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class PriceRuleRepository {
    private val _rules = MutableStateFlow<List<PriceRule>>(emptyList())
    val rules: StateFlow<List<PriceRule>> = _rules.asStateFlow()

    private val RULES_FILE = "price_rules.json"

    fun init(context: Context) {
        val type = object : TypeToken<List<PriceRule>>() {}.type
        val loaded: List<PriceRule>? = LocalJsonStorage.loadFromFile(context, RULES_FILE, type)
        if (loaded != null) {
            _rules.value = loaded
        }
    }

    fun addRule(context: Context, rule: PriceRule) {
        val current = _rules.value.toMutableList()
        current.add(rule)
        _rules.value = current
        LocalJsonStorage.saveToFile(context, RULES_FILE, current)
    }

    fun updateRule(context: Context, rule: PriceRule) {
        val current = _rules.value.map { if (it.id == rule.id) rule else it }
        _rules.value = current
        LocalJsonStorage.saveToFile(context, RULES_FILE, current)
    }

    fun deleteRule(context: Context, ruleId: String) {
        val current = _rules.value.filter { it.id != ruleId }
        _rules.value = current
        LocalJsonStorage.saveToFile(context, RULES_FILE, current)
    }
}
