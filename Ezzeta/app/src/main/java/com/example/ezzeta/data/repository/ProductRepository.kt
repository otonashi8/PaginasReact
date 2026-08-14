package com.example.ezzeta.data.repository

import android.content.Context
import com.example.ezzeta.data.mock.MockData
import com.example.ezzeta.data.model.Category
import com.example.ezzeta.data.model.Product
import com.example.ezzeta.data.model.Store
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.*

class ProductRepository {
    private val _products = MutableStateFlow<List<Product>>(MockData.products)
    private val _categories = MutableStateFlow<List<Category>>(MockData.categories)
    private var _stores = MockData.stores
    
    private val PRODUCTS_FILE = "products.json"
    private val CATEGORIES_FILE = "categories.json"
    private val STORES_FILE = "stores.json"
    
    fun getProducts(): StateFlow<List<Product>> = _products.asStateFlow()

    fun getCategoriesFlow(): StateFlow<List<Category>> = _categories.asStateFlow()

    fun getProductsSync(): List<Product> = _products.value

    fun getProductById(id: String): Product? = _products.value.find { it.id == id }

    fun init(context: Context) {
        try {
            // Init Categories
            val catType = object : TypeToken<List<Category>>() {}.type
            val loadedCats: List<Category>? = LocalJsonStorage.loadFromFile(context, CATEGORIES_FILE, catType)
            
            val finalCategories = if (loadedCats != null) {
                // Reparar campos nulos por migración (visibility) y realizar MERGE con nuevos MockData
                val fixedCats = loadedCats.map { loaded ->
                    val mock = MockData.categories.find { it.id == loaded.id }
                    loaded.copy(
                        visibility = loaded.visibility ?: mock?.visibility ?: "STORE",
                        subCategories = if (loaded.subCategories.isNullOrEmpty()) mock?.subCategories ?: emptyList() else loaded.subCategories
                    )
                }.toMutableList()
                
                // Añadir categorías de MockData que NO existen en el archivo local (ej. las nuevas de Marketplace)
                MockData.categories.forEach { mock ->
                    if (fixedCats.none { it.id == mock.id }) {
                        fixedCats.add(mock)
                    }
                }
                fixedCats
            } else {
                MockData.categories
            }
            
            _categories.value = finalCategories
            LocalJsonStorage.saveToFile(context, CATEGORIES_FILE, _categories.value)

            // Init Stores
            val storeType = object : TypeToken<List<Store>>() {}.type
            val loadedStores: List<Store>? = LocalJsonStorage.loadFromFile(context, STORES_FILE, storeType)
            if (loadedStores != null) {
                // Reparar websiteUrl tras migración de datos
                _stores = loadedStores.map { loaded ->
                    val mock = MockData.stores.find { it.id == loaded.id }
                    loaded.copy(websiteUrl = loaded.websiteUrl ?: mock?.websiteUrl)
                }
            } else {
                _stores = MockData.stores
                LocalJsonStorage.saveToFile(context, STORES_FILE, _stores)
            }

            // Init Products
            val prodType = object : TypeToken<List<Product>>() {}.type
            val loadedProducts: List<Product>? = LocalJsonStorage.loadFromFile(context, PRODUCTS_FILE, prodType)
            
            if (loadedProducts != null) {
                // Asegurar campos no nulos tras migración de datos
                val fixedProducts = loadedProducts.map { p ->
                    p.copy(
                        imageUrls = p.imageUrls ?: emptyList()
                    )
                }
                _products.value = fixedProducts
            } else {
                _products.value = MockData.products
                LocalJsonStorage.saveToFile(context, PRODUCTS_FILE, _products.value)
            }

            // Apply User Specific Data (Favorites)
            loadUserSpecificData(context)
        } catch (e: Exception) {
            e.printStackTrace()
            // Fallback to memory
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

    // Admin Panel
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
        currentList.add(0, product)
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
}
