package com.example.ezzeta.data.mock

import com.example.ezzeta.data.model.*

object MockData {
    val categories = listOf(
        Category("1", "Todo", "", emptyList(), "BOTH"),
        Category("2", "Mujer", "", listOf("Polos", "Casacas", "Poleras", "Jeans", "Shorts", "Jogger", "BVD"), "STORE"),
        Category("3", "Hombre", "", listOf("Polos", "Casacas", "Poleras", "Jeans", "Shorts", "Jogger", "BVD"), "STORE"),
        Category("4", "Fitness", "", listOf("Tops", "Jogger", "Shorts", "Polos", "Poleras"), "STORE"),
        
        // Marketplace Categories
        Category("m1", "Segunda Mano", "", listOf("Ropa", "Electrónica", "Hogar"), "MARKETPLACE"),
        Category("m2", "Artesanías", "", listOf("Joyas", "Decoración", "Tejidos"), "MARKETPLACE"),
        Category("m3", "Servicios", "", listOf("Diseño", "Reparaciones", "Clases"), "MARKETPLACE")
    )

    val stores = listOf(
        Store("s1", "EZZETA", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRH6deP4ow_WolSBvxrJ6teDeWoWJlrlVldNHKol04TYJ5YfS5W7nw-rpXG&s=10", "", "Escoge tu estilo", 215000, "https://ezzetacompany.com/"),
        Store("s2", "CREPANTE", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3zQmT4V-w98N5ZK4s3xDh6KVhf7PO6JZBZUW03tF1MA&s=10", "", "Así se usa en la calle", 28000, "https://crepante.com/"),
        Store("s3", "MAXETA", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxc1FrAjCDilMinzGvdINO5l4LS8QhwI2DWjNLnO9wkJY4TqvxUcNLie7_&s=10", "", "Entrena con estilo entrena con MAXETA", 63200, "https://maxeta.com.pe/home-main-demo/"),
        Store("s4", "UOMO CATTIVO", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNlxm0vLmPWcDXKI3qtD_OWlT4a7P6rXQB2PMt2ExjnAC7ZH4U91z4lGE&s=10", "", "Italian Street Style", 32600, "https://uomocattivo.com/"),
        Store("s5", "3x100", "https://3x100.pe/wp-content/uploads/2026/01/LOGO-3X100.png", "https://3x100.pe/wp-content/uploads/2026/07/banner-3x100-1.png", "Las mejores ofertas para todo público", 4590, "https://3x100.pe/")
    )

    val imageUrl = listOf(
        "https://uomocattivo.com/wp-content/uploads/2025/12/jogger-negro-set-signorile-hombre-1-600x750.png.webp",
        "https://crepante.com/wp-content/uploads/2026/04/Polera-Blanco-Crystal-Hombre-1.jpg.webp",
        "https://uomocattivo.com/wp-content/uploads/2026/07/MOCKUPS-VITTORIO-PLOMO-FRONT-600x750.jpg.webp",
        "https://uomocattivo.com/wp-content/uploads/2026/05/PANTALON-SASTRE-NEGRO-1-600x750.png.webp",
        "https://crepante.com/wp-content/uploads/2026/03/Jean-Ballom-Hielo-Hombre.jpg.webp",
        "https://maxeta.com.pe/wp-content/uploads/2025/07/Top-Verde-Rice-Mujer--780x975.jpg.webp",
        "https://maxeta.com.pe/wp-content/uploads/2026/04/jogger-classic-perla-unisex-4.jpg.webp",
        "https://maxeta.com.pe/wp-content/uploads/2026/05/JOGGER-CLASSIC-MAXETA-AMARILLO-FRONT-QUEDA-QUEDA.jpg.jpeg.webp",
        "https://maxeta.com.pe/wp-content/uploads/2025/12/short-focalizado-acidwash-1.jpg.webp",
        "https://maxeta.com.pe/wp-content/uploads/2026/06/POLERA-CLASSIC-GARGOLA-1.jpg.webp",
        "https://maxeta.com.pe/wp-content/uploads/2026/06/POLERA-CLASSIC-BEIGE-1-780x975.jpg.webp",
        "https://maxeta.com.pe/wp-content/uploads/2025/12/polo-verde-never-back-down-hombre-1.jpg.webp",
        "https://maxeta.com.pe/wp-content/uploads/2025/07/Top-Palo-Rosa-Set-Sculp-Mujer-4.jpg.webp"
    )

    val products = (1..40).map { i ->
        val store = stores[i % stores.size]
        val category = categories.random()
        val images = imageUrl.shuffled().take((3..5).random())
        val mainImage = images.first()
        val subCategories = if (category.subCategories.isNotEmpty()) listOf(category.subCategories.random()) else emptyList()
        val price = (33..110).random().toDouble()
        val hasDiscount = i % 4 == 0 // 25% de los productos con descuento
        val oldPrice = if (hasDiscount) price + (20..50).random() else null
        
        Product(
            id = "p$i",
            name = "Producto $i",
            price = price,
            oldPrice = oldPrice,
            description = "Descripción detallada del producto $i para el marketplace EZZETA.}",
            imageUrl = mainImage,
            imageUrls = images,
            categoryId = category.id,
            subCategories = subCategories,
            storeId = store.id,
            reviewsCount = (5..200).random()
        )
    }
}
