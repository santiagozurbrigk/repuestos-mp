# 🗄️ Configuración de PostgreSQL

## 📋 Prerrequisitos

1. **PostgreSQL instalado** en tu sistema
2. **Node.js** y **npm** instalados
3. **Credenciales** de PostgreSQL configuradas

## 🚀 Instalación de PostgreSQL

### Windows
1. Descargar desde: https://www.postgresql.org/download/windows/
2. Instalar con el instalador oficial
3. Recordar la contraseña del usuario `postgres`

### macOS
```bash
# Con Homebrew
brew install postgresql
brew services start postgresql

# O con el instalador oficial
# https://www.postgresql.org/download/macosx/
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## ⚙️ Configuración

### 1. Crear archivo de variables de entorno
```bash
# En la carpeta Backend/
cp .env.example .env
```

### 2. Editar el archivo .env
```env
# Configuración del servidor
PORT=5000
NODE_ENV=development

# Configuración de PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_NAME=repuestos_mp
DB_PASSWORD=tu_password_aqui
DB_PORT=5432
```

### 3. Inicializar la base de datos
```bash
npm run init-db
```

Este comando:
- ✅ Crea la base de datos `repuestos_mp`
- ✅ Crea las tablas necesarias
- ✅ Configura índices y triggers
- ✅ Inserta datos de ejemplo

### 4. Iniciar el servidor
```bash
npm run dev
```

## 📊 Estructura de la Base de Datos

### Tabla: `categories`
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: `products`
```sql
CREATE TABLE products (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category) REFERENCES categories(name) ON DELETE RESTRICT
);
```

## 🔧 Características Implementadas

### ✅ Funcionalidades de Base de Datos
- **Conexión segura** con pool de conexiones
- **Transacciones** para operaciones críticas
- **Índices** para búsquedas rápidas
- **Triggers** para actualización automática de timestamps
- **Foreign Keys** para integridad referencial
- **Búsqueda full-text** en español

### ✅ Optimizaciones
- **Pool de conexiones** para mejor rendimiento
- **Prepared statements** para prevenir SQL injection
- **Índices GIN** para búsquedas de texto
- **Paginación** eficiente con LIMIT/OFFSET

## 🐛 Solución de Problemas

### Error: "password authentication failed"
```bash
# Verificar credenciales en .env
# Asegurar que PostgreSQL esté corriendo
# Verificar que el usuario tenga permisos
```

### Error: "database does not exist"
```bash
# Ejecutar el script de inicialización
npm run init-db
```

### Error: "connection refused"
```bash
# Verificar que PostgreSQL esté corriendo
# En Windows: Services > PostgreSQL
# En macOS: brew services start postgresql
# En Linux: sudo systemctl start postgresql
```

### Error: "permission denied"
```bash
# Verificar permisos del usuario
# En PostgreSQL:
CREATE USER tu_usuario WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE repuestos_mp TO tu_usuario;
```

## 📈 Escalabilidad

### Ventajas de PostgreSQL
- ✅ **ACID Compliance** - Transacciones seguras
- ✅ **Concurrencia** - Múltiples usuarios simultáneos
- ✅ **Índices avanzados** - Búsquedas rápidas
- ✅ **JSON Support** - Flexibilidad de datos
- ✅ **Full-text search** - Búsquedas complejas
- ✅ **Backup automático** - Seguridad de datos

### Próximas mejoras
- [ ] **Conexión SSL** para producción
- [ ] **Replicación** para alta disponibilidad
- [ ] **Particionamiento** para grandes volúmenes
- [ ] **Caché Redis** para consultas frecuentes

## 🔒 Seguridad

### Buenas prácticas implementadas
- ✅ **Variables de entorno** para credenciales
- ✅ **Prepared statements** contra SQL injection
- ✅ **Validación de datos** en el servidor
- ✅ **Foreign keys** para integridad referencial
- ✅ **Pool de conexiones** con límites

### Recomendaciones para producción
- 🔒 Usar **conexión SSL**
- 🔒 Configurar **firewall** de base de datos
- 🔒 Implementar **backup automático**
- 🔒 Usar **usuarios con permisos limitados**
- 🔒 Monitorear **logs de acceso**

---

**¡Tu sistema ahora está listo para escalar! 🚀**
