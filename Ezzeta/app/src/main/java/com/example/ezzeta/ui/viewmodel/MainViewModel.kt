package com.example.ezzeta.ui.viewmodel

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ezzeta.data.model.*
import com.example.ezzeta.data.repository.PersistenceManager
import com.example.ezzeta.data.repository.ProductRepository
import com.example.ezzeta.data.repository.UserRepository
import com.example.ezzeta.data.repository.SizeRepository
import com.example.ezzeta.ui.components.FilterManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import com.example.ezzeta.ui.utils.CommunicationsHelper
import java.util.Locale

class MainViewModel : ViewModel() {
    private val productRepository = ProductRepository()
    private val sizeRepository = SizeRepository()
    
    val currentUser: StateFlow<User?> = UserRepository.currentUser
    val isAdmin: StateFlow<Boolean> = currentUser.map { it?.isAdmin ?: false }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    private val _isDarkTheme = MutableStateFlow(false)
    val isDarkTheme: StateFlow<Boolean> = _isDarkTheme.asStateFlow()

    private val _showOrderSuccessAlert = MutableStateFlow(false)
    val showOrderSuccessAlert: StateFlow<Boolean> = _showOrderSuccessAlert.asStateFlow()

    private val _quickViewProductId = MutableStateFlow<String?>(null)
    
    // Deshacer eliminación en cesta
    private val _lastDeletedItem = MutableStateFlow<CartItem?>(null)
    val lastDeletedItem: StateFlow<CartItem?> = _lastDeletedItem.asStateFlow()

    // Ubigeo Data
    private val _ubigeoData = MutableStateFlow<Map<String, Map<String, Map<String, UbigeoDistrict>>>>(emptyMap())
    val ubigeoData: StateFlow<Map<String, Map<String, Map<String, UbigeoDistrict>>>> = _ubigeoData.asStateFlow()
    
    private val _isLoadingUbigeo = MutableStateFlow(false)
    val isLoadingUbigeo: StateFlow<Boolean> = _isLoadingUbigeo.asStateFlow()
    
    private val _ubigeoError = MutableStateFlow<String?>(null)
    val ubigeoError: StateFlow<String?> = _ubigeoError.asStateFlow()
    
    val allProducts: StateFlow<List<Product>> = productRepository.getProducts()


    private val _advantagePlans = MutableStateFlow(listOf(
        AdvantagePlan("bronze", "Bronce", 19.90, 5, 8, 0xFF8B4513, "Star"), // Marrón cuero/bronce oscuro
        AdvantagePlan("silver", "Plata", 39.90, 7, 6, 0xFF424242, "Stars"),  // Gris oscuro carbón
        AdvantagePlan("gold", "Oro", 59.90, 10, 5, 0xFFB8860B, "WorkspacePremium") // Oro oscuro/viejo
    ))

    val advantagePlans: StateFlow<List<AdvantagePlan>> = _advantagePlans.asStateFlow()

    val userPlan: StateFlow<AdvantagePlan?> = combine(currentUser, advantagePlans) { user, plans ->
        plans.find { it.id == user?.currentPlanId }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)


    val minAvailablePrice: StateFlow<Float> = allProducts.map { products ->
        products.minOfOrNull { it.price.toFloat() } ?: 0f
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0f)

    val maxAvailablePrice: StateFlow<Float> = allProducts.map { products ->
        products.maxOfOrNull { it.price.toFloat() } ?: 5000f
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 5000f)

    // Gestor de Filtros Tienda
    val storeFilterManager = FilterManager(
        allProducts = allProducts,
        scope = viewModelScope,
        minPriceFlow = minAvailablePrice,
        maxPriceFlow = maxAvailablePrice,
        isClientProductFilter = false
    )

    // Gestor de Filtros Marketplace
    val marketplaceFilterManager = FilterManager(
        allProducts = allProducts,
        scope = viewModelScope,
        minPriceFlow = minAvailablePrice,
        maxPriceFlow = maxAvailablePrice,
        isClientProductFilter = true
    )

