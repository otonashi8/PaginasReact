package com.example.ezzeta.data.model

data class ProductVariant(
    val name: String,
    val price: Double,
    val stock: Int = 0,
    val oldPrice: Double? = null
)

data class SizeOption(
    val id: String,
    val name: String,
    val createdByUserId: String? = null,
    val creatorName: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val isGlobal: Boolean = false
)

data class SizeSystem(
    val id: String,
    val name: String,
    val options: List<SizeOption> = emptyList(),
    val isEditable: Boolean = true,
    val type: String = "GLOBAL" // "GLOBAL" o "USER" (aunque user se maneja aparte, mantenemos campo)
)

data class Product(
    val id: String,
    val name: String,
    val price: Double,
    val oldPrice: Double? = null,
    val description: String,
    val imageUrl: String,
    val imageUrls: List<String> = emptyList(),
    val categoryId: String,
    val subCategories: List<String> = emptyList(),
    val campaign: String? = null,
    val storeId: String,
    val isFavorite: Boolean = false,
    val rating: Double = 0.0,
    val reviewsCount: Int = 0,
    val sellerName: String? = null,
    val sellerId: String? = null,
    val isClientProduct: Boolean = false,
    val productType: String = if (isClientProduct) "MARKETPLACE" else "STORE",
    val usePriceBySize: Boolean = false,
    val useStockBySize: Boolean = if (productType == "STORE") true else false,
    val stock: Int = 1,
    val isVisible: Boolean = true,
    val customSizes: List<String>? = null,
    val variants: List<ProductVariant>? = null,
    val sizeSystemId: String? = null
) {
    fun getAvailableSizes(): List<String> {
        if (!variants.isNullOrEmpty()) return variants.map { it.name }
        if (customSizes != null) return customSizes
        return when (categoryId) {
            "4" -> listOf("28", "30", "32", "34", "36") 
            else -> listOf("S", "M", "L", "XL")
        }
    }

    fun getPriceForSize(size: String): Double {
        if (productType == "STORE") return price
        if (!usePriceBySize || variants.isNullOrEmpty()) return price
        return variants.find { it.name == size }?.price ?: price
    }

    fun getOldPriceForSize(size: String): Double? {
        if (productType == "STORE") return oldPrice
        if (!usePriceBySize || variants.isNullOrEmpty()) return oldPrice
        return variants.find { it.name == size }?.oldPrice ?: oldPrice
    }

    fun getStockForSize(size: String): Int {
        // En productos oficiales Ezzeta (STORE), el stock es siempre independiente por talla si existen variantes
        if (productType == "STORE") {
            if (variants.isNullOrEmpty()) return stock
            return variants.find { it.name == size }?.stock ?: 0
        }
        // En Marketplace depende de la configuración del usuario
        if (!useStockBySize || variants.isNullOrEmpty()) return stock
        return variants.find { it.name == size }?.stock ?: 0
    }
}

data class Store(
    val id: String,
    val name: String,
    val logoUrl: String,
    val bannerUrl: String,
    val description: String,
    val followersCount: Int = 0,
    val websiteUrl: String? = null
)

data class Category(
    val id: String,
    val name: String,
    val iconUrl: String,
    val subCategories: List<String> = emptyList(),
    val visibility: String = "STORE" // "STORE", "MARKETPLACE", "BOTH"
)

data class SavedCard(
    val id: String,
    val cardHolder: String,
    val cardNumber: String, // Enmascarada: **** **** **** 1234
    val cardBrand: String, // Visa, Mastercard, etc.
    val expiryDate: String
)

data class User(
    val uuid: String,
    val alias: String,
    val email: String? = null,
    val isGuest: Boolean = true,
    val isAdmin: Boolean = false,
    val profileImageUrl: String? = null,
    val entrepreneurshipId: String? = null,
    val followedStoreIds: Set<String> = emptySet(),
    val addresses: List<UserAddress> = emptyList(),
    val savedCards: List<SavedCard> = emptyList(),
    val currentPlanId: String? = null,
    val isAutoRenewalEnabled: Boolean = true,
    val subscriptionEndDate: Long? = null
)


