# Tareas - FASE 20: Reglas de Precios y Cupones

- `[x]` **Data Layer**
    - `[x]` Añadir `finalComboPrice` a `PriceRule` en `Models.kt`.
- `[x]` **ViewModel**
    - `[x]` Implementar filtrado estricto EZZETA + Selección Parcial en `appliedRules`.
    - `[x]` Implementar lógica de validación de cupones (activación de reglas).
    - `[x]` Implementar cálculos avanzados para `ORDER_TOTAL` y `COMBO` (múltiples sets).
- `[x]` **UI - Admin**
    - `[x]` Refactorizar `RuleEditorDialog` en `AdminPriceRulesScreen.kt`.
    - `[x]` Implementar selectores de productos y categorías reales.
- `[x]` **UI - Cart**
    - `[x]` Integrar campo de cupón y desglose de descuentos en `CartScreen.kt`.
- `[x]` **Verificación**
    - `[x]` Probar exclusión de Marketplace.
    - `[x]` Probar combos múltiples y prioridad de reglas.
    - `[x]` Ejecutar `./gradlew assembleDebug`.