    // Exponer productos filtrados y estados para conveniencia de la UI
    val filteredProducts = storeFilterManager.filteredProducts
    val searchQuery = storeFilterManager.searchQuery
    val categorySearchQuery = storeFilterManager.categorySearchQuery
    val selectedCategoryId = storeFilterManager.selectedCategoryId
    val selectedSubCategory = storeFilterManager.selectedSubCategory
    val priceRange = storeFilterManager.priceRange
    val selectedSizes = storeFilterManager.selectedSizes
    val selectedCampaign = storeFilterManager.selectedCampaign
    val selectedStoreId = storeFilterManager.selectedStoreId

    val categories: StateFlow<List<Category>> = productRepository.getCategoriesFlow()
    
    val storeCategories: StateFlow<List<Category>> = categories.map { list ->
        list.filter { it.visibility == "STORE" || it.visibility == "BOTH" }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val marketplaceCategories: StateFlow<List<Category>> = categories.map { list ->
        list.filter { it.visibility == "MARKETPLACE" || it.visibility == "BOTH" }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    
    val categoriesList: List<Category> get() = categories.value

    val myProducts: StateFlow<List<Product>> = combine(allProducts, currentUser) { products, user ->
        val userId = user?.uuid ?: ""
        products.filter { it.sellerId == userId }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val quickViewProduct: StateFlow<Product?> = _quickViewProductId.map { id ->
        id?.let { productRepository.getProductById(it) }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    /**
     * Mantenido por compatibilidad con las pantallas, aunque la carga es instantánea 
     * desde el repositorio en memoria.
     */
    fun prefetchProduct(productId: String) { }

    private val _browsingHistory = MutableStateFlow<List<Product>>(emptyList())
    val browsingHistory: StateFlow<List<Product>> = _browsingHistory.asStateFlow()

    // Cart Management
    private val _cartItems = MutableStateFlow<List<CartItem>>(emptyList())
    val cartItems: StateFlow<List<CartItem>> = _cartItems.asStateFlow()

    private val _orders = MutableStateFlow<List<Order>>(emptyList())
    val orders: StateFlow<List<Order>> = _orders.asStateFlow()

    val cartItemCount: StateFlow<Int> = _cartItems.map { items ->
        items.sumOf { it.quantity }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val totalSavings: StateFlow<Double> = _cartItems.map { items ->
        items.sumOf { item ->
            val product = item.product
            if (product.oldPrice != null && product.oldPrice > product.price) {
                (product.oldPrice - product.price) * item.quantity
            } else {
                0.0
            }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val subtotal: StateFlow<Double> = _cartItems.map { items ->
        items.sumOf { it.effectivePrice * it.quantity }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val planDiscount: StateFlow<Double> = combine(subtotal, userPlan) { sub, plan ->
        if (plan != null) (sub * plan.discountPercent / 100.0) else 0.0
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val shippingCost: StateFlow<Double> = subtotal.map { if (it >= 200.0) 0.0 else 15.0 }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 15.0)

    val total: StateFlow<Double> = combine(subtotal, shippingCost, planDiscount) { s, sh, d -> s + sh - d }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)


    private fun createCampaignFlow(campaignName: String): StateFlow<List<Product>> {
        return combine(
            allProducts,
            storeFilterManager.selectedCategoryId,
            storeFilterManager.selectedSubCategory
        ) { products, catId, subCat ->
            products.filter { 
                it.isVisible && !it.isClientProduct && // Solo tienda y visible
                it.campaign == campaignName && 
                (catId == "1" || it.categoryId == catId) &&
                (subCat == "Todo" || it.subCategories.any { s -> s.equals(subCat, ignoreCase = true) } || it.name.contains(subCat, ignoreCase = true))
            }
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    }

    val novedadesProducts = createCampaignFlow("Novedades")
    val ofertasPatriasProducts = createCampaignFlow("Ofertas Patrias")
    val masVendidosProducts = createCampaignFlow("Más Vendidos")

    // Estadísticas para Admin
    val ezzetaProductsCount: StateFlow<Int> = allProducts.map { products ->
        products.count { !it.isClientProduct }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val clientProductsCount: StateFlow<Int> = allProducts.map { products ->
        products.count { it.isClientProduct }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val totalSalesValue: StateFlow<Double> = orders.map { orderList ->
        orderList.sumOf { it.total }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val globalSizeSystems: StateFlow<List<SizeSystem>> = sizeRepository.globalSystems
    
    val allClientCustomSizes: StateFlow<List<SizeOption>> = sizeRepository.allUserCustomSizes
    
    val userCustomSizes: StateFlow<List<SizeOption>> = combine(allClientCustomSizes, currentUser) { all, user ->
        all.filter { it.createdByUserId == user?.uuid }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val categorySearchResults: StateFlow<List<Product>> = combine(
        productRepository.getProducts(),
        storeFilterManager.categorySearchQuery
    ) { products, query ->
        if (query.isEmpty()) emptyList()
        else products.filter { it.isVisible && !it.isClientProduct && it.name.contains(query, ignoreCase = true) }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    fun initUser(context: Context) {
        val appContext = context.applicationContext
        viewModelScope.launch {
            try {
                withContext(Dispatchers.IO) {
                    UserRepository.init(appContext)
                    sizeRepository.init(appContext)
                    loadUserData(appContext)
                }
                fetchUbigeoData()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun fetchUbigeoData() {
        viewModelScope.launch(Dispatchers.IO) {
            if (_ubigeoData.value.isNotEmpty()) return@launch
            
            _isLoadingUbigeo.value = true
            _ubigeoError.value = null
            try {
                val url = Uri.parse("https://free.e-api.net.pe/ubigeos.json").toString()
                val jsonString = java.net.URL(url).readText()
                val type = object : com.google.gson.reflect.TypeToken<Map<String, Map<String, Map<String, UbigeoDistrict>>>>() {}.type
                val data: Map<String, Map<String, Map<String, UbigeoDistrict>>> = com.google.gson.Gson().fromJson(jsonString, type)
                
                withContext(Dispatchers.Main) {
                    _ubigeoData.value = data
                    _isLoadingUbigeo.value = false
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    _ubigeoError.value = "Error al cargar datos de ubicación: ${e.localizedMessage}"
                    _isLoadingUbigeo.value = false
                }
            }
        }
    }


    private suspend fun loadUserData(context: Context) {
        val appContext = context.applicationContext
        withContext(Dispatchers.IO) {
            productRepository.init(appContext)
            val history = PersistenceManager.getHistory(appContext)
            val cart = PersistenceManager.getCart(appContext)
            val orders = PersistenceManager.getOrders(appContext)
            val isDark = PersistenceManager.getTheme(appContext)
            
            withContext(Dispatchers.Main) {
                _browsingHistory.value = history
                _cartItems.value = cart
                _orders.value = orders
                _isDarkTheme.value = isDark
            }
        }
    }

    fun setUserName(context: Context, alias: String) {
        val appContext = context.applicationContext
        UserRepository.setUser(appContext, alias, isGuest = true, isAdmin = false)
        viewModelScope.launch { loadUserData(appContext) }
    }

    fun registerUser(context: Context, name: String, email: String) {
        val appContext = context.applicationContext
        UserRepository.setUser(appContext, alias = name, email = email, isGuest = false, isAdmin = false)
        viewModelScope.launch { loadUserData(appContext) }
    }

    fun loginUser(context: Context, email: String, isAdmin: Boolean = false) {
        val appContext = context.applicationContext
        // Simulación: usamos la parte del email antes del @ como nombre
        val name = if (isAdmin) "Admin" else email.substringBefore("@").replaceFirstChar { it.uppercase() }
        UserRepository.setUser(appContext, alias = name, email = email, isGuest = false, isAdmin = isAdmin)
        viewModelScope.launch { loadUserData(appContext) }
    }

    fun logout(context: Context) {
        val appContext = context.applicationContext
        UserRepository.logout(appContext)
        viewModelScope.launch { loadUserData(appContext) }
    }

    fun updateAlias(context: Context, newAlias: String) {
        UserRepository.updateAlias(context, newAlias)
    }

    fun subscribeToPlan(context: Context, planId: String) {
        val current = UserRepository.currentUser.value
        if (current != null) {
            val thirtyDaysMillis = 30L * 24 * 60 * 60 * 1000
            val endDate = System.currentTimeMillis() + thirtyDaysMillis
            UserRepository.updateUser(context, current.copy(
                currentPlanId = planId,
                subscriptionEndDate = endDate,
                isAutoRenewalEnabled = true
            ))
        }
    }

    fun toggleAutoRenewal(context: Context) {
        val current = UserRepository.currentUser.value
        if (current != null) {
            UserRepository.updateUser(context, current.copy(
                isAutoRenewalEnabled = !current.isAutoRenewalEnabled
            ))
        }
    }



    fun toggleTheme(context: Context) {
        val newTheme = !_isDarkTheme.value
        _isDarkTheme.value = newTheme
        PersistenceManager.saveTheme(context, newTheme)
    }

    fun toggleProductFavorite(context: Context, productId: String) {
        productRepository.toggleFavorite(context, productId)
    }

    fun toggleFollowStore(context: android.content.Context, storeId: String) {
        val current = UserRepository.currentUser.value
        if (current != null) {
            val followed = current.followedStoreIds.toMutableSet()
            if (followed.contains(storeId)) followed.remove(storeId)
            else followed.add(storeId)
            UserRepository.updateUser(context, current.copy(followedStoreIds = followed))
        }
    }

    fun addToHistory(context: Context, product: Product) {
        val current = _browsingHistory.value.toMutableList()
        current.removeAll { it.id == product.id }
        current.add(0, product)
        val history = current.take(20)
        _browsingHistory.value = history
        PersistenceManager.saveHistory(context, history)
    }

    fun addToCart(context: Context, product: Product, size: String, quantity: Int = 1, price: Double? = null) {
        val current = _cartItems.value.toMutableList()
        val index = current.indexOfFirst { it.product.id == product.id && it.size == size }
        if (index != -1) {
            current[index] = current[index].copy(quantity = current[index].quantity + quantity)
        } else {
            current.add(CartItem(product, quantity, size, price))
        }
        _cartItems.value = current
        PersistenceManager.saveCart(context, current)
    }

    fun updateCartItemQuantity(context: Context, productId: String, size: String, delta: Int) {
        val current = _cartItems.value.toMutableList()
        val index = current.indexOfFirst { it.product.id == productId && it.size == size }
        if (index != -1) {
            val newQuantity = current[index].quantity + delta
            if (newQuantity > 0) {
                current[index] = current[index].copy(quantity = newQuantity)
            } else {
                current.removeAt(index)
            }
            _cartItems.value = current
            PersistenceManager.saveCart(context, current)
        }
    }

    fun updateCartItemSize(context: Context, productId: String, oldSize: String, newSize: String) {
        if (oldSize == newSize) return
        val current = _cartItems.value.toMutableList()
        val index = current.indexOfFirst { it.product.id == productId && it.size == oldSize }
        if (index != -1) {
            val itemToUpdate = current[index]
            val targetIndex = current.indexOfFirst { it.product.id == productId && it.size == newSize }
            if (targetIndex != -1) {
                // Combinar cantidades si ya existe la talla
                val existingItem = current[targetIndex]
                current[targetIndex] = existingItem.copy(quantity = existingItem.quantity + itemToUpdate.quantity)
                current.removeAt(index)
            } else {
                current[index] = itemToUpdate.copy(size = newSize)
            }
            _cartItems.value = current
            PersistenceManager.saveCart(context, current)
        }
    }

    fun addAddress(context: Context, address: String, dept: String, prov: String, dist: String, ubigeo: String? = null, name: String? = null) {
        val current = UserRepository.currentUser.value
        if (current != null) {
            val newAddress = UserAddress(
                id = java.util.UUID.randomUUID().toString(),
                name = if (name.isNullOrBlank()) null else name,
                address = address,
                department = dept,
                province = prov,
                district = dist,
                ubigeoCode = ubigeo
            )
            val updatedAddresses = current.addresses + newAddress
            UserRepository.updateUser(context, current.copy(addresses = updatedAddresses))
        }
    }

    fun savePaymentMethod(context: Context, card: SavedCard) {
        val current = UserRepository.currentUser.value
        if (current != null) {
            val updatedCards = current.savedCards + card
            UserRepository.updateUser(context, current.copy(savedCards = updatedCards))
        }
    }

    fun deletePaymentMethod(context: Context, cardId: String) {
        val current = UserRepository.currentUser.value
        if (current != null) {
            val updatedCards = current.savedCards.filter { it.id != cardId }
            UserRepository.updateUser(context, current.copy(savedCards = updatedCards))
        }
    }


    fun deleteAddress(context: Context, addressId: String) {
        val current = UserRepository.currentUser.value
        if (current != null) {
            val updatedAddresses = current.addresses.filter { it.id != addressId }
            UserRepository.updateUser(context, current.copy(addresses = updatedAddresses))
        }
    }

    fun removeCartItem(context: Context, productId: String) {
        val current = _cartItems.value.toMutableList()
        val itemToRemove = current.find { it.product.id == productId }
        if (itemToRemove != null) {
            _lastDeletedItem.value = itemToRemove
            current.remove(itemToRemove)
            _cartItems.value = current
            PersistenceManager.saveCart(context, current)
        }
    }

    fun undoLastDelete(context: Context) {
        val item = _lastDeletedItem.value ?: return
        val current = _cartItems.value.toMutableList()
        current.add(item)
        _cartItems.value = current
        _lastDeletedItem.value = null
        PersistenceManager.saveCart(context, current)
    }

    fun dismissOrderSuccessAlert() {
        _showOrderSuccessAlert.value = false
    }

    fun clearLastDeletedItem() {
        _lastDeletedItem.value = null
    }

    fun checkout(context: Context) {
        if (_cartItems.value.isEmpty()) return
        
        val newOrder = Order(
            id = "ORD-${java.util.UUID.randomUUID().toString().take(8).uppercase()}",
            date = "21/07/2026",
            items = _cartItems.value,
            total = total.value
        )
        
        val updatedOrders = listOf(newOrder) + _orders.value
        _orders.value = updatedOrders
        _cartItems.value = emptyList()
        
        PersistenceManager.saveOrders(context, updatedOrders)
        PersistenceManager.saveCart(context, emptyList<CartItem>())
        
        _showOrderSuccessAlert.value = true
    }

    fun getProductById(id: String): Product? = productRepository.getProductById(id)

    fun sendComplaint(
        context: Context,
        fullName: String, dni: String, phone: String, email: String,
        itemType: String, itemDescription: String,
        complaintType: String, complaintDetail: String,
        proposedSolution: String
    ) {
        val subject = "Libro de Reclamaciones - $complaintType ($fullName)"
        val body = """
            --- DATOS DEL CONSUMIDOR ---
            Nombre: $fullName
            DNI: $dni
            Teléfono: $phone
            Email: $email
            
            --- IDENTIFICACIÓN DEL BIEN ---
            Tipo: $itemType
            Descripción: $itemDescription
            
            --- DETALLE DE LA RECLAMACIÓN ---
            Tipo: $complaintType
            Detalle: $complaintDetail
            
            --- PROPUESTA DE SOLUCIÓN ---
            Solución: ${if (proposedSolution.isBlank()) "No proporcionada" else proposedSolution}
        """.trimIndent()

        CommunicationsHelper.sendEmail(context, "correo@gmail.com", subject, body)
    }

    fun sendComplaintViaWhatsApp(
        context: Context,
        fullName: String, dni: String, phone: String, email: String,
        itemType: String, itemDescription: String,
        complaintType: String, complaintDetail: String,
        proposedSolution: String
    ) {
        val text = """
            *LIBRO DE RECLAMACIONES*
            *Tipo:* $complaintType
            *Consumidor:* $fullName
            *DNI:* $dni
            *Teléfono:* $phone
            *Email:* $email
            
            *Bien/Servicio:* $itemType
            *Descripción:* $itemDescription
            
            *Detalle:* $complaintDetail
            *Solución:* ${if (proposedSolution.isBlank()) "No proporcionada" else proposedSolution}
        """.trimIndent()

        CommunicationsHelper.sendWhatsApp(context, "51987654321", text)
    }

    fun uploadSingleProduct(
        context: Context,
        name: String, price: Double, categoryId: String,
        subCategories: List<String>,
        condition: String, description: String, imageUrls: List<String>,
        stock: Int, contactName: String, contactPhone: String,
        variants: List<ProductVariant>? = null,
        sizeSystemId: String? = null
    ) {
        val subject = "Publicación de Producto Único - $name ($contactName)"
        val body = """
            --- DETALLES DEL PRODUCTO ---
            Producto: $name
            Precio: S/ $price
            Stock: $stock
            Estado: $condition
            Categoría: ${categories.value.find { it.id == categoryId }?.name ?: categoryId}
            Subcategorías: ${subCategories.joinToString(", ")}
            
            --- VARIANTES/PRECIOS ---
            ${variants?.joinToString("\n") { "${it.name}: S/ ${it.price}" } ?: "Sin variantes"}

            --- CONTACTO DEL VENDEDOR ---
            Nombre: $contactName
            Teléfono/WhatsApp: $contactPhone
            
            --- DESCRIPCIÓN ---
            $description
            
            --- IMÁGENES ---
            ${if (imageUrls.isEmpty()) "Sin imágenes" else imageUrls.joinToString("\n")}
        """.trimIndent()

        CommunicationsHelper.sendEmail(context, "correo@gmail.com", subject, body)
        
        // Publicar localmente
        publishClientProduct(context.applicationContext, name, price, categoryId, subCategories, condition, description, imageUrls, contactName, stock, variants, sizeSystemId)
    }

    fun uploadSingleProductViaWhatsApp(
        context: Context,
        name: String, price: Double, categoryId: String,
        subCategories: List<String>,
        condition: String, description: String, imageUrls: List<String>,
        stock: Int, contactName: String, contactPhone: String,
        variants: List<ProductVariant>? = null,
        sizeSystemId: String? = null
    ) {
        val appContext = context.applicationContext
        val text = """
            *PUBLICACIÓN DE PRODUCTO ÚNICO*
            *Producto:* $name
            *Precio:* S/ $price
            *Stock:* $stock
            *Estado:* $condition
            *Categoría:* ${categories.value.find { it.id == categoryId }?.name ?: categoryId}
            *Subcategorías:* ${subCategories.joinToString(", ")}
            
            *Variantes:* ${variants?.size ?: 0} variantes añadidas.
            
            *Vendedor:* $contactName
            *Teléfono:* $contactPhone
            
            *Descripción:* $description
            
            *Imágenes:* ${imageUrls.size} fotos proporcionadas.
        """.trimIndent()

        CommunicationsHelper.sendWhatsApp(context, "51987654321", text)
        
        // Publicar localmente
        publishClientProduct(appContext, name, price, categoryId, subCategories, condition, description, imageUrls, contactName, stock, variants, sizeSystemId)
    }

    private fun publishClientProduct(
        context: Context,
        name: String, price: Double, categoryId: String,
        subCategories: List<String>,
        condition: String, description: String, imageUrls: List<String>,
        sellerName: String, stock: Int,
        variants: List<ProductVariant>? = null,
        sizeSystemId: String? = null
    ) {
        val userId = UserRepository.getCurrentUserId()
        val newProduct = Product(
            id = "cp_${System.currentTimeMillis()}",
            name = name,
            price = price,
            description = "$description (Estado: $condition)",
            imageUrl = imageUrls.firstOrNull() ?: "",
            imageUrls = imageUrls,
            categoryId = categoryId,
            subCategories = subCategories,
            campaign = "Del cliente para el cliente",
            storeId = "client_store",
            sellerName = sellerName,
            sellerId = userId,
            isClientProduct = true,
            stock = stock,
            isVisible = true,
            variants = variants,
            sizeSystemId = sizeSystemId
        )
        productRepository.addProduct(context, newProduct)
    }

    fun updateProductStock(context: Context, productId: String, newStock: Int) {
        val product = productRepository.getProductById(productId)
        if (product != null) {
            val updated = product.copy(stock = newStock)
            productRepository.updateProduct(context.applicationContext, updated)
        }
    }

    fun updateProductPrice(context: Context, productId: String, newPrice: Double) {
        val product = productRepository.getProductById(productId)
        if (product != null) {
            val updated = product.copy(price = newPrice)
            productRepository.updateProduct(context.applicationContext, updated)
        }
    }

    fun toggleProductVisibility(context: Context, productId: String) {
        val product = productRepository.getProductById(productId)
        if (product != null) {
            val updated = product.copy(isVisible = !product.isVisible)
            productRepository.updateProduct(context.applicationContext, updated)
        }
    }

    fun updateProduct(context: Context, product: Product) {
        productRepository.updateProduct(context.applicationContext, product)
    }

    fun deleteProduct(context: Context, productId: String) {
        productRepository.deleteProduct(context.applicationContext, productId)
    }

    // Category Management
    fun addCategory(context: Context, name: String, subCategories: List<String>, visibility: String = "STORE") {
        val newCategory = Category(
            id = System.currentTimeMillis().toString(),
            name = name,
            iconUrl = "",
            subCategories = subCategories,
            visibility = visibility
        )
        productRepository.addCategory(context.applicationContext, newCategory)
    }

    fun updateCategory(context: Context, category: Category) {
        productRepository.updateCategory(context.applicationContext, category)
    }

    fun deleteCategory(context: Context, categoryId: String) {
        productRepository.deleteCategory(context.applicationContext, categoryId)
    }

    fun onSearchQueryChange(newQuery: String) { storeFilterManager.onSearchQueryChange(newQuery) }
    fun onCategorySearchQueryChange(newQuery: String) { storeFilterManager.onCategorySearchQueryChange(newQuery) }
    fun onCategorySelected(categoryId: String) { storeFilterManager.onCategorySelected(categoryId) }
    fun onSubCategorySelected(subCategory: String) { storeFilterManager.onSubCategorySelected(subCategory) }
    fun onPriceRangeChange(newRange: ClosedFloatingPointRange<Float>) { storeFilterManager.onPriceRangeChange(newRange) }
    fun onSizeToggle(size: String) { storeFilterManager.onSizeToggle(size) }
    fun clearFilters() { storeFilterManager.clearFilters() }
    fun onCampaignSelected(campaign: String?) { storeFilterManager.onCampaignSelected(campaign) }
    fun onStoreSelected(storeId: String?) { storeFilterManager.onStoreSelected(storeId) }

    // Marketplace filter bridges
    fun onMarketplaceSearchQueryChange(newQuery: String) { marketplaceFilterManager.onSearchQueryChange(newQuery) }
    fun onMarketplaceCategorySelected(categoryId: String) { marketplaceFilterManager.onCategorySelected(categoryId) }
    fun onMarketplaceSubCategorySelected(subCategory: String) { marketplaceFilterManager.onSubCategorySelected(subCategory) }
    fun clearMarketplaceFilters() { marketplaceFilterManager.clearFilters() }

    fun onQuickViewProduct(context: Context, product: Product?) {
        _quickViewProductId.value = product?.id
        if (product != null) {
            addToHistory(context, product)
        }
    }

    fun getStores() = productRepository.getStores()
    fun getStoreById(id: String) = productRepository.getStores().find { it.id == id }
    fun getProductsByStore(storeId: String) = productRepository.getProductsByStore(storeId)

    fun getRelatedProducts(product: Product): List<Product> {
        return productRepository.getProductsSync()
            .filter { it.categoryId == product.categoryId && it.id != product.id }
            .shuffled()
            .take(6)
    }

    // Size Management
    fun addSizeSystem(context: Context, name: String) {
        sizeRepository.addSizeSystem(context, name)
    }

    fun deleteSizeSystem(context: Context, systemId: String) {
        sizeRepository.deleteSizeSystem(context, systemId)
    }

    fun addGlobalSizeOption(context: Context, systemId: String, name: String) {
        sizeRepository.addSizeToGlobalSystem(context, systemId, name)
    }

    fun removeGlobalSizeOption(context: Context, systemId: String, optionId: String) {
        sizeRepository.removeSizeFromGlobalSystem(context, systemId, optionId)
    }

    fun addUserCustomSize(context: Context, name: String) {
        val user = UserRepository.currentUser.value
        sizeRepository.addUserCustomSize(context, name, user?.uuid, user?.alias)
    }

    fun deleteUserCustomSize(context: Context, sizeId: String) {
        sizeRepository.deleteUserCustomSize(context, sizeId)
    }

    fun updateClientSize(context: Context, updated: SizeOption) {
        sizeRepository.updateClientSize(context, updated)
    }

    fun isSizeInUse(sizeName: String): Boolean {
        return productRepository.getProductsSync().any { product ->
            product.variants?.any { it.name == sizeName } == true
        }
    }

    fun shareWishlist(context: Context, wishlist: List<Product>) {
        if (wishlist.isEmpty()) {
            Toast.makeText(context, "Tu lista de deseos está vacía", Toast.LENGTH_SHORT).show()
            return
        }

        val shareText = CommunicationsHelper.formatWishlistText(wishlist)
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, shareText)
        }

        context.startActivity(Intent.createChooser(intent, "Compartir lista de deseos"))
    }
}