data class AdvantagePlan(
    val id: String,
    val name: String,
    val price: Double,
    val discountPercent: Int,
    val commissionPercent: Int,
    val colorHex: Long,
    val iconName: String
)


data class UserAddress(
    val id: String,
    val name: String? = null,
    val address: String,
    val department: String,
    val province: String,
    val district: String,
    val ubigeoCode: String? = null
)

data class UbigeoDistrict(
    val ubigeo: String,
    val id: Int,
    val inei: String? = null
)


data class CartItem(
    val product: Product,
    var quantity: Int,
    val size: String = "",
    val priceAtAddition: Double? = null,
    val isSelected: Boolean = true
) {
    val effectivePrice: Double
        get() = priceAtAddition ?: product.getPriceForSize(size)
}

data class Comment(
    val id: String,
    val userName: String,
    val text: String,
    val date: String
)

enum class RequestStatus {
    PENDING, APPROVED, REJECTED
}

data class MarketplaceRequest(
    val id: String,
    val userId: String,
    val userName: String,
    val product: Product,
    val createdAt: Long = System.currentTimeMillis(),
    val status: RequestStatus = RequestStatus.PENDING
)

enum class OrderStatus {
    PENDING, PAID, SHIPPED, DELIVERED, CANCELLED
}

data class Order(
    val id: String,
    val date: String,
    val items: List<CartItem>,
    val total: Double,
    val buyerId: String = "",
    val buyerName: String = "",
    val buyerEmail: String = "",
    val buyerPhone: String = "",
    val shippingAddress: String = "",
    val shippingDept: String = "",
    val shippingProv: String = "",
    val shippingDist: String = "",
    val status: OrderStatus = OrderStatus.PAID
)

data class ShippingRate(
    val id: String,
    val region: String, // "GENERAL" o Nombre del Departamento
    val cost: Double,
    val priority: Int, // 1: Específica, 2: General
    val isActive: Boolean = true
)

data class ShippingConfig(
    val freeShippingThreshold: Double = 100.0
)

enum class PriceRuleType {
    PRODUCT, CATEGORY, ORDER_TOTAL, COMBO
}

data class ComboRequirement(
    val productId: String? = null,
    val categoryId: String? = null,
    val quantity: Int
)

data class PriceRule(
    val id: String,
    val name: String,
    val type: PriceRuleType,
    val discountValue: Double, // Puede ser porcentaje o monto fijo
    val isPercentage: Boolean = true,
    val targetIds: List<String> = emptyList(), // IDs de productos o categorías
    val minSubtotal: Double? = null,
    val comboRequirements: List<ComboRequirement> = emptyList(),
    val requiresCoupon: Boolean = false,
    val couponCode: String? = null,
    val priority: Int = 10,
    val isActive: Boolean = true
)

data class AppliedPriceRule(
    val ruleId: String,
    val ruleName: String,
    val discountAmount: Double
)

enum class AbandonedCartStatus {
    ACTIVE, RECUPERABLE, PERDIDO, RECUPERADO
}

data class AbandonedCartItem(
    val productId: String,
    val productName: String,
    val size: String,
    val quantity: Int,
    val unitPrice: Double,
    val discount: Double,
    val finalPrice: Double,
    val storeId: String,
    val sellerId: String?,
    val imageUrl: String
)

data class AbandonedCart(
    val id: String,
    val userId: String? = null,
    val items: List<AbandonedCartItem> = emptyList(),
    val purchasedItems: List<AbandonedCartItem> = emptyList(),
    val lastActivity: Long = System.currentTimeMillis(),
    val createdAt: Long = System.currentTimeMillis(),
    val status: AbandonedCartStatus = AbandonedCartStatus.ACTIVE,
    val userEmail: String? = null,
    val userName: String? = null,
    val isGuest: Boolean = true
)

data class StatResult(
    val id: String,
    val name: String,
    val units: Int,
    val revenue: Double,
    val ordersCount: Int,
    val imageUrl: String? = null
)

data class CustomerStat(
    val id: String,
    val name: String,
    val email: String,
    val totalValue: Double,
    val count: Int // Pedidos comprados o Unidades vendidas
)
