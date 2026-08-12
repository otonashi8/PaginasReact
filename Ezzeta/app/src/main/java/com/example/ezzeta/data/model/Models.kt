package com.example.ezzeta.data.model

data class Product(
    val id: String,
    val name: String,
    val price: Double,
    val oldPrice: Double? = null,
    val description: String,
    val imageUrl: String,
    val imageUrls: List<String> = emptyList(),
    val categoryId: String,
    val subCategory: String = "",
    val campaign: String? = null,
    val storeId: String,
    val hashtags: List<String> = emptyList(),
    val isFavorite: Boolean = false,
    val rating: Double = 0.0,
    val reviewsCount: Int = 0,
    val sellerName: String? = null,
    val sellerId: String? = null,
    val isClientProduct: Boolean = false,
    val stock: Int = 1,
    val isVisible: Boolean = true,
    val customSizes: List<String>? = null
) {
    fun getAvailableSizes(): List<String> {
        if (customSizes != null) return customSizes
        return when (categoryId) {
            "4" -> listOf("28", "30", "32", "34", "36") // Calzado o Pantalones (según el caso de Ezzeta es Pantalones/Jeans)
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
    val followersCount: Int = 0
)

data class Category(
    val id: String,
    val name: String,
    val iconUrl: String,
    val subCategories: List<String> = emptyList()
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
    val addresses: List<UserAddress> = emptyList()
)

data class UserAddress(
    val id: String,
    val name: String? = null,
    val address: String,
    val department: String,
    val district: String
)

data class CartItem(
    val product: Product,
    var quantity: Int,
    val size: String = ""
)

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
