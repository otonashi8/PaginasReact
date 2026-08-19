package com.example.ezzeta.data.repository

import android.content.Context
import com.example.ezzeta.data.model.MarketplaceReport
import com.example.ezzeta.data.model.ReportStatus
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

object MarketplaceReportRepository {
    private const val REPORTS_FILE = "marketplace_reports.json"
    private val _reports = MutableStateFlow<List<MarketplaceReport>>(emptyList())
    val reports: StateFlow<List<MarketplaceReport>> = _reports.asStateFlow()

    fun init(context: Context) {
        val type = object : TypeToken<List<MarketplaceReport>>() {}.type
        val savedReports: List<MarketplaceReport>? = LocalJsonStorage.loadFromFile(context, REPORTS_FILE, type)
        _reports.value = savedReports ?: emptyList()
    }

    fun addReport(context: Context, report: MarketplaceReport) {
        val current = _reports.value.toMutableList()
        current.add(report)
        _reports.value = current
        saveAll(context)
    }

    fun updateStatus(context: Context, reportId: String, newStatus: ReportStatus) {
        val current = _reports.value.toMutableList()
        val index = current.indexOfFirst { it.id == reportId }
        if (index != -1) {
            current[index] = current[index].copy(status = newStatus)
            _reports.value = current
            saveAll(context)
        }
    }

    fun deleteReport(context: Context, reportId: String) {
        _reports.value = _reports.value.filter { it.id != reportId }
        saveAll(context)
    }

    private fun saveAll(context: Context) {
        LocalJsonStorage.saveToFile(context, REPORTS_FILE, _reports.value)
    }
}
