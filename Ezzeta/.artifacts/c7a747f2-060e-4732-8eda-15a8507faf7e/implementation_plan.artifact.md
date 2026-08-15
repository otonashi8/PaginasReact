# Implementación de Ubigeo Dinámico en Finalizar Compra

Se integrará la API de ubigeos para permitir una selección en cascada (Departamento -> Provincia -> Distrito) en el formulario de compra, capturando el código ubigeo oficial.

## Cambios Propuestos

### Modelos de Datos

#### [MODIFY] [Models.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/data/model/Models.kt)
- Agregar `UbigeoData` para representar la información de cada distrito.
- Actualizar `UserAddress` para incluir `province` y `ubigeoCode`.

### Lógica de Negocio

#### [MODIFY] [MainViewModel.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/viewmodel/MainViewModel.kt)
- Implementar la descarga única de `ubigeos.json` al iniciar.
- Exponer estados para la carga (`isLoadingUbigeo`) y posibles errores.
- Mantener en memoria el mapa jerárquico de ubigeos.
- Actualizar `addAddress` para soportar los nuevos campos de ubicación.

### Interfaz de Usuario

#### [MODIFY] [CheckoutScreen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/screens/CheckoutScreen.kt)
- Reemplazar las listas estáticas por datos dinámicos del ViewModel.
- **Cascada de Selección:**
    - Campo Provincia deshabilitado hasta elegir Departamento.
    - Campo Distrito deshabilitado hasta elegir Provincia.
- **Lógica de Limpieza:** Al cambiar un nivel superior (ej. Departamento), se resetean automáticamente los inferiores (Provincia y Distrito).
- Capturar y almacenar el código `ubigeo` al seleccionar el distrito.

## Plan de Verificación

### Verificación Manual
1.  Entrar a la pantalla de Checkout.
2.  Verificar que los campos de Provincia y Distrito estén deshabilitados inicialmente.
3.  Seleccionar un Departamento y verificar que Provincia se habilite con las opciones correctas.
4.  Cambiar el Departamento y confirmar que Provincia y Distrito se limpien.
5.  Seleccionar Distrito y realizar el pedido.
6.  Verificar (vía logs o depuración) que el código ubigeo se esté guardando correctamente en el objeto de dirección.

### Manejo de Errores
- Simular falla de red para verificar que se muestre un mensaje de error o se permita el uso de valores por defecto si la API falla.
