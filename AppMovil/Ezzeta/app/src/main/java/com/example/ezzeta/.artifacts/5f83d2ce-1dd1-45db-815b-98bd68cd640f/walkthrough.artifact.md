# Walkthrough — Fase 48: Administrar cuenta

Se ha implementado el apartado **"Administrar cuenta"** integrando un sistema de seguridad basado en hashing PBKDF2 y un flujo de eliminación de cuenta auditado y seguro.

## Cambios Principales

### 1. Seguridad y Criptografía
*   **[SecurityUtils.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/utils/SecurityUtils.kt)**: Implementación de hashing `PBKDF2WithHmacSHA256` con salt aleatorio único por usuario.
*   **[Models.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/data/model/Models.kt)**: Se añadió el campo `passwordHash` al modelo `User`.

### 2. Flujo de Autenticación y Migración
*   **Login & Registro**: Ahora validan y generan hashes de contraseña.
*   **Migración Legacy**: Los usuarios antiguos son detectados y forzados a establecer una contraseña en su primer login exitoso, redirigiéndolos a la nueva pantalla de administración.

### 3. Gestión de Cuenta (ManageAccountScreen)
*   Nueva pantalla accesible desde el perfil (solo para usuarios registrados).
*   **Cambio de Contraseña**: Requiere validación de la contraseña actual (si existe).
*   **Eliminación de Cuenta**: Proceso con doble diálogo de confirmación que realiza una limpieza profunda:
    *   **Eliminación**: Cesta, historial, favoritos, seguimientos y tallas personales.
    *   **Anonimización**: Carritos abandonados y formularios de soporte (desvinculación de UUID).
    *   **Desactivación**: Productos Marketplace pasan a `DISABLED` y dejan de ser públicos.
    *   **Integridad**: Pedidos y reportes conservan sus snapshots para la administración.

## Verificación Realizada

### Compilación
Se ejecutó `./gradlew assembleDebug` con éxito, garantizando la integridad del código.

### Pruebas Manuales
1.  **Registro**: Se verificó que las contraseñas se almacenan como hashes en `users.json`.
2.  **Login**: Se validaron accesos correctos e incorrectos.
3.  **Migración**: Se probó el flujo con un usuario legacy y se confirmó la redirección obligatoria a la gestión de cuenta.
4.  **Eliminación**:
    *   Se confirmó la desvinculación de datos en `abandoned_carts.json`.
    *   Se verificó que los productos del usuario pasan a `DISABLED`.
    *   Se comprobó la persistencia de pedidos históricos para fines administrativos.

> [!IMPORTANT]
> Los usuarios Guest tienen el acceso bloqueado a esta pantalla por diseño, ya que no poseen una cuenta registrada permanente.
