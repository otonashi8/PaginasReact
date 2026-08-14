package com.example.ezzeta.ui.components

import com.example.ezzeta.data.model.Product
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.*

class FilterManager(
    private val allProducts: Flow<List<Product>>,
    private val scope: CoroutineScope,
    private val minPriceFlow: StateFlow<Float>,
    private val maxPriceFlow: StateFlow<Float>,
    private val isClientProductFilter: Boolean? = null // null: all, true: only client, false: only store
) {
    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()

    private val _categorySearchQuery = MutableStateFlow("")
    val categorySearchQuery = _categorySearchQuery.asStateFlow()

    private val _selectedCategoryId = MutableStateFlow("1") // "1" es "Todo"
    val selectedCategoryId = _selectedCategoryId.asStateFlow()

    private val _selectedSubCategory = MutableStateFlow("Todo")
    val selectedSubCategory = _selectedSubCategory.asStateFlow()

    private val _priceRange = MutableStateFlow(0f..100000f)
    val priceRange = _priceRange.asStateFlow()

    private val _selectedSizes = MutableStateFlow<Set<String>>(emptySet())
    val selectedSizes = _selectedSizes.asStateFlow()

    private val _selectedCampaign = MutableStateFlow<String?>(null)
    val selectedCampaign = _selectedCampaign.asStateFlow()

    private val _selectedStoreId = MutableStateFlow<String?>(null)
    val selectedStoreId = _selectedStoreId.asStateFlow()

    val filteredProducts: StateFlow<List<Product>> = combine(
        allProducts,
        _searchQuery,
        _categorySearchQuery,
        _selectedCategoryId,
        _selectedSubCategory,
        _selectedCampaign,
        _priceRange,
        _selectedSizes,
        _selectedStoreId
    ) { args ->
        val products = args[0] as List<Product>
        val query = args[1] as String
        val catQuery = args[2] as String
        val catId = args[3] as String
        val subCat = args[4] as String
        val campaign = args[5] as String?
        val priceR = args[6] as ClosedFloatingPointRange<Float>
        val sizes = args[7] as Set<String>
        val storeId = args[8] as String?

        products.filter { product ->
            val matchesQuery = if (query.isEmpty() && catQuery.isEmpty()) true 
            else product.name.contains(query, ignoreCase = true) || product.name.contains(catQuery, ignoreCase = true)
            
            val matchesCategory = catId == "1" || product.categoryId == catId
            val matchesSub = subCat == "Todo" || 
                             product.subCategories.any { it.equals(subCat, ignoreCase = true) } || 
                             product.name.contains(subCat, ignoreCase = true)
            val matchesCampaign = campaign == null || product.campaign == campaign
            val matchesPrice = product.price.toFloat() in priceR
            val matchesStore = storeId == null || product.storeId == storeId
            
            val matchesSize = if (sizes.isEmpty()) true else {
                val productSizes = product.getAvailableSizes()
                sizes.any { it in productSizes }
            }
            
            val matchesOrigin = isClientProductFilter == null || product.isClientProduct == isClientProductFilter
            
            matchesQuery && matchesCategory && matchesSub && matchesCampaign && matchesPrice && matchesSize && matchesStore && product.isVisible && matchesOrigin
        }
    }.stateIn(scope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun onSearchQueryChange(newQuery: String) {
        _searchQuery.value = newQuery
    }

    fun onCategorySearchQueryChange(newQuery: String) {
        _categorySearchQuery.value = newQuery
    }

    fun onCategorySelected(categoryId: String) {
        _selectedCategoryId.value = categoryId
        _selectedSubCategory.value = "Todo"
    }

    fun onSubCategorySelected(subCategory: String) {
        _selectedSubCategory.value = subCategory
    }

    fun onPriceRangeChange(newRange: ClosedFloatingPointRange<Float>) {
        _priceRange.value = newRange
    }

    fun onSizeToggle(size: String) {
        val current = _selectedSizes.value
        _selectedSizes.value = if (current.contains(size)) current - size else current + size
    }

    fun clearFilters() {
        _priceRange.value = minPriceFlow.value..maxPriceFlow.value
        _selectedSizes.value = emptySet()
        _selectedCategoryId.value = "1"
        _selectedSubCategory.value = "Todo"
        _selectedCampaign.value = null
        _selectedStoreId.value = null
        _searchQuery.value = ""
        _categorySearchQuery.value = ""
    }

    fun onCampaignSelected(campaign: String?) {
        _selectedCampaign.value = if (_selectedCampaign.value == campaign) null else campaign
    }

    fun onStoreSelected(storeId: String?) {
        _selectedStoreId.value = if (_selectedStoreId.value == storeId) null else storeId
    }
}
