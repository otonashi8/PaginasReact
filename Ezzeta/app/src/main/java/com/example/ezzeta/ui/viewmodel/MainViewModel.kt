package com.example.ezzeta.ui.viewmodel

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ezzeta.data.model.*
import com.example.ezzeta.data.repository.*
import com.example.ezzeta.data.service.ContentModerationService
import com.example.ezzeta.data.service.ModerationResult
import com.example.ezzeta.ui.components.FilterManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import com.example.ezzeta.ui.utils.CommunicationsHelper
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class MainViewModel : ViewModel() {
    private val productRepository = ProductRepository()
    private val sizeRepository = SizeRepository()
    private val followRepository = FollowRepository()
    private val shippingRepository = ShippingRepository()
    private val priceRuleRepository = PriceRuleRepository()
    private val abandonedCartRepository = AbandonedCartRepository()
    
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
    val shippingConfig: StateFlow<ShippingConfig> = shippingRepository.config
    val shippingRates: StateFlow<List<ShippingRate>> = shippingRepository.rates
    
    private val _selectedShippingDept = MutableStateFlow("")
    val selectedShippingDept: StateFlow<String> = _selectedShippingDept.asStateFlow()
    val priceRules: StateFlow<List<PriceRule>> = priceRuleRepository.rules
    
    private val _couponInput = MutableStateFlow("")
    val couponInput: StateFlow<String> = _couponInput.asStateFlow()

    private val _statsMode = MutableStateFlow("BOTH") // "EZZETA", "MARKETPLACE", "BOTH"
    val statsMode = _statsMode.asStateFlow()

    private val _statsDateFilter = MutableStateFlow("MONTH") // "TODAY", "WEEK", "MONTH", "CUSTOM"
    val statsDateFilter = _statsDateFilter.asStateFlow()

    private val _statsDimension = MutableStateFlow("PRODUCT") // "PRODUCT", "SIZE", "CATEGORY", "STORE", "SELLER"
    val statsDimension = _statsDimension.asStateFlow()

    private val _ubigeoData = MutableStateFlow<Map<String, Map<String, Map<String, UbigeoDistrict>>>>(emptyMap())
    val ubigeoData: StateFlow<Map<String, Map<String, Map<String, UbigeoDistrict>>>> = _ubigeoData.asStateFlow()
    
    private val _isLoadingUbigeo = MutableStateFlow(false)
    val isLoadingUbigeo: StateFlow<Boolean> = _isLoadingUbigeo.asStateFlow()
    
    private val _ubigeoError = MutableStateFlow<String?>(null)
    val ubigeoError: StateFlow<String?> = _ubigeoError.asStateFlow()
    
    private val _isModerating = MutableStateFlow(false)
    val isModerating: StateFlow<Boolean> = _isModerating.asStateFlow()

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
        products.filter { it.sellerId == userId && it.isClientProduct }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val quickViewProduct: StateFlow<Product?> = _quickViewProductId.map { id ->
        id?.let { productRepository.getProductById(it) }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    // Mantenido por compatibilidad con las pantallas, aunque la carga es instantánea desde el repositorio en memoria.//
    fun prefetchProduct(productId: String) { }

    private val _browsingHistory = MutableStateFlow<List<Product>>(emptyList())
    val browsingHistory: StateFlow<List<Product>> = _browsingHistory.asStateFlow()

    private val _cartItems = MutableStateFlow<List<CartItem>>(emptyList())
    val cartItems: StateFlow<List<CartItem>> = _cartItems.asStateFlow()

    private val _orders = MutableStateFlow<List<Order>>(emptyList())
    val orders: StateFlow<List<Order>> = _orders.asStateFlow()

    val cartItemCount: StateFlow<Int> = _cartItems.map { items ->
        items.sumOf { it.quantity }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val selectedCartItemCount: StateFlow<Int> = _cartItems.map { items ->
        items.filter { it.isSelected }.sumOf { it.quantity }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val totalSavings: StateFlow<Double> = _cartItems.map { items ->
        items.filter { it.isSelected }.sumOf { item ->
            val product = item.product
            if (product.oldPrice != null && product.oldPrice > product.price) {
                (product.oldPrice - product.price) * item.quantity
            } else {
                0.0
            }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val subtotal: StateFlow<Double> = _cartItems.map { items ->
        items.filter { it.isSelected }.sumOf { it.effectivePrice * it.quantity }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    // Descuentos por Reglas de Precios
    val appliedRules: StateFlow<List<AppliedPriceRule>> = combine(_cartItems, priceRules, _couponInput) { items, rules, coupon ->
        // Solo procesar productos EZZETA seleccionados
        val selectedStoreItems = items.filter { it.isSelected && !it.product.isClientProduct }
        if (selectedStoreItems.isEmpty()) return@combine emptyList<AppliedPriceRule>()
        
        // Una regla que requiere cupón solo se activa si el código coincide exactamente
        val activeRules = rules.filter { 
            it.isActive && (!it.requiresCoupon || (it.couponCode != null && it.couponCode.equals(coupon, ignoreCase = true))) 
        }.sortedBy { it.priority }
        
        val applied = mutableListOf<AppliedPriceRule>()
        var storeSubtotal = selectedStoreItems.sumOf { it.effectivePrice * it.quantity }
        
        // Seguimiento de qué items ya tienen descuento para evitar duplicidad según prioridad
        val discountedItemKeys = mutableSetOf<String>()

        activeRules.forEach { rule ->
            var ruleDiscount = 0.0
            
            when (rule.type) {
                PriceRuleType.PRODUCT -> {
                    selectedStoreItems.forEach { item ->
                        val itemKey = "${item.product.id}_${item.size}"
                        if (rule.targetIds.contains(item.product.id) && !discountedItemKeys.contains(itemKey)) {
                            val itemTotal = item.effectivePrice * item.quantity
                            val d = if (rule.isPercentage) itemTotal * (rule.discountValue / 100.0) else rule.discountValue * item.quantity
                            ruleDiscount += d
                            discountedItemKeys.add(itemKey)
                        }
                    }
                }
                PriceRuleType.CATEGORY -> {
                    selectedStoreItems.forEach { item ->
                        val itemKey = "${item.product.id}_${item.size}"
                        if (rule.targetIds.contains(item.product.categoryId) && !discountedItemKeys.contains(itemKey)) {
                            val itemTotal = item.effectivePrice * item.quantity
                            val d = if (rule.isPercentage) itemTotal * (rule.discountValue / 100.0) else rule.discountValue * item.quantity
                            ruleDiscount += d
                            discountedItemKeys.add(itemKey)
                        }
                    }
                }
                PriceRuleType.ORDER_TOTAL -> {
                    // El subtotal mínimo solo cuenta productos EZZETA seleccionados
                    if (rule.minSubtotal == null || storeSubtotal >= rule.minSubtotal) {
                        val d = if (rule.isPercentage) storeSubtotal * (rule.discountValue / 100.0) else rule.discountValue
                        ruleDiscount += d
                    }
                }
                PriceRuleType.COMBO -> {
                    if (rule.finalComboPrice != null && rule.comboRequirements.isNotEmpty()) {
                        // Calcular cuántos combos completos se pueden formar
                        var possibleCombos = Int.MAX_VALUE
                        rule.comboRequirements.forEach { req ->
                            val countInCart = selectedStoreItems.filter { 
                                (req.productId != null && it.product.id == req.productId) || 
                                (req.categoryId != null && it.product.categoryId == req.categoryId)
                            }.sumOf { it.quantity }
                            
                            possibleCombos = minOf(possibleCombos, countInCart / req.quantity)
                        }
                        
                        if (possibleCombos > 0 && possibleCombos != Int.MAX_VALUE) {
                            // Calcular el precio actual del conjunto para el descuento
                            var currentComboSetPrice = 0.0
                            rule.comboRequirements.forEach { req ->
                                var remainingQty = req.quantity * possibleCombos
                                selectedStoreItems.filter { 
                                    (req.productId != null && it.product.id == req.productId) || 
                                    (req.categoryId != null && it.product.categoryId == req.categoryId)
                                }.forEach { item ->
                                    val take = minOf(item.quantity, remainingQty)
                                    currentComboSetPrice += item.effectivePrice * take
                                    remainingQty -= take
                                }
                            }
                            
                            val targetPrice = rule.finalComboPrice * possibleCombos
                            ruleDiscount = (currentComboSetPrice - targetPrice).coerceAtLeast(0.0)
                        }
                    }
                }
            }
            
            if (ruleDiscount > 0) {
                applied.add(AppliedPriceRule(rule.id, rule.name, ruleDiscount))
                // Si es un descuento global, reduce el subtotal para la siguiente regla
                if (rule.type == PriceRuleType.ORDER_TOTAL) {
                    storeSubtotal -= ruleDiscount
                }
            }
        }
        applied
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val totalRulesDiscount: StateFlow<Double> = appliedRules.map { rules ->
        rules.sumOf { it.discountAmount }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val planDiscount: StateFlow<Double> = combine(subtotal, userPlan, totalRulesDiscount) { sub, plan, rulesDisc ->
        val subAfterRules = (sub - rulesDisc).coerceAtLeast(0.0)
        if (plan != null) (subAfterRules * plan.discountPercent / 100.0) else 0.0
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val shippingCost: StateFlow<Double> = combine(subtotal, shippingConfig, shippingRates, _selectedShippingDept) { sub, config, rates, dept ->
        if (sub >= config.freeShippingThreshold) {
            0.0
        } else {
            val specificRate = rates.filter { it.isActive && it.region.equals(dept, ignoreCase = true) }
                .minByOrNull { it.priority }
            
            if (specificRate != null) {
                specificRate.cost
            } else {
                val generalRate = rates.filter { it.isActive && it.region == "GENERAL" }
                    .minByOrNull { it.priority }
                generalRate?.cost ?: 0.0
            }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val total: StateFlow<Double> = combine(subtotal, shippingCost, planDiscount, totalRulesDiscount) { s, sh, d, rd -> 
        (s + sh - d - rd).coerceAtLeast(0.0) 
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)


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

    val recentProducts: StateFlow<List<Product>> = allProducts.map { products ->
        products.filter { it.isVisible }
            .sortedByDescending { it.createdAt }
            .take(10)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val popularProducts: StateFlow<List<Product>> = combine(allProducts, _orders) { products, orders ->
        val salesMap = orders.flatMap { it.items }
            .groupBy { it.product.id }
            .mapValues { entry -> entry.value.sumOf { it.quantity } }

        val visibleProducts = products.filter { it.isVisible }
        
        visibleProducts.sortedWith(
            compareByDescending<Product> { salesMap[it.id] ?: 0 }
                .thenByDescending { it.createdAt }
        ).take(10)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val popularRankingMap: StateFlow<Map<String, String>> = popularProducts.map { popularList ->
        popularList.mapIndexed { index, product ->
            product.id to "#${index + 1} en ventas"
        }.toMap()
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyMap())

    // Estadísticas para Admin
    val ezzetaProductsCount: StateFlow<Int> = allProducts.map { products ->
        products.count { !it.isClientProduct }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val clientProductsCount: StateFlow<Int> = allProducts.map { products ->
        products.count { it.isClientProduct }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val totalSalesValue: StateFlow<Double> = orders.map { orderList ->
        try {
            orderList.filterNotNull().sumOf { it.total }
        } catch (e: Exception) {
            0.0
        }
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

    val marketplaceRequests: StateFlow<List<MarketplaceRequest>> = productRepository.getRequests()

    // Gestión de Clientes (Fase 19)
    val registeredUsers: StateFlow<List<User>> = UserRepository.allUsers
    
    val allCustomers: StateFlow<List<User>> = combine(registeredUsers, _orders) { registered, orders ->
        val registeredIds = registered.map { it.uuid }.toSet()
        val registeredEmails = registered.mapNotNull { it.email?.lowercase() }.toSet()
        
        // Detectar invitados con actividad real
        val guests = orders.filter { order ->
            val isRegistered = order.buyerId in registeredIds || 
                             (order.buyerEmail.isNotBlank() && order.buyerEmail.lowercase() in registeredEmails)
            !isRegistered
        }.groupBy { it.buyerEmail.ifBlank { it.buyerId } }
        .map { (id, guestOrders) ->
            val first = guestOrders.first()
            User(
                uuid = first.buyerId.ifBlank { id },
                alias = first.buyerName.ifBlank { "Invitado" },
                email = first.buyerEmail,
                phone = first.buyerPhone,
                isGuest = true
            )
        }
        
        registered + guests
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun adminCreateUser(context: Context, name: String, email: String, phone: String?, isAdmin: Boolean = false) {
        val newUser = User(
            uuid = java.util.UUID.randomUUID().toString(),
            alias = name,
            email = email,
            phone = phone,
            isGuest = false,
            isAdmin = isAdmin
        )
        UserRepository.adminAddUser(context.applicationContext, newUser)
    }

    fun adminUpdateUser(context: Context, user: User) {
        UserRepository.updateUser(context.applicationContext, user)
    }

    fun adminToggleUserStatus(context: Context, userId: String) {
        val user = registeredUsers.value.find { it.uuid == userId }
        if (user != null) {
            UserRepository.updateUser(context.applicationContext, user.copy(isActive = !user.isActive))
        }
    }

    fun getCustomerOrders(userIdOrEmail: String): List<Order> {
        return _orders.value.filter { 
            it.buyerId == userIdOrEmail || (it.buyerEmail.isNotBlank() && it.buyerEmail == userIdOrEmail)
        }
    }

    // Reactive Stats Engine
    val filteredOrderItems: StateFlow<List<Pair<Order, CartItem>>> = combine(
        _orders, statsMode, statsDateFilter
    ) { allOrders, mode, dateFilter ->
        val sdf = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.US)
        val now = Calendar.getInstance()
        
        allOrders.flatMap { order ->
            val orderDate = try { sdf.parse(order.date) } catch (e: Exception) { null }
            val isDateMatch = when (dateFilter) {
                "TODAY" -> orderDate?.let { isSameDay(it, now.time) } ?: false
                "WEEK" -> orderDate?.let { isSameWeek(it, now.time) } ?: false
                "MONTH" -> orderDate?.let { isSameMonth(it, now.time) } ?: false
                else -> true
            }

            if (!isDateMatch) return@flatMap emptyList<Pair<Order, CartItem>>()

            order.items.filter { item ->
                when (mode) {
                    "EZZETA" -> !item.product.isClientProduct
                    "MARKETPLACE" -> item.product.isClientProduct
                    else -> true
                }
            }.map { order to it }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Abandoned Carts Engine
    val rawAbandonedCarts = abandonedCartRepository.abandonedCarts
    
    val abandonedCarts: StateFlow<List<AbandonedCart>> = rawAbandonedCarts.map { carts ->
        val now = System.currentTimeMillis()
        carts.map { cart ->
            if (cart.status == AbandonedCartStatus.RECUPERADO) return@map cart
            
            val inactiveTime = now - cart.lastActivity
            val thirtyMin = 30 * 60 * 1000L
            val twentyFourHours = 24 * 60 * 60 * 1000L
            
            val newStatus = when {
                inactiveTime >= thirtyMin + twentyFourHours -> AbandonedCartStatus.PERDIDO
                inactiveTime >= thirtyMin -> AbandonedCartStatus.RECUPERABLE
                else -> AbandonedCartStatus.ACTIVE
            }
            
            if (newStatus != cart.status) cart.copy(status = newStatus) else cart
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val abandonedCartKpis: StateFlow<Map<String, Double>> = abandonedCarts.map { carts ->
        val recuperados = carts.count { it.status == AbandonedCartStatus.RECUPERADO }.toDouble()
        val perdidos = carts.count { it.status == AbandonedCartStatus.PERDIDO }.toDouble()
        val recuperables = carts.count { it.status == AbandonedCartStatus.RECUPERABLE }.toDouble()
        
        val ingresosRecuperables = carts.filter { it.status == AbandonedCartStatus.RECUPERABLE }
            .sumOf { it.items.sumOf { item -> item.finalPrice * item.quantity } }
            
        val ingresosRecuperados = carts.filter { it.status == AbandonedCartStatus.RECUPERADO || it.purchasedItems.isNotEmpty() }
            .sumOf { it.purchasedItems.sumOf { item -> item.finalPrice * item.quantity } }
            
        val totalCerrados = recuperados + perdidos
        val tasaRecuperacion = if (totalCerrados > 0) (recuperados / totalCerrados) * 100 else 0.0
        
        mapOf(
            "RECUPERADOS_COUNT" to recuperados,
            "PERDIDOS_COUNT" to perdidos,
            "RECUPERABLES_COUNT" to recuperables,
            "INGRESOS_RECUPERABLES" to ingresosRecuperables,
            "INGRESOS_RECUPERADOS" to ingresosRecuperados,
            "TASA_RECUPERACION" to tasaRecuperacion
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyMap())

    val statsKpis: StateFlow<Map<String, Double>> = filteredOrderItems.map { items ->
        val totalRevenue = items.sumOf { it.second.effectivePrice * it.second.quantity }
        val unitsSold = items.sumOf { it.second.quantity }.toDouble()
        val distinctOrders = items.map { it.first.id }.distinct().size.toDouble()
        val avgTicket = if (distinctOrders > 0) totalRevenue / distinctOrders else 0.0
        
        mapOf(
            "REVENUE" to totalRevenue,
            "UNITS" to unitsSold,
            "ORDERS" to distinctOrders,
            "AVG_TICKET" to avgTicket
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyMap())

    val statsResults: StateFlow<List<StatResult>> = combine(filteredOrderItems, statsDimension) { items, dimension ->
        val grouped = when (dimension) {
            "PRODUCT" -> items.groupBy { it.second.product.id }
            "SIZE" -> items.groupBy { it.second.size }
            "CATEGORY" -> items.groupBy { it.second.product.categoryId }
            "STORE" -> items.groupBy { it.second.product.storeId }
            "SELLER" -> items.groupBy { it.second.product.sellerId ?: "system" }
            else -> items.groupBy { it.second.product.id }
        }

        grouped.map { (key, group) ->
            val firstItem = group.first().second
            val name = when (dimension) {
                "PRODUCT" -> firstItem.product.name
                "SIZE" -> key
                "CATEGORY" -> categories.value.find { it.id == key }?.name ?: key
                "STORE" -> getStoreById(key)?.name ?: key
                "SELLER" -> group.first().second.product.sellerName ?: key
                else -> key
            }
            
            StatResult(
                id = key,
                name = name,
                units = group.sumOf { it.second.quantity },
                revenue = group.sumOf { it.second.effectivePrice * it.second.quantity },
                ordersCount = group.map { it.first.id }.distinct().size,
                imageUrl = if (dimension == "PRODUCT") firstItem.product.imageUrl else null
            )
        }.sortedByDescending { it.revenue }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Rankings
    val topSpenders: StateFlow<List<CustomerStat>> = _orders.map { allOrders ->
        allOrders.groupBy { it.buyerId.ifBlank { it.buyerEmail } }
            .map { (id, orders) ->
                CustomerStat(
                    id = id,
                    name = orders.first().buyerName,
                    email = orders.first().buyerEmail,
                    totalValue = orders.sumOf { it.total },
                    count = orders.size
                )
            }.sortedByDescending { it.totalValue }.take(10)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val topSellers: StateFlow<List<CustomerStat>> = _orders.map { allOrders ->
        try {
            allOrders.flatMap { order -> 
                order.items?.filter { it?.product != null && it.product.isClientProduct }?.map { order to it } ?: emptyList()
            }
            .groupBy { it.second.product.sellerId ?: "unknown" }
            .map { (id, items) ->
                CustomerStat(
                    id = id,
                    name = items.first().second.product.sellerName ?: "Vendedor",
                    email = "",
                    totalValue = items.sumOf { it.second.effectivePrice * it.second.quantity },
                    count = items.sumOf { it.second.quantity }
                )
            }.sortedByDescending { it.totalValue }.take(10)
        } catch (e: Exception) {
            emptyList()
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private fun isSameDay(d1: Date, d2: Date): Boolean {
        val cal1 = Calendar.getInstance().apply { time = d1 }
        val cal2 = Calendar.getInstance().apply { time = d2 }
        return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) && 
               cal1.get(Calendar.DAY_OF_YEAR) == cal2.get(Calendar.DAY_OF_YEAR)
    }

    private fun isSameWeek(d1: Date, d2: Date): Boolean {
        val cal1 = Calendar.getInstance().apply { time = d1 }
        val cal2 = Calendar.getInstance().apply { time = d2 }
        return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) && 
               cal1.get(Calendar.WEEK_OF_YEAR) == cal2.get(Calendar.WEEK_OF_YEAR)
    }

    private fun isSameMonth(d1: Date, d2: Date): Boolean {
        val cal1 = Calendar.getInstance().apply { time = d1 }
        val cal2 = Calendar.getInstance().apply { time = d2 }
        return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) && 
               cal1.get(Calendar.MONTH) == cal2.get(Calendar.MONTH)
    }

    val userFollows: StateFlow<List<UserFollow>> = followRepository.follows

    val mySales: StateFlow<List<Pair<Order, CartItem>>> = combine(_orders, currentUser) { allOrders, user ->
        val userId = user?.uuid ?: ""
        val sales = mutableListOf<Pair<Order, CartItem>>()
        allOrders.forEach { order ->
            order.items.forEach { item ->
                if (item.product.sellerId == userId && item.product.isClientProduct) {
                    sales.add(order to item)
                }
            }
        }
        sales
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun initUser(context: Context) {
        val appContext = context.applicationContext
        viewModelScope.launch {
            try {
                withContext(Dispatchers.IO) {
                    UserRepository.init(appContext)
                    sizeRepository.init(appContext)
                    followRepository.init(appContext)
                    shippingRepository.init(appContext)
                    priceRuleRepository.init(appContext)
                    abandonedCartRepository.init(appContext)
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
        if (current == null || current.isGuest) {
            Toast.makeText(context, "Inicia sesión para seguir tiendas", Toast.LENGTH_SHORT).show()
            return
        }
        
        // Usar FollowRepository para el seguimiento real y contadores
        val isNowFollowing = followRepository.toggleFollow(context.applicationContext, current.uuid, storeId, "STORE")
        
        // Sincronizar con el modelo User por compatibilidad
        val followed = current.followedStoreIds.toMutableSet()
        if (isNowFollowing) followed.add(storeId)
        else followed.remove(storeId)
        
        UserRepository.updateUser(context, current.copy(followedStoreIds = followed))
    }

    fun toggleFollowUser(context: Context, sellerId: String) {
        val current = currentUser.value ?: return
        if (current.isGuest) {
            Toast.makeText(context, "Inicia sesión para seguir vendedores", Toast.LENGTH_SHORT).show()
            return
        }
        if (current.uuid == sellerId) {
            Toast.makeText(context, "No puedes seguirte a ti mismo", Toast.LENGTH_SHORT).show()
            return
        }
        
        followRepository.toggleFollow(context.applicationContext, current.uuid, sellerId, "SELLER")
    }

    fun getFollowerCount(sellerId: String): Int = followRepository.getFollowerCount(sellerId, "SELLER")
    
    fun isFollowingUser(sellerId: String): Boolean {
        val current = currentUser.value ?: return false
        return followRepository.isFollowing(current.uuid, sellerId, "SELLER")
    }

    fun getStoreFollowerCount(storeId: String): Int = followRepository.getFollowerCount(storeId, "STORE")
    
    fun isFollowingStore(storeId: String): Boolean {
        val current = currentUser.value ?: return false
        return followRepository.isFollowing(current.uuid, storeId, "STORE")
    }

    fun getProductsBySeller(sellerId: String): List<Product> {
        return allProducts.value.filter { it.sellerId == sellerId && it.isVisible && it.isClientProduct }
    }

    fun addToHistory(context: Context, product: Product) {
        val current = _browsingHistory.value.toMutableList()
        current.removeAll { it.id == product.id }
        
        // Crear copia con el timestamp de visualización (metadato de historial)
        val historyEntry = product.copy(lastViewedAt = System.currentTimeMillis())
        current.add(0, historyEntry)
        
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
        syncAbandonedCart(context)
    }

    fun updateCartItemQuantity(context: Context, productId: String, size: String, delta: Int) {
        val current = _cartItems.value.toMutableList()
        val index = current.indexOfFirst { it.product.id == productId && it.size == size }
        if (index != -1) {
            val item = current[index]
            val maxStock = item.product.getStockForSize(size)
            val newQuantity = item.quantity + delta
            
            if (newQuantity > maxStock && delta > 0) {
                Toast.makeText(context, "Stock máximo alcanzado ($maxStock)", Toast.LENGTH_SHORT).show()
                return
            }

            if (newQuantity > 0) {
                current[index] = item.copy(quantity = newQuantity)
            } else {
                current.removeAt(index)
            }
            
            _cartItems.value = current
            PersistenceManager.saveCart(context, current)
            syncAbandonedCart(context)
        }
    }

    fun updateCartItemSize(context: Context, productId: String, oldSize: String, newSize: String) {
        if (oldSize == newSize) return
        val current = _cartItems.value.toMutableList()
        val index = current.indexOfFirst { it.product.id == productId && it.size == oldSize }
        if (index != -1) {
            val itemToUpdate = current[index]
            val maxStock = itemToUpdate.product.getStockForSize(newSize)
            
            if (maxStock <= 0) {
                Toast.makeText(context, "Talla $newSize sin stock", Toast.LENGTH_SHORT).show()
                return
            }
            
            val targetIndex = current.indexOfFirst { it.product.id == productId && it.size == newSize }
            if (targetIndex != -1) {
                // Combinar cantidades si ya existe la talla, respetando el stock
                val existingItem = current[targetIndex]
                val combinedQuantity = (existingItem.quantity + itemToUpdate.quantity).coerceAtMost(maxStock)
                current[targetIndex] = existingItem.copy(quantity = combinedQuantity)
                current.removeAt(index)
            } else {
                current[index] = itemToUpdate.copy(size = newSize, quantity = itemToUpdate.quantity.coerceAtMost(maxStock))
            }
            _cartItems.value = current
            PersistenceManager.saveCart(context, current)
            syncAbandonedCart(context)
        }
    }

    fun toggleCartItemSelection(context: Context, productId: String, size: String, isSelected: Boolean) {
        val current = _cartItems.value.toMutableList()
        val index = current.indexOfFirst { it.product.id == productId && it.size == size }
        if (index != -1) {
            current[index] = current[index].copy(isSelected = isSelected)
            _cartItems.value = current
            PersistenceManager.saveCart(context, current)
            // La selección también es actividad
            syncAbandonedCart(context)
        }
    }

    fun toggleSellerSelection(context: Context, storeId: String, isSelected: Boolean) {
        val current = _cartItems.value.map { item ->
            if (item.product.storeId == storeId) item.copy(isSelected = isSelected) else item
        }
        _cartItems.value = current
        PersistenceManager.saveCart(context, current)
    }

    fun toggleAllCartItems(context: Context, isSelected: Boolean) {
        val current = _cartItems.value.map { it.copy(isSelected = isSelected) }
        _cartItems.value = current
        PersistenceManager.saveCart(context, current)
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
            syncAbandonedCart(context)
        }
    }

    fun undoLastDelete(context: Context) {
        val item = _lastDeletedItem.value ?: return
        val current = _cartItems.value.toMutableList()
        current.add(item)
        _cartItems.value = current
        _lastDeletedItem.value = null
        PersistenceManager.saveCart(context, current)
        syncAbandonedCart(context)
    }

    fun getMarketplaceRequestById(id: String): MarketplaceRequest? = 
        productRepository.getRequests().value.find { it.id == id }

    fun dismissOrderSuccessAlert() {
        _showOrderSuccessAlert.value = false
    }

    fun simulateNextOrderStatus(context: Context, orderId: String) {
        val user = currentUser.value ?: return
        val currentOrders = _orders.value.toMutableList()
        val index = currentOrders.indexOfFirst { it.id == orderId }
        
        if (index != -1) {
            val order = currentOrders[index]
            
            // Validar propiedad
            if (order.buyerId != user.uuid) return
            
            val nextStatus = when (order.orderStatus) {
                "PROCESANDO" -> "ENVIANDO"
                "ENVIANDO" -> "RECIBIDO"
                else -> order.orderStatus
            }
            
            if (nextStatus != order.orderStatus) {
                currentOrders[index] = order.copy(orderStatus = nextStatus)
                _orders.value = currentOrders
                PersistenceManager.saveOrders(context, currentOrders)
            }
        }
    }

    fun clearLastDeletedItem() {
        _lastDeletedItem.value = null
    }

    fun checkout(
        context: Context,
        name: String, email: String, phone: String,
        address: String, dept: String, prov: String, dist: String
    ) {
        val allItems = _cartItems.value
        val selectedItems = allItems.filter { it.isSelected }
        
        if (selectedItems.isEmpty()) return
        
        val newOrder = Order(
            id = "ORD-${java.util.UUID.randomUUID().toString().take(8).uppercase()}",
            date = java.text.SimpleDateFormat("dd/MM/yyyy HH:mm", java.util.Locale.getDefault()).format(java.util.Date()),
            items = selectedItems,
            total = total.value,
            buyerId = currentUser.value?.uuid ?: "",
            buyerName = name,
            buyerEmail = email,
            buyerPhone = phone,
            shippingAddress = address,
            shippingDept = dept,
            shippingProv = prov,
            shippingDist = dist,
            status = OrderStatus.PAID
        )
        
        // Reducir stock real en el repositorio SOLO de los seleccionados
        selectedItems.forEach { item ->
            val product = productRepository.getProductById(item.product.id) ?: item.product
            if (product.useStockBySize && !product.variants.isNullOrEmpty()) {
                val updatedVariants = product.variants.map { v ->
                    if (v.name == item.size) v.copy(stock = (v.stock - item.quantity).coerceAtLeast(0))
                    else v
                }
                productRepository.updateProduct(context.applicationContext, product.copy(
                    variants = updatedVariants, 
                    stock = updatedVariants.sumOf { it.stock }
                ))
            } else {
                productRepository.updateProduct(context.applicationContext, product.copy(
                    stock = (product.stock - item.quantity).coerceAtLeast(0)
                ))
            }
        }
        
        val updatedOrders = listOf(newOrder) + _orders.value
        _orders.value = updatedOrders
        
        // Notificar al repositorio de carritos abandonados la compra
        abandonedCartRepository.markItemsAsPurchased(
            context = context,
            purchasedItemKeys = selectedItems.map { "${it.product.id}_${it.size}" },
            user = currentUser.value
        )
        
        // Mantener en la cesta únicamente los que NO estaban seleccionados
        val remainingItems = allItems.filter { !it.isSelected }
        _cartItems.value = remainingItems
        
        PersistenceManager.saveOrders(context, updatedOrders)
        PersistenceManager.saveCart(context, remainingItems)
        
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
        sizeSystemId: String? = null,
        usePriceBySize: Boolean = false,
        useStockBySize: Boolean = false
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
            Configuración: ${if (usePriceBySize) "Precio por talla [ON]" else "Precio general"}, ${if (useStockBySize) "Stock por talla [ON]" else "Stock general"}
            
            --- VARIANTES/PRECIOS/STOCK ---
            ${variants?.joinToString("\n") { "${it.name}: S/ ${it.price} (Stock: ${it.stock})" } ?: "Sin variantes"}

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
        publishClientProduct(context.applicationContext, name, price, categoryId, subCategories, condition, description, imageUrls, contactName, stock, variants, sizeSystemId, usePriceBySize, useStockBySize)
    }

    fun uploadSingleProductViaWhatsApp(
        context: Context,
        name: String, price: Double, categoryId: String,
        subCategories: List<String>,
        condition: String, description: String, imageUrls: List<String>,
        stock: Int, contactName: String, contactPhone: String,
        variants: List<ProductVariant>? = null,
        sizeSystemId: String? = null,
        usePriceBySize: Boolean = false,
        useStockBySize: Boolean = false
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
            *Configuración:* ${if (usePriceBySize) "Precio variable" else "Precio único"}, ${if (useStockBySize) "Stock variable" else "Stock único"}
            
            *Variantes:* ${variants?.size ?: 0} variantes añadidas.
            
            *Vendedor:* $contactName
            *Teléfono:* $contactPhone
            
            *Descripción:* $description
            
            *Imágenes:* ${imageUrls.size} fotos proporcionadas.
        """.trimIndent()

        CommunicationsHelper.sendWhatsApp(context, "51987654321", text)
        
        // Publicar localmente
        publishClientProduct(appContext, name, price, categoryId, subCategories, condition, description, imageUrls, contactName, stock, variants, sizeSystemId, usePriceBySize, useStockBySize)
    }

    private fun publishClientProduct(
        context: Context,
        name: String, price: Double, categoryId: String,
        subCategories: List<String>,
        condition: String, description: String, imageUrls: List<String>,
        sellerName: String, stock: Int,
        variants: List<ProductVariant>? = null,
        sizeSystemId: String? = null,
        usePriceBySize: Boolean = false,
        useStockBySize: Boolean = false
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
            sizeSystemId = sizeSystemId,
            usePriceBySize = usePriceBySize,
            useStockBySize = useStockBySize,
            createdAt = System.currentTimeMillis()
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

    fun addProduct(context: Context, product: Product) {
        productRepository.addProduct(context.applicationContext, product)
    }

    fun updateProduct(context: Context, product: Product) {
        val user = currentUser.value
        if (product.isClientProduct && product.sellerId != user?.uuid) {
            Toast.makeText(context, "No tienes permiso para editar este producto", Toast.LENGTH_SHORT).show()
            return
        }
        
        viewModelScope.launch {
            _isModerating.value = true
            val moderationResult = validateProductContent(product)
            _isModerating.value = false
            
            when (moderationResult) {
                is ModerationResult.Allowed -> {
                    productRepository.updateProduct(context.applicationContext, product)
                }
                is ModerationResult.Blocked -> {
                    Toast.makeText(context, moderationResult.reason, Toast.LENGTH_LONG).show()
                }
                is ModerationResult.Error -> {
                    Toast.makeText(context, "Error de validación. Intente de nuevo.", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private suspend fun validateProductContent(product: Product): ModerationResult {

        val nameResult = ContentModerationService.validateContent(product.name)
        if (nameResult !is ModerationResult.Allowed) return nameResult

        val descResult = ContentModerationService.validateContent(product.description)
        if (descResult !is ModerationResult.Allowed) return descResult


        product.variants?.forEach { variant ->
            val variantResult = ContentModerationService.validateContent(variant.name)
            if (variantResult !is ModerationResult.Allowed) return variantResult
        }
        
        product.customSizes?.forEach { size ->
            val sizeResult = ContentModerationService.validateContent(size)
            if (sizeResult !is ModerationResult.Allowed) return sizeResult
        }

        return ModerationResult.Allowed
    }

    fun sendMarketplaceRequest(
        context: Context,
        product: Product,
        onResult: (Boolean) -> Unit = {}
    ) {
        viewModelScope.launch {
            _isModerating.value = true
            val moderationResult = validateProductContent(product)
            _isModerating.value = false

            when (moderationResult) {
                is ModerationResult.Allowed -> {
                    val user = currentUser.value
                    val request = MarketplaceRequest(
                        id = "REQ_${System.currentTimeMillis()}",
                        userId = user?.uuid ?: "unknown",
                        userName = user?.alias ?: "Usuario",
                        product = product,
                        status = RequestStatus.PENDING
                    )
                    productRepository.addRequest(context.applicationContext, request)
                    onResult(true)
                }
                is ModerationResult.Blocked -> {
                    Toast.makeText(context, moderationResult.reason, Toast.LENGTH_LONG).show()
                    onResult(false)
                }
                is ModerationResult.Error -> {
                    Toast.makeText(context, "Error de validación. Intente de nuevo.", Toast.LENGTH_SHORT).show()
                    onResult(false)
                }
            }
        }
    }

    fun approveMarketplaceRequest(context: Context, requestId: String) {
        val request = productRepository.getRequests().value.find { it.id == requestId }
        if (request != null && request.status == RequestStatus.PENDING) {
            viewModelScope.launch {
                _isModerating.value = true
                val moderationResult = validateProductContent(request.product)
                _isModerating.value = false

                if (moderationResult is ModerationResult.Allowed) {
                    val approvedRequest = request.copy(status = RequestStatus.APPROVED)
                    productRepository.updateRequest(context.applicationContext, approvedRequest)
                    
                    // Publicar el producto oficialmente
                    val productToPublish = request.product.copy(isVisible = true)
                    productRepository.addProduct(context.applicationContext, productToPublish)
                    
                    Toast.makeText(context, "Solicitud aprobada y producto publicado", Toast.LENGTH_SHORT).show()
                } else if (moderationResult is ModerationResult.Blocked) {
                    Toast.makeText(context, "No se puede aprobar: " + moderationResult.reason, Toast.LENGTH_LONG).show()
                } else {
                    Toast.makeText(context, "Error de validación al aprobar. Intente de nuevo.", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    fun rejectMarketplaceRequest(context: Context, requestId: String) {
        val request = productRepository.getRequests().value.find { it.id == requestId }
        if (request != null && request.status == RequestStatus.PENDING) {
            val rejectedRequest = request.copy(status = RequestStatus.REJECTED)
            productRepository.updateRequest(context.applicationContext, rejectedRequest)
            Toast.makeText(context, "Solicitud rechazada", Toast.LENGTH_SHORT).show()
        }
    }

    fun deleteProduct(context: Context, productId: String) {
        productRepository.deleteProduct(context.applicationContext, productId)
    }

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

    fun setShippingThreshold(context: Context, threshold: Double) {
        shippingRepository.updateConfig(context.applicationContext, ShippingConfig(threshold))
    }

    fun addShippingRate(context: Context, region: String, cost: Double, priority: Int) {
        val newRate = ShippingRate(
            id = "ship_${System.currentTimeMillis()}",
            region = region,
            cost = cost,
            priority = priority,
            isActive = true
        )
        shippingRepository.addRate(context.applicationContext, newRate)
    }

    fun updateShippingRate(context: Context, rate: ShippingRate) {
        shippingRepository.updateRate(context.applicationContext, rate)
    }

    fun deleteShippingRate(context: Context, rateId: String) {
        shippingRepository.deleteRate(context.applicationContext, rateId)
    }

    fun onShippingDeptChanged(dept: String) {
        _selectedShippingDept.value = dept
    }

    fun setStatsMode(mode: String) { _statsMode.value = mode }
    fun setStatsDateFilter(filter: String) { _statsDateFilter.value = filter }
    fun setStatsDimension(dim: String) { _statsDimension.value = dim }

    private fun syncAbandonedCart(context: Context) {
        abandonedCartRepository.syncCartSnapshot(context, _cartItems.value, currentUser.value)
    }


    private val _couponValidationMessage = MutableStateFlow<String?>(null)
    val couponValidationMessage = _couponValidationMessage.asStateFlow()

    fun onCouponInputChanged(input: String) {
        _couponInput.value = input.uppercase()
        _couponValidationMessage.value = null
    }

    fun applyCoupon(code: String) {
        if (code.isBlank()) {
            _couponInput.value = ""
            _couponValidationMessage.value = null
            return
        }
        val rule = priceRules.value.find { 
            it.isActive && it.requiresCoupon && it.couponCode.equals(code, ignoreCase = true) 
        }
        
        if (rule != null) {
            _couponInput.value = code.uppercase()
            _couponValidationMessage.value = "Cupón aplicado: ${rule.name}"
        } else {
            _couponValidationMessage.value = "Cupón inválido o inactivo"
        }
    }

    fun removeCoupon() {
        _couponInput.value = ""
        _couponValidationMessage.value = null
    }

    fun addPriceRule(context: Context, rule: PriceRule) {
        priceRuleRepository.addRule(context.applicationContext, rule)
    }

    fun updatePriceRule(context: Context, rule: PriceRule) {
        priceRuleRepository.updateRule(context.applicationContext, rule)
    }

    fun deletePriceRule(context: Context, ruleId: String) {
        priceRuleRepository.deleteRule(context.applicationContext, ruleId)
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
