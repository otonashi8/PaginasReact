package com.example.ezzeta.data.repository

import android.content.Context
import com.example.ezzeta.data.mock.MockData
import com.example.ezzeta.data.model.Category
import com.example.ezzeta.data.model.MarketplaceRequest
import com.example.ezzeta.data.model.Product
import com.example.ezzeta.data.model.Store
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.*

class ProductRepository {
    private val _products = MutableStateFlow<List<Product>>(MockData.products)
    private val _categories = MutableStateFlow<List<Category>>(MockData.categories)
    private val _requests = MutableStateFlow<List<MarketplaceRequest>>(emptyList())
    private var _stores = MockData.stores
    
    private val PRODUCTS_FILE = "products.json"
    private val CATEGORIES_FILE = "categories.json"
    private val STORES_FILE = "stores.json"
    private val REQUESTS_FILE = "marketplace_requests.json"
    
    fun getProducts(): StateFlow<List<Product>> = _products.asStateFlow()

    fun getCategoriesFlow(): StateFlow<List<Category>> = _categories.asStateFlow()

    fun getProductsSync(): List<Product> = _products.value

    fun getProductById(id: String): Product? = _products.value.find { it.id == id }

    fun init(context: Context, sizeRepository: SizeRepository? = null) {
        try {
            var dataChanged = false
            
            // ... (categorías y stores se mantienen igual por ahora)
            val catType = object : TypeToken<List<Category>>() {}.type
            val loadedCats: List<Category>? = LocalJsonStorage.loadFromFile(context, CATEGORIES_FILE, catType)
            
            val finalCategories = if (loadedCats != null) {
                val repaired = loadedCats.map { loaded ->
                    val mock = MockData.categories.find { it.id == loaded.id }
                    val visibility = loaded.visibility ?: mock?.visibility ?: "STORE"
                    val rawSub = if (loaded.subCategories.isNullOrEmpty()) mock?.subCategories ?: emptyList() else loaded.subCategories
                    val finalSub = if (visibility == "STORE" || visibility == "BOTH") {
                        if (rawSub.contains("Recientes")) rawSub else listOf("Recientes") + rawSub
                    } else rawSub
                    
                    val updated = loaded.copy(visibility = visibility, subCategories = finalSub)
                    if (updated != loaded) dataChanged = true
                    updated
                }.toMutableList()
                
                MockData.categories.forEach { mock ->
                    if (repaired.none { it.id == mock.id }) {
                        val visibility = mock.visibility
                        val rawSub = mock.subCategories
                        val finalSub = if (visibility == "STORE" || visibility == "BOTH") {
                            if (rawSub.contains("Recientes")) rawSub else listOf("Recientes") + rawSub
                        } else rawSub
                        repaired.add(mock.copy(subCategories = finalSub))
                        dataChanged = true
                    }
                }
                repaired
            } else {
                dataChanged = true
                MockData.categories.map { mock ->
                    if (mock.visibility == "STORE" || mock.visibility == "BOTH") {
                        mock.copy(subCategories = listOf("Recientes") + mock.subCategories)
                    } else mock
                }
            }
            
            _categories.value = finalCategories
            if (dataChanged) {
                LocalJsonStorage.saveToFile(context, CATEGORIES_FILE, _categories.value)
                dataChanged = false
            }

            // Init Stores
            val storeType = object : TypeToken<List<Store>>() {}.type
            val loadedStores: List<Store>? = LocalJsonStorage.loadFromFile(context, STORES_FILE, storeType)
            if (loadedStores != null) {
                val storesWithMockData = loadedStores.map { loaded ->
                    val mock = MockData.stores.find { it.id == loaded.id }
                    val updated = loaded.copy(websiteUrl = loaded.websiteUrl ?: mock?.websiteUrl)
                    if (updated != loaded) dataChanged = true
                    updated
                }
                _stores = storesWithMockData
                if (dataChanged) {
                    LocalJsonStorage.saveToFile(context, STORES_FILE, _stores)
                    dataChanged = false
                }
            } else {
                _stores = MockData.stores
                LocalJsonStorage.saveToFile(context, STORES_FILE, _stores)
            }

            // Init Products
            val prodType = object : TypeToken<List<Product>>() {}.type
            val loadedProducts: List<Product>? = LocalJsonStorage.loadFromFile(context, PRODUCTS_FILE, prodType)
            
            val allGlobalSizes = sizeRepository?.globalSystems?.value?.flatMap { it.options } ?: emptyList()

            if (loadedProducts != null) {
                var structureChanged = false
                val repairedProducts = mutableListOf<Product>()
                
                for (p in loadedProducts) {
                    if (p == null) continue
                    try {
                        // Reparación profunda campo por campo para evitar nulos de Gson en no-nullables
                        var updated = p.copy(
                            id = p.id ?: "p_${System.currentTimeMillis()}_${repairedProducts.size}",
                            name = p.name ?: "Producto sin nombre",
                            description = p.description ?: "",
                            imageUrl = p.imageUrl ?: "",
                            imageUrls = p.imageUrls ?: emptyList(),
                            storeId = p.storeId ?: "s1",
                            categoryIds = p.categoryIds ?: emptyList(),
                            subCategoryIds = p.subCategoryIds ?: emptyList(),
                            subCategories = p.subCategories ?: emptyList(),
                            createdAt = if (p.createdAt == 0L) System.currentTimeMillis() else p.createdAt,
                            status = p.status ?: com.example.ezzeta.data.model.ProductStatus.APPROVED
                        )

                        // 1. Migración de Categorías
                        if (updated.categoryIds.isEmpty() && !updated.categoryId.isNullOrBlank()) {
                            updated = updated.copy(categoryIds = listOf(updated.categoryId).filter { !it.isNullOrBlank() }.distinct())
                            structureChanged = true
                        }

                        // 2. Migración de Subcategorías
                        if (updated.subCategoryIds.isEmpty() && updated.subCategories.isNotEmpty()) {
                            updated = updated.copy(subCategoryIds = updated.subCategories.filter { !it.isNullOrBlank() }.distinct())
                            structureChanged = true
                        }

                        // 3. Migración de Status y Visibilidad
                        if (updated.status == com.example.ezzeta.data.model.ProductStatus.APPROVED && !updated.isVisible) {
                            updated = updated.copy(status = com.example.ezzeta.data.model.ProductStatus.DISABLED)
                            structureChanged = true
                        }

                        // 4. Corrección de Flag Marketplace 
                        // Si tiene sellerId o storeId de cliente, es producto de marketplace
                        if ((updated.storeId == "client_store" || !updated.sellerId.isNullOrBlank()) && !updated.isClientProduct) {
                            updated = updated.copy(isClientProduct = true)
                            structureChanged = true
                        }

                        // 5. Migración de Tallas (sizeId)
                        val variants = updated.variants ?: emptyList()
                        if (variants.isNotEmpty()) {
                            val migratedVariants = variants.map { v ->
                                if (v != null && v.sizeId == null && !v.name.isNullOrBlank()) {
                                    val match = allGlobalSizes.find { it.name.equals(v.name, ignoreCase = true) }
                                    if (match != null) {
                                        structureChanged = true
                                        v.copy(sizeId = match.id)
                                    } else v
                                } else v
                            }
                            if (migratedVariants != variants) {
                                updated = updated.copy(variants = migratedVariants)
                                structureChanged = true
                            }
                        }

                        repairedProducts.add(updated)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        // Si un producto falla catastróficamente, lo ignoramos para salvar el resto
                    }
                }

                _products.value = repairedProducts.sortedByDescending { it.createdAt }
                if (structureChanged) {
                    LocalJsonStorage.saveToFile(context, PRODUCTS_FILE, _products.value)
                }
            } else {
                val migratedMock = MockData.products.map { p ->
                    val status = if (p.isVisible) com.example.ezzeta.data.model.ProductStatus.APPROVED else com.example.ezzeta.data.model.ProductStatus.DISABLED
                    p.copy(
                        categoryIds = listOf(p.categoryId).filter { it.isNotBlank() },
                        subCategoryIds = p.subCategories,
                        status = status
                    )
                }
                _products.value = migratedMock.sortedByDescending { it.createdAt }
                LocalJsonStorage.saveToFile(context, PRODUCTS_FILE, _products.value)
            }

            loadUserSpecificData(context)

            val reqType = object : TypeToken<List<MarketplaceRequest>>() {}.type
            val loadedReqs: List<MarketplaceRequest>? = LocalJsonStorage.loadFromFile(context, REQUESTS_FILE, reqType)
            if (loadedReqs != null) {
                _requests.value = loadedReqs
            }
        } catch (e: Exception) {
            e.printStackTrace()
            _categories.value = MockData.categories
            _stores = MockData.stores
            _products.value = MockData.products
        }
    }

