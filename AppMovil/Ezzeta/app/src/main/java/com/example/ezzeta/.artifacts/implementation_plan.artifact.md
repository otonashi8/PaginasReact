# Plan de Implementación: Gestión de Carritos Abandonados (Fase 13) - Ajustes Finales

Este plan detalla la implementación de un sistema de detección y seguimiento de carritos abandonados, permitiendo al administrador analizar sesiones de compra no concluidas con total precisión histórica.

## User Review Required

> [!IMPORTANT]
> **Temporización Estricta**:
> - `>= 30 min` sin actividad -> **RECUPERABLE**.
> - `>= 24 h` desde que pasó a RECUPERABLE -> **PERDIDO**.
> El cálculo de estados será dinámico al consultar los datos.

> [!WARNING]
> **Snapshot de Precios**: Se guardará una copia inmutable de los datos del producto (Nombre, Tienda, Vendedor, Precio, Descuento) en el momento del abandono. Las estadísticas administrativas no se verán afectadas si el producto cambia o es eliminado del catálogo posteriormente.

## Proposed Changes

### Data Layer

#### [MODIFY] [Models.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/data/model/Models.kt)
- `enum class AbandonedCartStatus`: `ACTIVE`, `RECUPERABLE`, `PERDIDO`, `RECUPERADO`.
- `data class AbandonedCartItem`: Snapshot con `productId`, `productName`, `size`, `quantity`, `unitPrice`, `discount`, `finalPrice`, `storeId`, `sellerId`, `imageUrl`.
- `data class AbandonedCart`:
    - `id`: UUID único.
    - `userId`: Referencia al usuario (opcional).
    - `items`: Lista de `AbandonedCartItem` pendientes.
    - `purchasedItems`: Lista de `AbandonedCartItem` que ya fueron comprados desde esta sesión.
    - `lastActivity`, `createdAt`: Timestamps.
    - `userEmail`, `userName`, `isGuest`: Datos capturados.

#### [NEW] [AbandonedCartRepository.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/data/repository/AbandonedCartRepository.kt)
- Persistencia en `abandoned_carts.json`.
- `syncCartSnapshot(items, user)`: Mantiene sincronizada la sesión `ACTIVE` actual.
- `markItemsAsPurchased(purchasedIds, orderId)`: Mueve items a `purchasedItems`. Si `items` queda vacío -> `RECUPERADO`.

### Logic & ViewModel

#### [MODIFY] [MainViewModel.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/viewmodel/MainViewModel.kt)
- **Gestión de Sesión**:
    - Guardar el `activeAbandonedCartId` en memoria.
    - Cada cambio en la cesta actualiza la sesión activa.
- **Checkout Parcial**:
    - Al comprar solo los productos seleccionados (`isSelected == true`), la sesión de abandono permanece abierta con los productos restantes.
    - Se actualiza `lastActivity` de la sesión tras un checkout parcial para reiniciar el contador de 30 min.
- **Cálculo de KPIs**:
    - `Tasa = recuperados / (recuperados + perdidos) * 100`.
    - `Ingresos`: Basados en los snapshots históricos de la sesión.

### UI Layer - Admin

#### [NEW] [AdminAbandonedCartsScreen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/screens/admin/AdminAbandonedCartsScreen.kt)
- Dashboard con KPIs de recuperación.
- Tabla con estados calculados en tiempo real (Recuperable/Perdido).
- Detalle de Carrito: Lista de productos con sus fotos y precios históricos.

#### [MODIFY] [AdminDashboardScreen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/screens/admin/AdminDashboardScreen.kt)
- Enlace en "Ventas > Carritos abandonados".

## Verification Plan

### Manual Verification
1. **Checkout Parcial**: Carrito con A, B y C. Comprar solo A.
    - Verificar: La sesión de abandono sigue en lista con B y C.
    - Verificar: `purchasedItems` contiene A.
    - Verificar: `lastActivity` se actualizó.
2. **Ciclo de Tiempo**: Forzar timestamps para simular 31 minutos (RECUPERABLE) y luego 25 horas (PERDIDO).
3. **Persistencia de Snapshot**:
    - Abandonar producto a S/100.
    - Cambiar precio oficial a S/150.
    - Verificar: El detalle del carrito abandonado sigue mostrando S/100.
4. **Resistencia a Reinicio**: Verificar que los estados se reconstruyen correctamente al reabrir la app.
