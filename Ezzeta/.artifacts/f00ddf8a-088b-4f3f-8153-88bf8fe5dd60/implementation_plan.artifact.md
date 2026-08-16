# Plan de Implementación - FASE 20: Corrección y Completado del Sistema de Reglas de Precios

Optimizar y completar el motor de reglas de precios y cupones, asegurando que se apliquen exclusivamente a productos de tienda oficial (EZZETA) y proporcionando una interfaz administrativa robusta para su gestión.

## User Review Required

> [!IMPORTANT]
> **Exclusión de Marketplace**: Todas las reglas de precios (PRODUCT, CATEGORY, ORDER_TOTAL, COMBO) y cupones se aplicarán **únicamente** a productos de tienda oficial (`isClientProduct == false`). Los productos Marketplace conservarán su precio original intacto.

> [!IMPORTANT]
> **Selección Parcial**: El cálculo de todas las reglas y subtotales mínimos solo tendrá en cuenta los productos marcados como seleccionados en la cesta (`isSelected == true`). Los productos desmarcados quedan fuera de toda lógica de descuentos.

> [!WARNING]
> **Lógica de Cupones**: Un cupón no es un descuento independiente, sino una "llave" que activa una regla de precio existente. Si una regla tiene `requiresCoupon = true`, solo se ejecutará si el código introducido coincide exactamente.

## Proposed Changes

### [Data Layer]

#### [MODIFY] [Models.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/data/model/Models.kt)
- **`PriceRule`**: Añadir `val finalComboPrice: Double? = null` para soportar precios fijos en conjuntos de productos.

### [UI Layer - ViewModels]

#### [MODIFY] [MainViewModel.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/viewmodel/MainViewModel.kt)
- **Motor de Reglas (`appliedRules`)**:
    - Filtrar items: Solo procesar aquellos con `!it.product.isClientProduct` e `isSelected == true`.
    - **Validación de Cupón**: Una regla con `requiresCoupon == true` solo se procesa si su `couponCode` coincide con `_couponInput`.
    - **Prioridad**: Ordenar reglas por `priority`. Si un producto ya recibió un descuento de una regla de mayor prioridad, evitar acumulaciones no permitidas (ej. no aplicar descuento de categoría si ya tiene descuento de producto específico).
    - **PRODUCT**: Permitir una lista de IDs de productos EZZETA y aplicar el descuento (%, monto fijo) a cada uno.
    - **CATEGORY**: Identificar productos EZZETA en la categoría seleccionada y aplicar el descuento (%, monto fijo).
    - **ORDER_TOTAL**: Calcular el subtotal sumando solo productos EZZETA seleccionados. Si alcanza `minSubtotal`, aplicar el descuento (%, monto fijo) al total de la compra EZZETA.
    - **COMBO**: Calcular cuántas veces se cumple el conjunto de requisitos (ej. 2 Polos + 1 Jean). Por cada "set" completo, aplicar el descuento necesario para que el total de esos productos sume `finalComboPrice`.
- **Gestión de Cupones**:
    - Implementar funciones `applyCoupon(code)` y `removeCoupon()`.
    - Validar que el código pertenezca a una regla activa.

### [UI Layer - Admin Module]

#### [MODIFY] [AdminPriceRulesScreen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/screens/admin/AdminPriceRulesScreen.kt)
- **`RuleEditorDialog`**:
    - **PRODUCT**: Selector múltiple con búsqueda por nombre (usando `allProducts` filtrado).
    - **CATEGORY**: Dropdown con las categorías reales de la aplicación.
    - **ORDER_TOTAL**: Campos para `minSubtotal` y tipo/valor de descuento.
    - **COMBO**: Constructor dinámico de requisitos (Producto + Cantidad) y campo `finalComboPrice`.
- **Visualización**: Mostrar de forma resumida pero clara las condiciones y el estado (Activo/Inactivo/Requiere Cupón) de cada regla.

### [UI Layer - Screens]

#### [MODIFY] [CartScreen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/screens/CartScreen.kt)
- Integrar el campo de cupón dentro del resumen de venta (debajo de Envío).
- Mostrar el descuento aplicado por cupón y por reglas automáticas de forma desglosada.

## Verification Plan

### Manual Verification
1. **Exclusión Marketplace**: Añadir 1 producto Ezzeta y 1 Marketplace. Aplicar regla del 50%. Solo Ezzeta debe cambiar.
2. **Selección Parcial**: Desmarcar un producto Ezzeta y verificar que el subtotal para `ORDER_TOTAL` se recalcula correctamente.
3. **Flujo de Cupón**: Crear regla que requiere cupón "PROMO20". Verificar que solo se aplica al escribir dicho código en la cesta.
4. **Múltiples Combos**: Configurar combo "2 Polos = S/ 40". Verificar que con 4 polos el total es S/ 80.
5. **Prioridad**: Verificar que reglas con menor número de prioridad se aplican antes y bloquean/modifican el comportamiento de las siguientes sobre los mismos productos.
6. **Integridad del Total**: Confirmar que `Subtotal - Descuentos + Envío` coincide con el `Total` mostrado en Cesta y Checkout.

### Automated Tests
- Ejecutar `./gradlew assembleDebug`.