    fun loadUserSpecificData(context: Context) {
        val favorites = PersistenceManager.getFavorites(context)
        if (favorites.isEmpty()) return
        
        val currentList = _products.value.map { product ->
            if (favorites.contains(product.id)) product.copy(isFavorite = true) else product
        }
        _products.value = currentList
    }

    fun getCategories(): List<Category> = _categories.value

    fun getStores(): List<Store> = _stores

    fun getProductsByCategory(categoryId: String): Flow<List<Product>> {
        return _products.map { list -> 
            if (categoryId == "1") list else list.filter { it.categoryId == categoryId }
        }
    }

    fun toggleFavorite(context: Context, productId: String) {
        val currentList = _products.value
        val index = currentList.indexOfFirst { it.id == productId }
        if (index != -1) {
            val product = currentList[index]
            val newState = !product.isFavorite
            
            val newList = currentList.toMutableList()
            newList[index] = product.copy(isFavorite = newState)
            _products.value = newList
            
            // Persist efficiently
            val favorites = PersistenceManager.getFavorites(context).toMutableSet()
            if (newState) favorites.add(productId) else favorites.remove(productId)
            PersistenceManager.saveFavorites(context, favorites)
        }
    }

    fun getProductsByStore(storeId: String): List<Product> {
        return _products.value.filter { it.storeId == storeId }
    }

