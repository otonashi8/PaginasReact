# Walkthrough: Gestión de Carritos Abandonados

Se ha implementado el módulo de inteligencia de ventas para rastrear y analizar sesiones de compra no concluidas, permitiendo al administrador visualizar el potencial de recuperación de la plataforma.

## Cambios Realizados

### Capa de Datos y Persistencia
- **[Models.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/data/model/Models.kt)**:
    - `AbandonedCartStatus`: Define los estados `ACTIVE`, `RECUPERABLE`, `PERDIDO` y `RECUPERADO`.
    - `AbandonedCartItem`: Snapshot inmutable que captura el precio, descuento y detalles del producto en el momento exacto del abandono.
    - `AbandonedCart`: Modelo de sesión con UUID único que rastrea la actividad, items pendientes y comprados.
- **[AbandonedCartRepository.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/data/repository/AbandonedCartRepository.kt) [NUEVO]**: Maneja la persistencia en `abandoned_carts.json` y la lógica de sincronización de sesiones.

### Motor de Abandono (ViewModel)
- **Temporización Automática**: El sistema calcula el estado basándose en `lastActivity`:
    - `> 30 min` sin cambios -> El carrito aparece como **RECUPERABLE**.
    - `> 24 h` después de ser recuperable -> El carrito pasa a **PERDIDO**.
- **Sincronización de Cesta**: Cada operación en el carrito (añadir, quitar, cambiar cantidad) actualiza automáticamente la sesión activa y refresca el timestamp de actividad.
- **Lógica de Checkout Parcial**: Al realizar una compra, el sistema identifica qué productos fueron adquiridos. Si quedan productos en la cesta, la sesión de abandono permanece abierta y se actualiza su contenido, evitando falsos positivos de recuperación.

### Interfaz Administrativa
- **[AdminAbandonedCartsScreen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/screens/admin/AdminAbandonedCartsScreen.kt) [NUEVO]**:
    - **Dashboard de KPIs**: Muestra carritos recuperados, recuperables, perdidos, e ingresos potenciales y reales.
    - **Tasa de Recuperación**: Métrica porcentual que mide el éxito de las ventas salvadas sobre los abandonos totales.
    - **Vista de Detalle**: Permite al administrador ver la "fotografía" histórica del carrito, incluyendo fotos de los productos y los precios vigentes en ese momento.

## Verificación Realizada

1.  **Checkout Parcial (Compatibilidad Fase 8)**: Se añadió Producto A y B. Se compró solo A. La sesión de abandono conservó correctamente al Producto B como pendiente y registró a A como comprado.
2.  **Snapshot de Precios**: Se abandonó un producto de S/100 y luego se cambió su precio en el catálogo a S/150. El administrador comprobó que el carrito abandonado seguía mostrando S/100, manteniendo la integridad del análisis histórico.
3.  **Transiciones de Estado**: Se verificó mediante manipulación de timestamps que un carrito inactivo pasa correctamente de `ACTIVE` a `RECUPERABLE` tras 30 minutos y finalmente a `PERDIDO` tras 24 horas.
4.  **Usuarios Invitados**: Se validó que los usuarios sin cuenta se rastrean mediante su `sessionId` y alias (si existe), mostrándose como "Invitado" de forma segura.
5.  **Persistencia**: Se reinició la aplicación y se comprobó que todas las sesiones de abandono y sus respectivos KPIs se reconstruyeron fielmente desde el archivo JSON.

> [!TIP]
> Puedes acceder a este módulo desde el **Panel Admin > Carritos abandonados**. Recuerda que los carritos que tienen actividad reciente (menos de 30 minutos) no aparecerán en la lista de abandonos hasta que expire su tiempo de gracia.
