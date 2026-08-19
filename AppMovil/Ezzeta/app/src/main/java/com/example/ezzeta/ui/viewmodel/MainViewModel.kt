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
import com.example.ezzeta.ui.utils.ImageUtils
import com.example.ezzeta.ui.utils.SecurityUtils
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
    private val customerFormRepository = CustomerFormRepository
    private val blockedWordRepository = BlockedWordRepository
    private val marketplaceReportRepository = MarketplaceReportRepository
    private val homeBannerRepository = HomeBannerRepository
    private val popupRepository = AppPopupRepository
    
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

    private val _statsDimension = MutableStateFlow("PRODUCT") // "PRODUCT", "PRODUCT_UNIQUE", "SIZE", "CATEGORY", "STORE", "SELLER"
    val statsDimension = _statsDimension.asStateFlow()

    private val _statsSearchQuery = MutableStateFlow("")
    val statsSearchQuery = _statsSearchQuery.asStateFlow()

    private val _ubigeoData = MutableStateFlow<Map<String, Map<String, Map<String, UbigeoDistrict>>>>(emptyMap())
    val ubigeoData: StateFlow<Map<String, Map<String, Map<String, UbigeoDistrict>>>> = _ubigeoData.asStateFlow()
    
    private val _isLoadingUbigeo = MutableStateFlow(false)
    val isLoadingUbigeo: StateFlow<Boolean> = _isLoadingUbigeo.asStateFlow()
    
    private val _ubigeoError = MutableStateFlow<String?>(null)
    val ubigeoError: StateFlow<String?> = _ubigeoError.asStateFlow()
    
    private val _isModerating = MutableStateFlow(false)
    val isModerating: StateFlow<Boolean> = _isModerating.asStateFlow()

    // Reorganización del Panel Administrativo
    private val _adminGroupsExpanded = MutableStateFlow<Map<String, Boolean>>(emptyMap())
    val adminGroupsExpanded: StateFlow<Map<String, Boolean>> = _adminGroupsExpanded.asStateFlow()

    val marketplaceReports: StateFlow<List<MarketplaceReport>> = marketplaceReportRepository.reports

    val homeBanners: StateFlow<List<HomeBanner>> = homeBannerRepository.banners

    val appPopups: StateFlow<List<AppPopup>> = popupRepository.popups
    
    // Estado de sesión para popups (ID del popup -> Booleano)
    private val _shownPopupsInSession = MutableStateFlow<Map<String, Boolean>>(emptyMap())
    
    private val _activePopup = MutableStateFlow<AppPopup?>(null)
    val activePopup: StateFlow<AppPopup?> = _activePopup.asStateFlow()

    val allProducts: StateFlow<List<Product>> = productRepository.getProducts()

    data class CartSummary(
        val subtotal: Double = 0.0,
        val totalSavings: Double = 0.0,
        val appliedRules: List<AppliedPriceRule> = emptyList(),
        val totalRulesDiscount: Double = 0.0,
        val planDiscount: Double = 0.0,
        val shippingCost: Double = 0.0,
        val total: Double = 0.0,
        val selectedCount: Int = 0,
        val totalCount: Int = 0
    )

    data class FollowedUserInfo(
        val id: String,
        val alias: String,
        val profileImageUrl: String?,
        val followerCount: Int,
        val hasMarketplaceProducts: Boolean
    )

    data class FollowedStoreInfo(
        val id: String,
        val name: String,
        val logoUrl: String,
        val followerCount: Int
    )

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
        isClientProductFilter = false,
        getEffectivePrice = { product -> getProductPriceInfo(product).finalPrice }
    )

    // Gestor de Filtros Marketplace
    val marketplaceFilterManager = FilterManager(
        allProducts = allProducts,
        scope = viewModelScope,
        isClientProductFilter = true,
        getEffectivePrice = { product -> getProductPriceInfo(product).finalPrice }
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
        val userAlias = user?.alias ?: ""
        products.filter { 
            it.isClientProduct && (
                it.sellerId == userId || 
                (it.sellerId.isNullOrBlank() && it.sellerName == userAlias && userAlias.isNotBlank()) ||
                (it.sellerName == userAlias && userAlias.isNotBlank()) // Recuperación más agresiva por alias para productos antiguos
            )
        }
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

    val cartSummary: StateFlow<CartSummary> = combine(
        _cartItems,
        priceRules,
        _couponInput,
        userPlan,
        shippingConfig,
        shippingRates,
        _selectedShippingDept
    ) { args ->
        val items = args[0] as List<CartItem>
        val rules = args[1] as List<PriceRule>
        val coupon = args[2] as String
        val plan = args[3] as AdvantagePlan?
        val config = args[4] as ShippingConfig
        val rates = args[5] as List<ShippingRate>
        val dept = args[6] as String

        val validItems = items.filter { it.product != null }
        val selectedItems = validItems.filter { it.isSelected }
        val selectedStoreItems = selectedItems.filter { !it.product.isClientProduct }
        
        val totalCount = validItems.sumOf { it.quantity }
        val selectedCount = selectedItems.sumOf { it.quantity }
        
        val subtotal = selectedItems.sumOf { (it.effectivePrice * it.quantity) }.let { if (it.isNaN()) 0.0 else it }
        
        val totalSavings = selectedItems.sumOf { item ->
            val product = item.product
            if (product.oldPrice != null && product.oldPrice > product.price) {
                (product.oldPrice - product.price) * item.quantity
            } else 0.0
        }.let { if (it.isNaN()) 0.0 else it }

        if (selectedStoreItems.isEmpty()) {
            val sCost = if (subtotal > 0) calculateShipping(subtotal, config, rates, dept) else 0.0
            return@combine CartSummary(
                subtotal = subtotal,
                totalSavings = totalSavings,
                shippingCost = sCost,
                total = (subtotal + sCost).coerceAtLeast(0.0),
                selectedCount = selectedCount,
                totalCount = totalCount
            )
        }

        // 1. Reglas de Precios
        val pricingResult = calculateBestPricing(selectedStoreItems, rules, coupon)
        val rulesDisc = pricingResult.totalDiscount
        
        // 2. Descuento de Plan (Se aplica sobre el subtotal de tienda tras reglas)
        val storeSubtotal = selectedStoreItems.sumOf { it.effectivePrice * it.quantity }
        val subAfterRules = (storeSubtotal - rulesDisc).coerceAtLeast(0.0)
        val pDiscount = if (plan != null) (subAfterRules * plan.discountPercent / 100.0) else 0.0
        
        // 3. Envío (Se calcula sobre el subtotal bruto del carrito seleccionado)
        val sCost = calculateShipping(subtotal, config, rates, dept)
        
        val finalTotal = (subtotal + sCost - rulesDisc - pDiscount).coerceAtLeast(0.0)
        
        CartSummary(
            subtotal = subtotal,
            totalSavings = totalSavings,
            appliedRules = pricingResult.appliedRules,
            totalRulesDiscount = rulesDisc,
            planDiscount = pDiscount,
            shippingCost = sCost,
            total = finalTotal,
            selectedCount = selectedCount,
            totalCount = totalCount
        )
    }.flowOn(Dispatchers.Default)
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), CartSummary())

    private fun calculateShipping(sub: Double, config: ShippingConfig, rates: List<ShippingRate>, dept: String): Double {
        if (sub >= config.freeShippingThreshold) return 0.0
        val specificRate = rates.filter { it.isActive && it.region.equals(dept, ignoreCase = true) }
            .minByOrNull { it.priority }
        
        return if (specificRate != null) {
            specificRate.cost
        } else {
            val generalRate = rates.filter { it.isActive && it.region == "GENERAL" }
                .minByOrNull { it.priority }
            generalRate?.cost ?: 0.0
        }
    }

    // Mantener compatibilidad con pantallas existentes redirigiendo al summary central
    val subtotal: StateFlow<Double> = cartSummary.map { it.subtotal }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)
    val totalSavings: StateFlow<Double> = cartSummary.map { it.totalSavings }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)
    val appliedRules: StateFlow<List<AppliedPriceRule>> = cartSummary.map { it.appliedRules }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val totalRulesDiscount: StateFlow<Double> = cartSummary.map { it.totalRulesDiscount }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)
    val planDiscount: StateFlow<Double> = cartSummary.map { it.planDiscount }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)
    val shippingCost: StateFlow<Double> = cartSummary.map { it.shippingCost }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)
    val total: StateFlow<Double> = cartSummary.map { it.total }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)
    val selectedCartItemCount: StateFlow<Int> = cartSummary.map { it.selectedCount }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)


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
        products.filter { it.isVisible && !it.isClientProduct }
            .sortedByDescending { it.createdAt }
            .take(10)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val popularProducts: StateFlow<List<Product>> = combine(allProducts, _orders) { products, orders ->
        val salesMap = orders.flatMap { it.items }
            .groupBy { it.product.id }
            .mapValues { entry -> entry.value.sumOf { it.quantity } }

        val visibleProducts = products.filter { it.isVisible && !it.isClientProduct }
        
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

    data class ProductActivity(
        val rankingText: String? = null,
        val wishlistCount: Int = 0,
        val salesCount: Int = 0
    )

    private val _wishlistCounts = MutableStateFlow<Map<String, Int>>(emptyMap())
    
    val productActivityMap: StateFlow<Map<String, ProductActivity>> = combine(
        allProducts,
        _orders,
        categories,
        _wishlistCounts
    ) { args ->
        val products = args[0] as List<Product>
        val orders = args[1] as List<Order>
        val cats = args[2] as List<Category>
        val wishCounts = args[3] as Map<String, Int>

        val activityMap = mutableMapOf<String, ProductActivity>()
        
        // 1. Calcular Ventas por Producto (Unidades en estados válidos)
        val salesMap = orders.filter { order ->
            order.status == OrderStatus.PAID || 
            order.status == OrderStatus.SHIPPED || 
            order.status == OrderStatus.DELIVERED
        }.flatMap { it.items }
            .groupBy { it.product.id }
            .mapValues { entry -> entry.value.sumOf { it.quantity } }

        // 2. Poblar ventas y wishlist para TODOS los productos
        products.forEach { product ->
            activityMap[product.id] = ProductActivity(
                wishlistCount = wishCounts[product.id] ?: 0,
                salesCount = salesMap[product.id] ?: 0
            )
        }

        // 3. Añadir Ranking por Categoría (Solo EZZETA)
        val ezzetaProducts = products.filter { !it.isClientProduct }
        
        cats.forEach { cat ->
            val catProducts = ezzetaProducts.filter { it.categoryIds.contains(cat.id) || it.categoryId == cat.id }
            val ranked = catProducts.map { p ->
                val sales = salesMap[p.id] ?: 0
                Triple(p.id, sales, p.name)
            }.filter { it.second > 0 } // Solo rankeamos si tiene ventas
            .sortedWith(compareByDescending<Triple<String, Int, String>> { it.second }.thenBy { it.third }.thenBy { it.first })
            
            ranked.forEachIndexed { index, (id, _, _) ->
                val current = activityMap[id] ?: ProductActivity()
                activityMap[id] = current.copy(rankingText = "#${index + 1} en ${cat.name}")
            }
        }
        
        activityMap
    }.flowOn(Dispatchers.Default)
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyMap())

    fun refreshWishlistCounts(context: Context) {
        viewModelScope.launch(Dispatchers.IO) {
            val counts = PersistenceManager.getAllWishlistCounts(context)
            _wishlistCounts.value = counts
        }
    }

    data class ProductPriceInfo(
        val originalPrice: Double,
        val finalPrice: Double,
        val hasCombo: Boolean = false,
        val discountPercent: Int = 0
    )

    fun getProductPriceInfo(product: Product, size: String = ""): ProductPriceInfo {
        val originalPrice = product.getPriceForSize(size)
        if (product.isClientProduct) return ProductPriceInfo(originalPrice, originalPrice)

        // Evaluar mejor escenario para 1 unidad de este producto
        val tempItem = CartItem(product, 1, size)
        val result = calculateBestPricing(listOf(tempItem), priceRules.value, _couponInput.value)
        
        val finalPrice = result.finalPrice
        
        // Determinar si es parte de un combo para mostrar el badge informativo
        // Aunque no se aplique el descuento por falta de cantidad, mostramos el badge
        val isPartOfActiveCombo = priceRules.value.any { rule ->
            rule.isActive && rule.type == PriceRuleType.COMBO && rule.comboRequirements.any { req ->
                (req.productId != null && req.productId == product.id) ||
                (req.categoryId != null && (product.categoryIds.contains(req.categoryId) || product.categoryId == req.categoryId))
            }
        }

        val discountPercent = if (originalPrice > 0) {
            (((originalPrice - finalPrice) / originalPrice) * 100).toInt()
        } else 0

        return ProductPriceInfo(
            originalPrice = originalPrice,
            finalPrice = finalPrice,
            hasCombo = isPartOfActiveCombo,
            discountPercent = discountPercent
        )
    }

    // Lógica Central de Precios
    data class PricingScenarioResult(
        val appliedRules: List<AppliedPriceRule>,
        val totalDiscount: Double,
        val finalPrice: Double
    )

    private fun evaluatePricingScenario(
        items: List<CartItem>,
        rules: List<PriceRule>
    ): PricingScenarioResult {
        val ezzetaItems = items.filter { !it.product.isClientProduct }
        if (ezzetaItems.isEmpty()) return PricingScenarioResult(emptyList(), 0.0, 0.0)

        // Precios unitarios actuales para aplicación secuencial
        val currentUnitPrices = ezzetaItems.map { it.effectivePrice }.toMutableList()
        val applied = mutableListOf<AppliedPriceRule>()
        var totalDiscount = 0.0

        rules.sortedBy { it.priority }.forEach { rule ->
            var ruleDiscount = 0.0
            
            when (rule.type) {
                PriceRuleType.PRODUCT -> {
                    ezzetaItems.forEachIndexed { index, item ->
                        if (rule.targetIds.contains(item.product.id)) {
                            val currentPrice = currentUnitPrices[index]
                            val d = if (rule.isPercentage) currentPrice * (rule.discountValue / 100.0) else rule.discountValue
                            ruleDiscount += d * item.quantity
                            currentUnitPrices[index] = (currentPrice - d).coerceAtLeast(0.0)
                        }
                    }
                }
                PriceRuleType.CATEGORY -> {
                    ezzetaItems.forEachIndexed { index, item ->
                        if (rule.targetIds.any { it in item.product.categoryIds || it == item.product.categoryId }) {
                            val currentPrice = currentUnitPrices[index]
                            val d = if (rule.isPercentage) currentPrice * (rule.discountValue / 100.0) else rule.discountValue
                            ruleDiscount += d * item.quantity
                            currentUnitPrices[index] = (currentPrice - d).coerceAtLeast(0.0)
                        }
                    }
                }
                PriceRuleType.ORDER_TOTAL -> {
                    val currentSubtotal = ezzetaItems.mapIndexed { index, item -> currentUnitPrices[index] * item.quantity }.sum()
                    if (rule.minSubtotal == null || currentSubtotal >= rule.minSubtotal) {
                        val d = if (rule.isPercentage) currentSubtotal * (rule.discountValue / 100.0) else rule.discountValue
                        ruleDiscount = d
                        
                        if (currentSubtotal > 0) {
                            val factor = (currentSubtotal - d) / currentSubtotal
                            for (i in currentUnitPrices.indices) {
                                currentUnitPrices[i] = (currentUnitPrices[i] * factor).coerceAtLeast(0.0)
                            }
                        }
                    }
                }
                PriceRuleType.COMBO -> {
                    if (rule.finalComboPrice != null && rule.comboRequirements.isNotEmpty()) {
                        var possibleCombos = Int.MAX_VALUE
                        rule.comboRequirements.forEach { req ->
                            val countInCart = ezzetaItems.filter { 
                                (req.productId != null && it.product.id == req.productId) || 
                                (req.categoryId != null && (it.product.categoryIds.contains(req.categoryId) || it.product.categoryId == req.categoryId))
                            }.sumOf { it.quantity }
                            possibleCombos = minOf(possibleCombos, countInCart / req.quantity)
                        }
                        
                        if (possibleCombos > 0 && possibleCombos != Int.MAX_VALUE) {
                            var currentComboSetPrice = 0.0
                            rule.comboRequirements.forEach { req ->
                                var remainingQty = req.quantity * possibleCombos
                                ezzetaItems.forEachIndexed { index, item ->
                                    if (remainingQty <= 0) return@forEachIndexed
                                    if ((req.productId != null && item.product.id == req.productId) || 
                                        (req.categoryId != null && (item.product.categoryIds.contains(req.categoryId) || item.product.categoryId == req.categoryId))) {
                                        val take = minOf(item.quantity, remainingQty)
                                        currentComboSetPrice += currentUnitPrices[index] * take
                                        remainingQty -= take
                                    }
                                }
                            }
                            
                            val targetPrice = rule.finalComboPrice * possibleCombos
                            ruleDiscount = (currentComboSetPrice - targetPrice).coerceAtLeast(0.0)
                            
                            if (ruleDiscount > 0 && currentComboSetPrice > 0) {
                                val factor = targetPrice / currentComboSetPrice
                                rule.comboRequirements.forEach { req ->
                                    var remainingQty = req.quantity * possibleCombos
                                    ezzetaItems.forEachIndexed { index, item ->
                                        if (remainingQty <= 0) return@forEachIndexed
                                        if ((req.productId != null && item.product.id == req.productId) || 
                                            (req.categoryId != null && (item.product.categoryIds.contains(req.categoryId) || item.product.categoryId == req.categoryId))) {
                                            val take = minOf(item.quantity, remainingQty)
                                            currentUnitPrices[index] = currentUnitPrices[index] * factor
                                            remainingQty -= take
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            if (ruleDiscount > 0) {
                applied.add(AppliedPriceRule(rule.id, rule.name, ruleDiscount, isCoupon = rule.requiresCoupon))
                totalDiscount += ruleDiscount
            }
        }
        
        val initialSubtotal = ezzetaItems.sumOf { it.effectivePrice * it.quantity }
        return PricingScenarioResult(applied, totalDiscount, (initialSubtotal - totalDiscount).coerceAtLeast(0.0))
    }

    private fun calculateBestPricing(
        items: List<CartItem>,
        allRules: List<PriceRule>,
        coupon: String
    ): PricingScenarioResult {
        val activeRules = allRules.filter {
            it.isActive && (!it.requiresCoupon || (it.couponCode != null && it.couponCode.equals(coupon, ignoreCase = true)))
        }

        val baseSubtotal = items.filter { !it.product.isClientProduct }.sumOf { it.effectivePrice * it.quantity }
        if (activeRules.isEmpty()) {
            return PricingScenarioResult(emptyList(), 0.0, baseSubtotal)
        }

        val scenarios = mutableListOf<PricingScenarioResult>()

        // Escenario 1: Todas las apilables combinadas
        val stackableRules = activeRules.filter { it.isStackable }
        if (stackableRules.isNotEmpty()) {
            scenarios.add(evaluatePricingScenario(items, stackableRules))
        }

        // Escenarios 2..N: Cada regla exclusiva por separado (que no sea stackable)
        activeRules.filter { !it.isStackable }.forEach { exclusive ->
            scenarios.add(evaluatePricingScenario(items, listOf(exclusive)))
        }
        
        // Escenario Base: Sin reglas
        scenarios.add(PricingScenarioResult(emptyList(), 0.0, baseSubtotal))

        // El mejor escenario es el que deje el precio final más bajo (menor costo para el cliente)
        return scenarios.minByOrNull { it.finalPrice } ?: PricingScenarioResult(emptyList(), 0.0, baseSubtotal)
    }

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
    
    // Gestión de Clientes
    val registeredUsers: StateFlow<List<User>> = UserRepository.allUsers

    val userCustomSizes: StateFlow<List<SizeOption>> = combine(allClientCustomSizes, currentUser) { all, user ->
        all.filter { it.createdByUserId == user?.uuid }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _clientSizesSearchQuery = MutableStateFlow("")
    val clientSizesSearchQuery = _clientSizesSearchQuery.asStateFlow()

    val adminFilteredClientSizes: StateFlow<List<Pair<SizeOption, User?>>> = combine(
        allClientCustomSizes, 
        registeredUsers, 
        clientSizesSearchQuery
    ) { sizes, users, query ->
        sizes.map { size ->
            val owner = users.find { it.uuid == size.createdByUserId }
            size to owner
        }.filter { (size, owner) ->
            if (query.isBlank()) true
            else {
                size.name.contains(query, ignoreCase = true) ||
                (owner?.alias?.contains(query, ignoreCase = true) ?: false) ||
                (owner?.email?.contains(query, ignoreCase = true) ?: false)
            }
        }.sortedByDescending { it.first.createdAt }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun setClientSizeSearchQuery(query: String) {
        _clientSizesSearchQuery.value = query
    }

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
    val customerForms: StateFlow<List<CustomerForm>> = customerFormRepository.forms


    val adminUsers: StateFlow<List<User>> = registeredUsers.map { users ->
        users.filter { it.isAdminUser }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val adminRoles: StateFlow<List<AdminRole>> = AdminRoleRepository.roles

    fun hasPermission(module: String, action: String): Boolean {
        val user = currentUser.value ?: return false
        if (!user.isAdminUser) return false
        
        val role = adminRoles.value.find { it.id == user.roleId } ?: return false
        val permission = role.permissions[module] ?: return false
        
        return when (action.uppercase()) {
            "VIEW" -> permission.view
            "CREATE" -> permission.create
            "EDIT" -> permission.edit
            "DELETE" -> permission.delete
            else -> false
        }
    }
    
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
    }.flowOn(Dispatchers.Default)
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun adminCreateUser(context: Context, name: String, email: String, phone: String?, roleId: String? = null, isAdminUser: Boolean = false) {
        if (!hasPermission("Sistema", "CREATE")) {
            Toast.makeText(context, "No tienes permiso para crear usuarios", Toast.LENGTH_SHORT).show()
            return
        }
        val newUser = User(
            uuid = java.util.UUID.randomUUID().toString(),
            alias = name,
            email = email,
            phone = phone,
            isGuest = false,
            isAdmin = isAdminUser,
            isAdminUser = isAdminUser,
            roleId = roleId,
            isActive = true
        )
        UserRepository.adminAddUser(context.applicationContext, newUser)
    }

    fun adminUpdateUser(context: Context, user: User) {
        if (!hasPermission("Sistema", "EDIT")) {
            Toast.makeText(context, "No tienes permiso para editar usuarios", Toast.LENGTH_SHORT).show()
            return
        }
        // No permitir quitar isAdminUser al Super Admin principal
        if (user.email == "admin" && !user.isAdminUser) return

        UserRepository.updateUser(context.applicationContext, user)
    }

    fun adminToggleUserStatus(context: Context, userId: String) {
        if (!hasPermission("Sistema", "EDIT")) {
            Toast.makeText(context, "No tienes permiso para modificar usuarios", Toast.LENGTH_SHORT).show()
            return
        }
        val user = registeredUsers.value.find { it.uuid == userId }
        if (user != null) {
            // No permitir desactivar al super admin principal
            if (user.email == "admin") return
            
            UserRepository.updateUser(context.applicationContext, user.copy(isActive = !user.isActive))
        }
    }

    // Gestión de Roles
    fun saveAdminRole(context: Context, role: AdminRole) {
        if (!hasPermission("Sistema", "EDIT")) {
            Toast.makeText(context, "No tienes permiso para gestionar roles", Toast.LENGTH_SHORT).show()
            return
        }
        AdminRoleRepository.saveRole(context.applicationContext, role)
    }

    fun deleteAdminRole(context: Context, roleId: String) {
        if (!hasPermission("Sistema", "DELETE")) {
            Toast.makeText(context, "No tienes permiso para eliminar roles", Toast.LENGTH_SHORT).show()
            return
        }
        AdminRoleRepository.deleteRole(context.applicationContext, roleId)
    }

    // Gestión de Formularios
    fun submitCustomerForm(context: Context, type: String, subject: String, description: String, onResult: (Boolean) -> Unit) {
        if (type.isBlank() || subject.isBlank() || description.isBlank()) {
            Toast.makeText(context, "Todos los campos son obligatorios", Toast.LENGTH_SHORT).show()
            onResult(false)
            return
        }
        
        val user = currentUser.value
        val newForm = CustomerForm(
            id = "FORM_${System.currentTimeMillis()}",
            type = type,
            subject = subject,
            description = description,
            userId = if (user?.isGuest == true) null else user?.uuid,
            userName = user?.alias ?: "Invitado",
            userEmail = user?.email,
            status = FormStatus.SIN_REVISAR
        )
        
        val success = customerFormRepository.addForm(context.applicationContext, newForm)
        if (success) {
            Toast.makeText(context, "Consulta enviada correctamente", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(context, "Error al enviar la consulta", Toast.LENGTH_SHORT).show()
        }
        onResult(success)
    }

    fun updateCustomerFormStatus(context: Context, formId: String, status: FormStatus) {
        if (!hasPermission("Formularios", "EDIT")) {
            Toast.makeText(context, "No tienes permiso para editar formularios", Toast.LENGTH_SHORT).show()
            return
        }
        customerFormRepository.updateStatus(context.applicationContext, formId, status)
    }

    fun deleteCustomerForm(context: Context, formId: String) {
        if (!hasPermission("Formularios", "DELETE")) {
            Toast.makeText(context, "No tienes permiso para eliminar formularios", Toast.LENGTH_SHORT).show()
            return
        }
        customerFormRepository.deleteForm(context.applicationContext, formId)
        Toast.makeText(context, "Formulario eliminado", Toast.LENGTH_SHORT).show()
    }

    fun getCustomerOrders(userIdOrEmail: String): List<Order> {
        return _orders.value.filter { 
            it.buyerId == userIdOrEmail || (it.buyerEmail.isNotBlank() && it.buyerEmail == userIdOrEmail)
        }
    }

    val filteredOrderItems: StateFlow<List<Pair<Order, CartItem>>> = combine(
        _orders, statsMode, statsDateFilter
    ) { allOrders, mode, dateFilter ->
        val sdf = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.US)
        val now = Calendar.getInstance()
        val nowTime = now.time
        
        allOrders.flatMap { order ->
            val orderDate = try { sdf.parse(order.date) } catch (e: Exception) { null }
            val isDateMatch = when (dateFilter) {
                "TODAY" -> orderDate?.let { isSameDay(it, nowTime) } ?: false
                "WEEK" -> orderDate?.let { isSameWeek(it, nowTime) } ?: false
                "MONTH" -> orderDate?.let { isSameMonth(it, nowTime) } ?: false
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
    }.flowOn(Dispatchers.Default)
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

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

    val statsResults: StateFlow<List<StatResult>> = combine(
        filteredOrderItems, statsDimension, statsSearchQuery
    ) { items, dimension, query ->
        if (items.isEmpty()) return@combine emptyList<StatResult>()
        
        val grouped = when (dimension) {
            "PRODUCT" -> items.groupBy { it.second.product.id }
            "PRODUCT_UNIQUE" -> items.groupBy { "${it.second.product.id}_${it.second.size}" }
            "SIZE" -> items.groupBy { it.second.size }
            "CATEGORY" -> items.flatMap { pair -> 
                val product = pair.second.product
                val cats = (product.categoryIds + product.categoryId).filter { it.isNotBlank() }.distinct()
                cats.map { it to pair }
            }.groupBy { it.first }.mapValues { entry -> entry.value.map { it.second } }
            "STORE" -> items.groupBy { it.second.product.storeId }
            "SELLER" -> items.groupBy { it.second.product.sellerId ?: "system" }
            else -> items.groupBy { it.second.product.id }
        }

        // Cache de categorías para evitar búsquedas repetidas en el loop
        val catsCache = categories.value.associateBy { it.id }
        val storesCache = productRepository.getStores().associateBy { it.id }

        grouped.map { (key, group) ->
            val firstItem = group.first().second
            val name = when (dimension) {
                "PRODUCT" -> firstItem.product.name
                "PRODUCT_UNIQUE" -> {
                    val sizeLabel = if (firstItem.size.isBlank()) "Única" else firstItem.size
                    "${firstItem.product.name} ($sizeLabel)"
                }
                "SIZE" -> if (key.isBlank()) "Única" else key
                "CATEGORY" -> catsCache[key]?.name ?: key
                "STORE" -> storesCache[key]?.name ?: key
                "SELLER" -> group.first().second.product.sellerName ?: key
                else -> key
            }
            
            StatResult(
                id = key,
                name = name,
                units = group.sumOf { it.second.quantity },
                revenue = group.sumOf { it.second.effectivePrice * it.second.quantity },
                ordersCount = group.map { it.first.id }.distinct().size,
                imageUrl = if (dimension == "PRODUCT" || dimension == "PRODUCT_UNIQUE") firstItem.product.imageUrl else null
            )
        }
        .filter { result ->
            if (dimension == "PRODUCT_UNIQUE" && query.isNotBlank()) {
                val productId = result.id.substringBeforeLast("_")
                val productName = items.find { it.second.product.id == productId }?.second?.product?.name ?: ""
                productName.contains(query, ignoreCase = true)
            } else true
        }
        .sortedWith(compareByDescending<StatResult> { it.units }.thenByDescending { it.revenue }.thenBy { it.name })
    }.flowOn(Dispatchers.Default)
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

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
    }.flowOn(Dispatchers.Default)
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

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
    }.flowOn(Dispatchers.Default)
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

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

    // Flujos reactivos para la sección Siguiendo
    val followedUsersInfo: StateFlow<List<FollowedUserInfo>> = combine(
        currentUser,
        userFollows,
        registeredUsers,
        allProducts
    ) { args ->
        val user = args[0] as User?
        val follows = args[1] as List<UserFollow>
        val allUsers = args[2] as List<User>
        val products = args[3] as List<Product>

        if (user == null) return@combine emptyList<FollowedUserInfo>()

        // Usuarios que sigo
        val followingIds = follows.filter { it.followerId == user.uuid && it.targetType == "SELLER" }
            .map { it.sellerId }
            .toSet()

        followingIds.mapNotNull { targetId ->
            val targetUser = allUsers.find { it.uuid == targetId } ?: return@mapNotNull null
            val count = follows.count { it.sellerId == targetId && it.targetType == "SELLER" }
            val hasProducts = products.any { it.sellerId == targetId && it.isClientProduct }
            
            FollowedUserInfo(
                id = targetId,
                alias = targetUser.alias,
                profileImageUrl = targetUser.profileImageUrl,
                followerCount = count,
                hasMarketplaceProducts = hasProducts
            )
        }.sortedBy { it.alias }
    }.flowOn(Dispatchers.Default)
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val followedStoresInfo: StateFlow<List<FollowedStoreInfo>> = combine(
        currentUser,
        userFollows
    ) { user, follows ->
        if (user == null) return@combine emptyList<FollowedStoreInfo>()

        val allStores = productRepository.getStores()
        val followingIds = follows.filter { it.followerId == user.uuid && it.targetType == "STORE" }
            .map { it.sellerId }
            .toSet()

        followingIds.mapNotNull { targetId ->
            val store = allStores.find { it.id == targetId } ?: return@mapNotNull null
            val count = follows.count { it.sellerId == targetId && it.targetType == "STORE" }
            
            FollowedStoreInfo(
                id = targetId,
                name = store.name,
                logoUrl = store.logoUrl,
                followerCount = count
            )
        }.sortedBy { it.name }
    }.flowOn(Dispatchers.Default)
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

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
                    AdminRoleRepository.init(appContext)
                    sizeRepository.init(appContext)
                    followRepository.init(appContext)
                    shippingRepository.init(appContext)
                    priceRuleRepository.init(appContext)
                    abandonedCartRepository.init(appContext)
                    customerFormRepository.init(appContext)
                    blockedWordRepository.init(appContext)
                    marketplaceReportRepository.init(appContext)
                    homeBannerRepository.init(appContext)
                    popupRepository.init(appContext)
                    initAdminGroups(appContext)
                    productRepository.init(appContext, sizeRepository)
                    loadUserData(appContext)
                    refreshWishlistCounts(appContext)
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

    fun setUserName(context: Context, alias: String, onResult: (Boolean) -> Unit = {}) {
        val appContext = context.applicationContext
        viewModelScope.launch {
            val moderation = validateTextContent(alias)
            if (moderation is ModerationResult.Blocked) {
                Toast.makeText(context, moderation.reason, Toast.LENGTH_LONG).show()
                onResult(false)
                return@launch
            }
            UserRepository.setUser(appContext, alias, isGuest = true, isAdmin = false)
            loadUserData(appContext)
            onResult(true)
        }
    }

    fun registerUser(context: Context, name: String, email: String, password: String, onResult: (Boolean) -> Unit = {}) {
        val appContext = context.applicationContext
        viewModelScope.launch {
            val moderation = validateTextContent(name)
            if (moderation is ModerationResult.Blocked) {
                Toast.makeText(context, moderation.reason, Toast.LENGTH_LONG).show()
                onResult(false)
                return@launch
            }
            
            val passwordHash = SecurityUtils.hashPassword(password)
            UserRepository.setUser(appContext, alias = name, email = email, isGuest = false, isAdmin = false, passwordHash = passwordHash)
            viewModelScope.launch { loadUserData(appContext) }
            onResult(true)
        }
    }

    enum class LoginResult { SUCCESS, INVALID_CREDENTIALS, MIGRATION_REQUIRED, ERROR }

    fun loginUser(context: Context, email: String, password: String, onResult: (LoginResult) -> Unit = {}) {
        val appContext = context.applicationContext
        
        // Buscar si el usuario ya existe
        val existingUser = registeredUsers.value.find { it.email == email }
        
        if (existingUser == null) {
            // Caso especial admin por defecto si no existe
            if (email == "admin" && password == "admin123") {
                UserRepository.setUser(appContext, alias = "Admin", email = "admin", isGuest = false, isAdmin = true, passwordHash = SecurityUtils.hashPassword("admin123"))
                viewModelScope.launch { loadUserData(appContext) }
                onResult(LoginResult.SUCCESS)
                return
            }
            onResult(LoginResult.INVALID_CREDENTIALS)
            return
        }

        // Validar contraseña
        if (existingUser.passwordHash == null) {
            // Usuario legacy - requiere migración
            // Permitimos el login inicial pero notificamos que debe poner clave
            UserRepository.setUser(appContext, alias = existingUser.alias, email = existingUser.email, isGuest = false, isAdmin = existingUser.isAdminUser)
            viewModelScope.launch { loadUserData(appContext) }
            onResult(LoginResult.MIGRATION_REQUIRED)
        } else {
            if (SecurityUtils.verifyPassword(password, existingUser.passwordHash)) {
                UserRepository.setUser(appContext, alias = existingUser.alias, email = existingUser.email, isGuest = false, isAdmin = existingUser.isAdminUser)
                
                // Si el usuario es administrativo, actualizar lastAccess
                if (existingUser.isAdminUser) {
                    UserRepository.updateLastAccess(appContext, existingUser.uuid)
                }
                
                viewModelScope.launch { loadUserData(appContext) }
                refreshWishlistCounts(appContext)
                onResult(LoginResult.SUCCESS)
            } else {
                onResult(LoginResult.INVALID_CREDENTIALS)
            }
        }
    }

    fun logout(context: Context) {
        val appContext = context.applicationContext
        UserRepository.logout(appContext)
        refreshWishlistCounts(appContext)
        _shownPopupsInSession.value = emptyMap() // Limpiar popups vistos en la sesión
        viewModelScope.launch { loadUserData(appContext) }
    }

    fun changePassword(context: Context, currentPass: String, newPass: String, onResult: (Boolean) -> Unit) {
        val user = currentUser.value
        if (user == null || user.isGuest) {
            onResult(false)
            return
        }

        // Si es legacy (sin hash), permitimos cambiar sin validar la actual (porque no hay)
        if (user.passwordHash == null) {
            val newHash = SecurityUtils.hashPassword(newPass)
            UserRepository.updateUser(context, user.copy(passwordHash = newHash))
            onResult(true)
            return
        }

        if (SecurityUtils.verifyPassword(currentPass, user.passwordHash)) {
            val newHash = SecurityUtils.hashPassword(newPass)
            UserRepository.updateUser(context, user.copy(passwordHash = newHash))
            onResult(true)
        } else {
            Toast.makeText(context, "La contraseña actual es incorrecta", Toast.LENGTH_SHORT).show()
            onResult(false)
        }
    }

    fun deleteAccount(context: Context, onResult: (Boolean) -> Unit) {
        val user = currentUser.value
        if (user == null || user.isGuest) {
            onResult(false)
            return
        }
        
        val uuid = user.uuid
        val appContext = context.applicationContext

        viewModelScope.launch(Dispatchers.IO) {
            try {
                // 1. Limpieza Coordinada
                PersistenceManager.clearUserData(appContext, uuid)
                followRepository.removeAllUserFollows(appContext, uuid)
                sizeRepository.removeAllUserSizes(appContext, uuid)
                abandonedCartRepository.anonymizeUserCarts(appContext, uuid)
                customerFormRepository.anonymizeUserForms(appContext, uuid)
                productRepository.disableUserProducts(appContext, uuid)
                
                // 2. Eliminar del Repositorio de Usuarios
                UserRepository.deleteAccount(appContext, uuid)
                
                withContext(Dispatchers.Main) {
                    logout(context)
                    Toast.makeText(context, "Cuenta eliminada correctamente", Toast.LENGTH_LONG).show()
                    onResult(true)
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Error al eliminar la cuenta", Toast.LENGTH_SHORT).show()
                    onResult(false)
                }
            }
        }
    }

    fun updateAlias(context: Context, newAlias: String, onResult: (Boolean) -> Unit = {}) {
        viewModelScope.launch {
            val moderation = validateTextContent(newAlias)
            if (moderation is ModerationResult.Blocked) {
                Toast.makeText(context, moderation.reason, Toast.LENGTH_LONG).show()
                onResult(false)
                return@launch
            }
            UserRepository.updateAlias(context, newAlias)
            onResult(true)
        }
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
        refreshWishlistCounts(context)
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

    fun addAddress(context: Context, address: String, dept: String, prov: String, dist: String, ubigeo: String? = null, name: String? = null, addressId: String? = null) {
        val current = UserRepository.currentUser.value
        if (current != null) {
            val addressList = current.addresses.toMutableList()
            val index = if (addressId != null) addressList.indexOfFirst { it.id == addressId } else -1
            
            val newAddress = UserAddress(
                id = addressId ?: java.util.UUID.randomUUID().toString(),
                name = if (name.isNullOrBlank()) null else name,
                address = address,
                department = dept,
                province = prov,
                district = dist,
                ubigeoCode = ubigeo
            )
            
            if (index != -1) {
                addressList[index] = newAddress
            } else {
                addressList.add(newAddress)
            }
            
            UserRepository.updateUser(context, current.copy(addresses = addressList))
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
            val module = if (product.isClientProduct) "Productos Clientes" else "Productos Tienda"
            if (!hasPermission(module, "EDIT")) {
                Toast.makeText(context, "No tienes permiso para editar este producto", Toast.LENGTH_SHORT).show()
                return
            }
            val updated = product.copy(isVisible = !product.isVisible)
            productRepository.updateProduct(context.applicationContext, updated)
        }
    }

    fun addProduct(context: Context, product: Product, onResult: (Boolean) -> Unit = {}) {
        val module = if (product.isClientProduct) "Productos Clientes" else "Productos Tienda"
        if (!hasPermission(module, "CREATE")) {
            Toast.makeText(context, "No tienes permiso para crear productos", Toast.LENGTH_SHORT).show()
            onResult(false)
            return
        }
        
        viewModelScope.launch {
            _isModerating.value = true
            val moderationResult = validateProductContent(product)
            _isModerating.value = false
            
            when (moderationResult) {
                is ModerationResult.Allowed -> {
                    productRepository.addProduct(context.applicationContext, product)
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

    fun updateProduct(context: Context, product: Product, onResult: (Boolean) -> Unit = {}) {
        val user = currentUser.value
        val module = if (product.isClientProduct) "Productos Clientes" else "Productos Tienda"
        
        // El dueño siempre puede editar sus productos de cliente
        val isOwner = product.isClientProduct && product.sellerId == user?.uuid
        val hasAdminEdit = hasPermission(module, "EDIT")
        
        if (!isOwner && !hasAdminEdit) {
            Toast.makeText(context, "No tienes permiso para editar este producto", Toast.LENGTH_SHORT).show()
            onResult(false)
            return
        }
        
        viewModelScope.launch {
            _isModerating.value = true
            val moderationResult = validateProductContent(product)
            _isModerating.value = false
            
            when (moderationResult) {
                is ModerationResult.Allowed -> {
                    productRepository.updateProduct(context.applicationContext, product)
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

    private suspend fun validateProductContent(product: Product): ModerationResult {
        val localWords = blockedWordRepository.getWordsSync()

        val nameResult = ContentModerationService.validateContent(product.name, localWords)
        if (nameResult !is ModerationResult.Allowed) return nameResult

        val descResult = ContentModerationService.validateContent(product.description, localWords)
        if (descResult !is ModerationResult.Allowed) return descResult


        product.variants?.forEach { variant ->
            val variantResult = ContentModerationService.validateContent(variant.name, localWords)
            if (variantResult !is ModerationResult.Allowed) return variantResult
        }
        
        product.customSizes?.forEach { size ->
            val sizeResult = ContentModerationService.validateContent(size, localWords)
            if (sizeResult !is ModerationResult.Allowed) return sizeResult
        }

        return ModerationResult.Allowed
    }

    // Moderación Centralizada
    suspend fun validateTextContent(text: String): ModerationResult {
        return ContentModerationService.validateContent(text, blockedWordRepository.getWordsSync())
    }

    val blockedWords: StateFlow<List<BlockedWord>> = blockedWordRepository.blockedWords

    fun addBlockedWord(context: Context, word: String, isPartial: Boolean) {
        if (!hasPermission("Moderación de palabras", "CREATE")) {
            Toast.makeText(context, "No tienes permiso para agregar palabras", Toast.LENGTH_SHORT).show()
            return
        }
        val blocked = BlockedWord(
            id = "bw_${System.currentTimeMillis()}",
            word = word.trim(),
            isPartialMatch = isPartial
        )
        if (blockedWordRepository.addWord(context, blocked)) {
            Toast.makeText(context, "Palabra agregada", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(context, "La palabra ya existe", Toast.LENGTH_SHORT).show()
        }
    }

    fun updateBlockedWord(context: Context, blockedWord: BlockedWord) {
        if (!hasPermission("Moderación de palabras", "EDIT")) {
            Toast.makeText(context, "No tienes permiso para editar palabras", Toast.LENGTH_SHORT).show()
            return
        }
        if (blockedWordRepository.updateWord(context, blockedWord)) {
            Toast.makeText(context, "Palabra actualizada", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(context, "Error al actualizar o palabra duplicada", Toast.LENGTH_SHORT).show()
        }
    }

    fun deleteBlockedWord(context: Context, wordId: String) {
        if (!hasPermission("Moderación de palabras", "DELETE")) {
            Toast.makeText(context, "No tienes permiso para eliminar palabras", Toast.LENGTH_SHORT).show()
            return
        }
        blockedWordRepository.deleteWord(context, wordId)
        Toast.makeText(context, "Palabra eliminada", Toast.LENGTH_SHORT).show()
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
                    val productToPublish = request.product.copy(
                        isVisible = true,
                        status = com.example.ezzeta.data.model.ProductStatus.APPROVED
                    )
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

    fun deleteMarketplaceRequest(context: Context, requestId: String) {
        if (!hasPermission("Marketplace", "DELETE")) {
            Toast.makeText(context, "No tienes permiso para eliminar solicitudes", Toast.LENGTH_SHORT).show()
            return
        }
        productRepository.deleteRequest(context.applicationContext, requestId)
        Toast.makeText(context, "Solicitud eliminada", Toast.LENGTH_SHORT).show()
    }

    fun deleteProduct(context: Context, productId: String) {
        val product = productRepository.getProductById(productId)
        if (product != null) {
            val module = if (product.isClientProduct) "Productos Clientes" else "Productos Tienda"
            if (!hasPermission(module, "DELETE")) {
                Toast.makeText(context, "No tienes permiso para eliminar productos", Toast.LENGTH_SHORT).show()
                return
            }
            productRepository.deleteProduct(context.applicationContext, productId)
        }
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
        val productCats = (product.categoryIds + product.categoryId).filter { it.isNotBlank() }.toSet()
        return productRepository.getProductsSync()
            .filter { other -> 
                other.id != product.id && 
                (other.categoryIds.any { it in productCats } || other.categoryId in productCats)
            }
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
        val existing = allClientCustomSizes.value.find { 
            it.name.equals(name, ignoreCase = true) && it.createdByUserId == user?.uuid 
        }
        if (existing == null) {
            sizeRepository.addUserCustomSize(context, name, user?.uuid, user?.alias)
        }
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
    fun setStatsDimension(dim: String) { 
        _statsDimension.value = dim 
        if (dim != "PRODUCT_UNIQUE") _statsSearchQuery.value = ""
    }
    fun setStatsSearchQuery(query: String) { _statsSearchQuery.value = query }

    private fun syncAbandonedCart(context: Context) {
        abandonedCartRepository.syncCartSnapshot(context, _cartItems.value, currentUser.value)
    }


    private val _couponValidationMessage = MutableStateFlow<String?>(null)
    val couponValidationMessage = _couponValidationMessage.asStateFlow()

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
            _couponInput.value = ""
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

    fun uploadProfileImage(context: Context, uri: Uri) {
        val user = currentUser.value ?: return
        if (user.isGuest) return

        viewModelScope.launch(Dispatchers.IO) {
            val savedPath = ImageUtils.resizeAndSaveProfileImage(context.applicationContext, uri, user.uuid)
            if (savedPath != null) {
                // Eliminar imagen anterior si existe
                if (user.profileImageUrl != null && user.profileImageUrl != savedPath) {
                    ImageUtils.deleteProfileImage(user.profileImageUrl)
                }
                
                withContext(Dispatchers.Main) {
                    val updatedUser = user.copy(profileImageUrl = savedPath)
                    UserRepository.updateUser(context.applicationContext, updatedUser)
                }
            }
        }
    }

    fun removeProfileImage(context: Context) {
        val user = currentUser.value ?: return
        if (user.isGuest || user.profileImageUrl == null) return

        viewModelScope.launch(Dispatchers.IO) {
            ImageUtils.deleteProfileImage(user.profileImageUrl)
            withContext(Dispatchers.Main) {
                val updatedUser = user.copy(profileImageUrl = null)
                UserRepository.updateUser(context.applicationContext, updatedUser)
            }
        }
    }

    fun getUserById(userId: String): User? = registeredUsers.value.find { it.uuid == userId }

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

    // reportes marketplace

    fun createMarketplaceReport(
        context: Context,
        product: Product,
        type: ReportType,
        description: String?,
        onSuccess: () -> Unit
    ) {
        val user = currentUser.value
        if (user == null) {
            Toast.makeText(context, "Debes iniciar sesión para reportar", Toast.LENGTH_SHORT).show()
            return
        }

        if (user.uuid == product.sellerId) {
            Toast.makeText(context, "No puedes reportar tu propio producto", Toast.LENGTH_SHORT).show()
            return
        }

        if (!product.isClientProduct) {
            Toast.makeText(context, "Solo se pueden reportar productos de Marketplace", Toast.LENGTH_SHORT).show()
            return
        }

        // Validar duplicados activos (SIN_REVISAR o EN_REVISION)
        val existingReport = marketplaceReports.value.find { 
            it.productId == product.id && 
            it.reporterId == user.uuid && 
            it.type == type &&
            (it.status == ReportStatus.SIN_REVISAR || it.status == ReportStatus.EN_REVISION)
        }
        if (existingReport != null) {
            Toast.makeText(context, "Ya has enviado un reporte activo por este motivo", Toast.LENGTH_SHORT).show()
            return
        }

        viewModelScope.launch {
            // Moderación de la descripción
            if (!description.isNullOrBlank()) {
                if (description.length > 500) {
                    Toast.makeText(context, "La descripción es demasiado larga (máx. 500 car.)", Toast.LENGTH_SHORT).show()
                    return@launch
                }

                val localWords = blockedWordRepository.getWordsSync()
                val moderationResult = ContentModerationService.validateContent(description, localWords)
                if (moderationResult is ModerationResult.Blocked) {
                    Toast.makeText(context, moderationResult.reason, Toast.LENGTH_LONG).show()
                    return@launch
                }
            }

            val report = MarketplaceReport(
                id = java.util.UUID.randomUUID().toString(),
                productId = product.id,
                productName = product.name,
                sellerId = product.sellerId ?: "",
                sellerName = product.sellerName ?: "Vendedor desconocido",
                reporterId = user.uuid,
                reporterName = user.alias,
                reporterEmail = user.email ?: "",
                type = type,
                description = description,
                createdAt = System.currentTimeMillis(),
                status = ReportStatus.SIN_REVISAR
            )

            withContext(Dispatchers.IO) {
                marketplaceReportRepository.addReport(context, report)
            }
            Toast.makeText(context, "Tu reporte fue enviado correctamente", Toast.LENGTH_SHORT).show()
            onSuccess()
        }
    }

    fun updateMarketplaceReportStatus(context: Context, reportId: String, newStatus: ReportStatus) {
        if (!hasPermission("Reportes", "EDIT")) {
            Toast.makeText(context, "No tienes permiso para editar reportes", Toast.LENGTH_SHORT).show()
            return
        }
        viewModelScope.launch(Dispatchers.IO) {
            marketplaceReportRepository.updateStatus(context, reportId, newStatus)
        }
    }

    fun deleteMarketplaceReport(context: Context, reportId: String) {
        if (!hasPermission("Reportes", "DELETE")) {
            Toast.makeText(context, "No tienes permiso para eliminar reportes", Toast.LENGTH_SHORT).show()
            return
        }
        viewModelScope.launch(Dispatchers.IO) {
            marketplaceReportRepository.deleteReport(context, reportId)
        }
    }

    // organizar admin

    private fun initAdminGroups(context: Context) {
        val groups = listOf("sistema", "ventas", "clientes", "marketplace", "soporte", "inventario")
        val states = groups.associateWith { key ->
            PersistenceManager.getAdminGroupState(context, key)
        }
        _adminGroupsExpanded.value = states
    }

    fun toggleAdminGroup(context: Context, groupKey: String) {
        val current = _adminGroupsExpanded.value.toMutableMap()
        val newState = !(current[groupKey] ?: false)
        current[groupKey] = newState
        _adminGroupsExpanded.value = current
        
        viewModelScope.launch(Dispatchers.IO) {
            PersistenceManager.saveAdminGroupState(context.applicationContext, groupKey, newState)
        }
    }

    // manejo banners

    fun saveHomeBanner(
        context: Context,
        banner: HomeBanner,
        desktopUri: Uri? = null,
        mobileUri: Uri? = null,
        onResult: (Boolean) -> Unit
    ) {
        if (!hasPermission("Banners", "EDIT") && !hasPermission("Banners", "CREATE")) {
            Toast.makeText(context, "No tienes permiso para gestionar banners", Toast.LENGTH_SHORT).show()
            onResult(false)
            return
        }

        viewModelScope.launch(Dispatchers.IO) {
            try {
                var finalDesktopUrl = banner.desktopImageUrl
                var finalMobileUrl = banner.mobileImageUrl

                desktopUri?.let { uri ->
                    val path = ImageUtils.saveBannerImage(context, uri, banner.id, isMobile = false)
                    if (path != null) finalDesktopUrl = path
                }

                mobileUri?.let { uri ->
                    val path = ImageUtils.saveBannerImage(context, uri, banner.id, isMobile = true)
                    if (path != null) finalMobileUrl = path
                }

                val finalBanner = banner.copy(
                    desktopImageUrl = finalDesktopUrl,
                    mobileImageUrl = finalMobileUrl,
                    updatedAt = System.currentTimeMillis()
                )

                homeBannerRepository.saveBanner(context, finalBanner)
                
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Banner guardado correctamente", Toast.LENGTH_SHORT).show()
                    onResult(true)
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Error al guardar el banner", Toast.LENGTH_SHORT).show()
                    onResult(false)
                }
            }
        }
    }

    fun deleteHomeBanner(context: Context, bannerId: String) {
        if (!hasPermission("Banners", "DELETE")) {
            Toast.makeText(context, "No tienes permiso para eliminar banners", Toast.LENGTH_SHORT).show()
            return
        }
        viewModelScope.launch(Dispatchers.IO) {
            homeBannerRepository.deleteBanner(context, bannerId)
        }
    }

    fun moveBanner(context: Context, bannerId: String, up: Boolean) {
        val current = homeBanners.value
        val index = current.indexOfFirst { it.id == bannerId }
        if (index == -1) return

        val targetIndex = if (up) index - 1 else index + 1
        if (targetIndex in current.indices) {
            val banner1 = current[index]
            val banner2 = current[targetIndex]
            
            viewModelScope.launch(Dispatchers.IO) {
                homeBannerRepository.saveBanner(context, banner1.copy(order = banner2.order))
                homeBannerRepository.saveBanner(context, banner2.copy(order = banner1.order))
            }
        }
    }

    fun toggleBannerStatus(context: Context, banner: HomeBanner) {
        if (!hasPermission("Banners", "EDIT")) return
        viewModelScope.launch(Dispatchers.IO) {
            homeBannerRepository.saveBanner(context, banner.copy(isActive = !banner.isActive, updatedAt = System.currentTimeMillis()))
        }
    }

    // manejo pop-ups

    fun onRouteChanged(route: String?) {
        if (route == null) return
        
        // Evitar pantallas críticas por defecto
        val criticalRoutes = listOf("login", "checkout", "admin_", "payment")
        if (criticalRoutes.any { route.contains(it) }) {
            _activePopup.value = null
            return
        }

        val allActive = appPopups.value.filter { it.isActive && it.triggerScreen == route }
        if (allActive.isEmpty()) {
            _activePopup.value = null
            return
        }

        // Buscar el primero válido según orden y sesión
        val nextPopup = allActive.sortedBy { it.order }.firstOrNull { popup ->
            if (popup.showOncePerSession) {
                _shownPopupsInSession.value[popup.id] != true
            } else {
                true
            }
        }

        if (nextPopup != null) {
            _activePopup.value = nextPopup
        } else {
            _activePopup.value = null
        }
    }

    fun dismissPopup(popupId: String) {
        val popup = appPopups.value.find { it.id == popupId }
        if (popup != null && popup.showOncePerSession) {
            val current = _shownPopupsInSession.value.toMutableMap()
            current[popupId] = true
            _shownPopupsInSession.value = current
        }
        _activePopup.value = null
    }

    fun savePopup(
        context: Context,
        popup: AppPopup,
        mediaUri: Uri? = null,
        onResult: (Boolean) -> Unit
    ) {
        if (!hasPermission("Pop-ups", "EDIT") && !hasPermission("Pop-ups", "CREATE")) {
            Toast.makeText(context, "No tienes permiso para gestionar pop-ups", Toast.LENGTH_SHORT).show()
            onResult(false)
            return
        }

        viewModelScope.launch(Dispatchers.IO) {
            try {
                var finalPath = popup.mediaPath

                mediaUri?.let { uri ->
                    val saved = popupRepository.saveMedia(context, uri, popup.id, popup.contentType)
                    if (saved != null) finalPath = saved
                }

                val finalPopup = popup.copy(
                    mediaPath = finalPath,
                    updatedAt = System.currentTimeMillis()
                )

                popupRepository.savePopup(context, finalPopup)
                
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Pop-up guardado", Toast.LENGTH_SHORT).show()
                    onResult(true)
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Error al guardar pop-up", Toast.LENGTH_SHORT).show()
                    onResult(false)
                }
            }
        }
    }

    fun deletePopup(context: Context, popupId: String) {
        if (!hasPermission("Pop-ups", "DELETE")) {
            Toast.makeText(context, "No tienes permiso", Toast.LENGTH_SHORT).show()
            return
        }
        viewModelScope.launch(Dispatchers.IO) {
            popupRepository.deletePopup(context, popupId)
        }
    }

    fun togglePopupStatus(context: Context, popup: AppPopup) {
        if (!hasPermission("Pop-ups", "EDIT")) return
        viewModelScope.launch(Dispatchers.IO) {
            popupRepository.savePopup(context, popup.copy(isActive = !popup.isActive, updatedAt = System.currentTimeMillis()))
        }
    }
}