    // panel admin
    fun addCategory(context: Context, category: Category) {
        val currentList = _categories.value.toMutableList()
        currentList.add(category)
        _categories.value = currentList
        LocalJsonStorage.saveToFile(context, CATEGORIES_FILE, _categories.value)
    }

    fun updateCategory(context: Context, category: Category) {
        val currentList = _categories.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == category.id }
        if (index != -1) {
            currentList[index] = category
            _categories.value = currentList
            LocalJsonStorage.saveToFile(context, CATEGORIES_FILE, _categories.value)
        }
    }

    fun deleteCategory(context: Context, categoryId: String) {
        val currentList = _categories.value.toMutableList()
        if (currentList.removeIf { it.id == categoryId }) {
            _categories.value = currentList
            LocalJsonStorage.saveToFile(context, CATEGORIES_FILE, _categories.value)
        }
    }

    fun addProduct(context: Context, product: Product) {
        val currentList = _products.value.toMutableList()
        val productWithDate = if (product.createdAt == 0L) product.copy(createdAt = System.currentTimeMillis()) else product
        currentList.add(0, productWithDate)
        _products.value = currentList
        LocalJsonStorage.saveToFile(context, PRODUCTS_FILE, _products.value)
    }

    fun updateProduct(context: Context, product: Product) {
        val currentList = _products.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == product.id }
        if (index != -1) {
            currentList[index] = product
            _products.value = currentList
            LocalJsonStorage.saveToFile(context, PRODUCTS_FILE, _products.value)
        }
    }

    fun deleteProduct(context: Context, productId: String) {
        val currentList = _products.value.toMutableList()
        if (currentList.removeIf { it.id == productId }) {
            _products.value = currentList
            LocalJsonStorage.saveToFile(context, PRODUCTS_FILE, _products.value)
        }
    }

    fun disableUserProducts(context: Context, sellerId: String) {
        val currentList = _products.value.map { product ->
            if (product.sellerId == sellerId) {
                product.copy(status = com.example.ezzeta.data.model.ProductStatus.DISABLED, isVisible = false)
            } else product
        }
        _products.value = currentList
        LocalJsonStorage.saveToFile(context, PRODUCTS_FILE, _products.value)
    }

    // petisiones
    fun getRequests(): StateFlow<List<MarketplaceRequest>> = _requests.asStateFlow()

    fun addRequest(context: Context, request: MarketplaceRequest) {
        val currentList = _requests.value.toMutableList()
        currentList.add(0, request)
        _requests.value = currentList
        LocalJsonStorage.saveToFile(context, REQUESTS_FILE, _requests.value)
    }

    fun updateRequest(context: Context, request: MarketplaceRequest) {
        val currentList = _requests.value.toMutableList()
        val index = currentList.indexOfFirst { it.id == request.id }
        if (index != -1) {
            currentList[index] = request
            _requests.value = currentList
            LocalJsonStorage.saveToFile(context, REQUESTS_FILE, _requests.value)
        }
    }

    fun deleteRequest(context: Context, requestId: String) {
        val currentList = _requests.value.toMutableList()
        if (currentList.removeIf { it.id == requestId }) {
            _requests.value = currentList
            LocalJsonStorage.saveToFile(context, REQUESTS_FILE, _requests.value)
        }
    }
}
