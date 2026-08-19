# Plan de Implementación — Fase 49: Animación de Estadísticas (Revisado v3)

Este plan detalla la integración de estadísticas dinámicas y animadas en las tarjetas de productos, utilizando datos reales de unidades vendidas y popularidad en listas de deseos, garantizando integridad referencial y estabilidad visual.

## User Review Required

> [!IMPORTANT]
> **Cálculo de Ventas**: Se utilizará únicamente el **estado actual** de cada pedido. Solo sumarán unidades (`quantity`) los pedidos en estados `PAID`, `SHIPPED` o `DELIVERED`. Los pedidos en `PENDING` o `CANCELLED` no aportarán unidades al contador.
>
> **Unidades Únicas**: Cada ítem de un pedido contribuye exactamente una vez al total de su producto, evitando duplicaciones por cambios de estado o por conteo de órdenes en lugar de unidades.
>
> **Estabilidad Visual**: Se implementará un contenedor con una **altura estable mínima** (min-height) para las estadísticas, permitiendo la alternancia fluida sin provocar saltos en el Masonry Grid, incluso con variaciones en el tamaño de fuente.

## Proposed Changes

### 1. Núcleo de Datos (ViewModel)

#### [MODIFY] [MainViewModel.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/viewmodel/MainViewModel.kt)
*   **ProductActivity**: Actualizar el data class para incluir `salesCount: Int = 0`.
*   **productActivityMap**:
    1.  Redefinir el cálculo de ventas: Filtrar la lista actual de `_orders` buscando estados válidos (`PAID`, `SHIPPED`, `DELIVERED`).
    2.  Agrupar por `productId` y realizar la sumatoria de las unidades (`item.quantity`).
    3.  Integrar el conteo de Wishlist desde `_wishlistCounts`.
    4.  Garantizar que el flujo reaccione inmediatamente a cambios en `_orders` (ej. cambio de estado de un pedido) o en favoritos.
    5.  Mantener estadísticas independientes por cada `productId`, tanto para Tienda como para Marketplace.

### 2. Componentes de Interfaz

#### [MODIFY] [ProductComponents.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/components/ProductComponents.kt)
*   **ProductCard**:
    *   Actualizar firma para recibir `salesCount: Int`.
    *   Implementar `LaunchedEffect(Unit)` con un bucle infinito que alterne un estado booleano cada 4 segundos.
    *   **Contenedor de Estadísticas**: Usar `Box` con un modificador que garantice una altura estable (ej: `heightIn(min = 20.dp)` o similar adecuado para accesibilidad) para evitar re-layouts en el grid.
    *   **Animación**: Utilizar `AnimatedContent` con una transición de desplazamiento vertical y desvanecimiento (`Slide + Fade`).
    *   Textos dinámicos: `X unidades vendidas` / `♡ Y lo quieren`.
*   **ProductCarousel**: Inyectar los datos de actividad actualizados a cada `ProductCard`.

### 3. Actualización de Pantallas (UI)

Se actualizarán todas las llamadas a `ProductCard` para pasar el `salesCount` desde el `activityMap` del ViewModel, asegurando coherencia en todo el proyecto:

*   **[HomeScreen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/screens/HomeScreen.kt)**
*   **[CategoriesScreen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/screens/CategoriesScreen.kt)**
*   **[MarketplaceScreen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/screens/MarketplaceScreen.kt)**
*   **[CartScreen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/screens/CartScreen.kt)**
*   **[ProductDetailScreen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/screens/ProductDetailScreen.kt)**
*   **[SellerCatalogScreen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/screens/SellerCatalogScreen.kt)**
*   **[StoreScreen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/screens/StoreScreen.kt)**

## Verification Plan

### Automated Tests
*   `./gradlew assembleDebug` para validar que todas las firmas de componentes son correctas.

### Manual Verification
1.  **Integridad de Datos**: Realizar un pedido de 2 unidades y cambiarlo a `PAID`. Verificar que el contador muestra "2 unidades vendidas" inmediatamente (en su turno de animación).
2.  **Cancelaciones**: Cambiar un pedido a `CANCELLED` y verificar que las unidades se descuentan del contador de forma reactiva.
3.  **Wishlist**: Marcar como favorito y validar el incremento en `♡`.
4.  **Estabilidad**: Confirmar que las tarjetas en el Masonry Grid (Home/Marketplace) no se mueven ni cambian de tamaño durante la alternancia de textos.
5.  **Accesibilidad**: Probar con diferentes tamaños de fuente para asegurar que el texto no se corta.
