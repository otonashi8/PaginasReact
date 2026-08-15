# Tareas para Implementación de Ubigeo Dinámico

- [x] Actualizar modelos de datos
    - [x] Agregar `UbigeoData` a `Models.kt`
    - [x] Actualizar `UserAddress` en `Models.kt`
- [x] Implementar lógica en `MainViewModel.kt`
    - [x] Agregar estados `ubigeoData`, `isLoadingUbigeo`, `ubigeoError`
    - [x] Implementar `fetchUbigeoData()` para descarga única
    - [x] Actualizar `addAddress()` para soportar nuevos campos
- [x] Actualizar `CheckoutScreen.kt`
    - [x] Implementar lógica de cascada (habilitar/deshabilitar campos)
    - [x] Integrar datos dinámicos del ViewModel
    - [x] Manejar estados de carga y error
- [x] Verificar funcionamiento y guardado del código ubigeo
- [x] Crear walkthrough final
