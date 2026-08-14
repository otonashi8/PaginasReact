package com.example.ezzeta.data.model

data class ProductVariant(
    val name: String,
    val price: Double
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
    val priceAtAddition: Double? = null
) {
    val effectivePrice: Double
        get() = priceAtAddition ?: product.price
}

data class Comment(
    val id: String,
    val userName: String,
    val text: String,
    val date: String
)

data class Order(
    val id: String,
    val date: String,
    val items: List<CartItem>,
    val total: Double
)
