# Plan de Implementación: Gestión de Categorías y Subcategorías (Admin)

Este plan describe la creación de la interfaz y lógica para que el administrador pueda gestionar las categorías y sus subcategorías.

## User Review Required

> [!IMPORTANT]
> Se permitirá crear, editar y eliminar categorías.
> Las subcategorías se manejarán como una lista de textos dentro de cada categoría.
> Los cambios se guardarán automáticamente en el almacenamiento local.

## Proposed Changes

### 1. Repositorio de Datos

#### [MODIFY] [ProductRepository.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/data/repository/ProductRepository.kt)
- Cambiar `_categories` a `MutableStateFlow` para permitir actualizaciones reactivas en toda la app.
- Añadir métodos: `addCategory`, `updateCategory` y `deleteCategory`.

### 2. Lógica de Negocio

#### [MODIFY] [MainViewModel.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/viewmodel/MainViewModel.kt)
- Exponer las categorías como un `StateFlow`.
- Añadir métodos para interactuar con el repositorio en la gestión de categorías.

### 3. Navegación y UI

#### [MODIFY] [Screen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/navigation/Screen.kt)
- Añadir ruta `AdminCategoryManagement`.

#### [MODIFY] [NavGraph.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/navigation/NavGraph.kt)
- Registrar la nueva pantalla.

#### [NEW] [AdminCategoryManagementScreen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/screens/admin/AdminCategoryManagementScreen.kt)
- Pantalla para listar categorías.
- Diálogos para añadir/editar categorías y gestionar sus listas de subcategorías.

#### [MODIFY] [AdminDashboardScreen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/screens/admin/AdminDashboardScreen.kt)
- Conectar el botón "Categorías" a la nueva pantalla.

## Verification Plan

### Manual Verification
- Entrar al panel de administración -> Categorías.
- Crear una nueva categoría y verificar que aparezca en la `HomeScreen` y `CategoriesScreen`.
- Añadir una subcategoría a una categoría existente y verificar que aparezca en los filtros.
- Eliminar una categoría y verificar que desaparezca del sistema.
