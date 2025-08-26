# 🚗 Sistema de Gestión de Stock de Repuestos MP

Un sistema completo de gestión de inventario para negocios de repuestos automotores, desarrollado con React + Node.js.

## 📋 Características del MVP

### ✅ Funcionalidades Implementadas

- **📦 Gestión de Productos**
  - Carga de productos con ID autogenerado (formato REP-000001)
  - Formulario con campos: Nombre, Categoría, Cantidad
  - Creación automática de categorías al agregar productos
  - Edición y eliminación de productos

- **🔍 Vista de Stock**
  - Tabla de productos con columnas: ID, Nombre, Categoría, Cantidad
  - Búsqueda en tiempo real por nombre (case-insensitive)
  - Filtro por categoría
  - Paginación para listas largas
  - Indicadores visuales de stock (verde/rojo)

- **📊 Dashboard con Estadísticas**
  - Número total de productos distintos
  - Número total de unidades en stock
  - Distribución del stock por categorías
  - Gráficos interactivos (circular y de barras)
  - Tabla detallada de estadísticas por categoría

- **🏷️ Gestión de Categorías**
  - Listado de categorías existentes con estadísticas
  - Creación de nuevas categorías
  - Protección contra eliminación de categorías con productos asociados
  - Estadísticas de productos y unidades por categoría

### 🎨 Características de UX/UI

- **Diseño Responsivo**: Adaptado para móvil y desktop
- **Interfaz Moderna**: Diseño limpio con Tailwind CSS
- **Navegación Intuitiva**: Menú de navegación con iconos
- **Estados de Carga**: Indicadores visuales durante operaciones
- **Mensajes de Error**: Feedback claro para el usuario
- **Confirmaciones**: Diálogos de confirmación para acciones destructivas

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos
- **Recharts** - Gráficos y visualizaciones

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **CORS** - Middleware para CORS
- **dotenv** - Variables de entorno

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd Repuestos-MP
```

### 2. Configurar el Backend
```bash
cd Backend
npm install
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

### 3. Configurar el Frontend
```bash
cd Frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
Repuestos MP/
├── Backend/
│   ├── server.js          # Servidor principal
│   ├── package.json       # Dependencias del backend
│   └── node_modules/
├── Frontend/
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   │   └── Navbar.jsx
│   │   ├── pages/         # Páginas principales
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   └── CategoryManagement.jsx
│   │   ├── services/      # Servicios de API
│   │   │   └── api.js
│   │   ├── App.jsx        # Componente principal
│   │   └── main.jsx       # Punto de entrada
│   ├── package.json       # Dependencias del frontend
│   └── index.html
└── README.md
```

## 🔌 API Endpoints

### Productos
- `GET /api/products` - Listar productos (con filtros y paginación)
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Categorías
- `GET /api/categories` - Listar categorías con estadísticas
- `POST /api/categories` - Crear categoría
- `DELETE /api/categories/:name` - Eliminar categoría

### Dashboard
- `GET /api/dashboard` - Estadísticas generales

### Health Check
- `GET /api/health` - Estado del servidor

## 🎯 Flujo de Uso

1. **Cargar Productos**: Ir a "Nuevo Producto" y completar el formulario
2. **Consultar Stock**: Usar la vista de productos con búsqueda y filtros
3. **Ver Estadísticas**: Revisar el dashboard para análisis general
4. **Gestionar Categorías**: Administrar categorías desde la sección correspondiente

## 🔒 Criterios de Aceptación Cumplidos

- ✅ Cada producto tiene ID único y legible (REP-000001)
- ✅ Búsqueda case-insensitive por nombre
- ✅ Creación automática de categorías nuevas
- ✅ Dashboard actualizado en tiempo real
- ✅ Protección contra eliminación de categorías con productos

## 🚧 Futuras Extensiones

- [ ] Movimientos de stock (entradas/salidas con historial)
- [ ] Generación/lectura de códigos QR
- [ ] Exportar a Excel o PDF
- [ ] Roles de usuarios y permisos
- [ ] Aplicación móvil o PWA
- [ ] Base de datos persistente (PostgreSQL/MongoDB)
- [ ] Autenticación y autorización
- [ ] Notificaciones de stock bajo
- [ ] Reportes avanzados

## 🐛 Solución de Problemas

### Backend no inicia
```bash
# Verificar que el puerto 5000 esté libre
netstat -ano | findstr :5000
# O cambiar el puerto en server.js
```

### Frontend no conecta con Backend
```bash
# Verificar que el backend esté corriendo
curl http://localhost:5000/api/health
# Verificar CORS en server.js
```

### Errores de dependencias
```bash
# Limpiar cache de npm
npm cache clean --force
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📝 Notas de Desarrollo

- **Almacenamiento**: Actualmente usa memoria (se pierde al reiniciar)
- **Validaciones**: Implementadas en frontend y backend
- **Responsive**: Diseño adaptativo para móvil y desktop
- **Performance**: Paginación y filtros optimizados

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para la gestión eficiente de repuestos automotores**
