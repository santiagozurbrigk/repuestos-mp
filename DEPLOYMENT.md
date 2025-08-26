# 🚀 Guía de Despliegue - Repuestos MP

## 📋 Resumen del Despliegue

- **Frontend**: Hostinger (React SPA)
- **Backend**: Render.com (Node.js API)
- **Base de Datos**: Render.com PostgreSQL

## 🗄️ Paso 1: Configurar Base de Datos en Render.com

### 1.1 Crear cuenta en Render.com
1. Ve a [render.com](https://render.com)
2. Regístrate con tu cuenta de GitHub
3. Haz clic en "New +" → "PostgreSQL"

### 1.2 Configurar PostgreSQL
- **Name**: `repuestos-mp-db`
- **Database**: `repuestos_mp`
- **User**: `repuestos_mp_user`
- **Plan**: Free
- **Region**: Closest to your users

### 1.3 Obtener credenciales
Una vez creada, ve a la pestaña "Connections" y copia:
- **Internal Database URL**
- **External Database URL** (para desarrollo local)

## 🔧 Paso 2: Desplegar Backend en Render.com

### 2.1 Preparar repositorio
1. Sube tu código a GitHub
2. Asegúrate de que el repositorio sea público (para plan gratuito)

### 2.2 Crear Web Service en Render
1. Ve a [render.com](https://render.com)
2. Haz clic en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub

### 2.3 Configurar el servicio
- **Name**: `repuestos-mp-backend`
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free

### 2.4 Configurar Variables de Entorno
En la pestaña "Environment", agrega:

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=tu-secret-super-seguro-aqui
DB_USER=repuestos_mp_user
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_NAME=repuestos_mp
DB_PASSWORD=tu-password-de-render
DB_PORT=5432
```

### 2.5 Inicializar Base de Datos
Una vez desplegado, ejecuta el script de inicialización:

```bash
# En la consola de Render.com o localmente con las credenciales de producción
node scripts/init-production.js
```

### 2.6 Crear Usuario Administrador
```bash
# Ejecutar en Render.com o localmente
node scripts/create-admin.js
```

## 🌐 Paso 3: Desplegar Frontend en Hostinger

### 3.1 Construir para producción
```bash
cd Frontend
npm run build
```

### 3.2 Actualizar configuración
En `src/config/production.js`, actualiza la URL del backend:

```javascript
export const config = {
  API_BASE_URL: 'https://tu-backend.onrender.com/api',
  // ... resto de configuración
};
```

### 3.3 Subir a Hostinger
1. Ve a tu panel de Hostinger
2. Accede al File Manager
3. Ve a `public_html` (o tu subdirectorio)
4. Sube todos los archivos de la carpeta `dist`

### 3.4 Configurar dominio
- Si usas un subdirectorio, actualiza `vite.config.js`:
  ```javascript
  base: '/tu-subdirectorio/'
  ```

## 🔐 Paso 4: Configurar Dominio Personalizado (Opcional)

### 4.1 En Hostinger
1. Ve a "Domains" → "Manage"
2. Configura tu dominio para apuntar a tu hosting

### 4.2 En Render.com
1. Ve a tu Web Service
2. Pestaña "Settings" → "Custom Domains"
3. Agrega tu dominio y configura DNS

## ✅ Paso 5: Verificar Despliegue

### 5.1 Probar Backend
```bash
curl https://tu-backend.onrender.com/api/health
```

### 5.2 Probar Frontend
- Visita tu sitio web
- Intenta hacer login con las credenciales del admin
- Verifica que todas las funcionalidades trabajen

## 🔧 Configuración Adicional

### Variables de Entorno de Producción
```env
# Backend (.env en Render.com)
NODE_ENV=production
PORT=10000
JWT_SECRET=tu-secret-super-seguro
DB_USER=repuestos_mp_user
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_NAME=repuestos_mp
DB_PASSWORD=tu-password
DB_PORT=5432

# Frontend (config/production.js)
API_BASE_URL=https://tu-backend.onrender.com/api
```

### URLs de Ejemplo
- **Backend**: `https://repuestos-mp-backend.onrender.com`
- **Frontend**: `https://tudominio.com` o `https://tudominio.com/subdirectorio`
- **API**: `https://repuestos-mp-backend.onrender.com/api`

## 🚨 Troubleshooting

### Error de CORS
Si tienes errores de CORS, verifica que en el backend:
```javascript
app.use(cors({
  origin: ['https://tudominio.com', 'http://localhost:3000'],
  credentials: true
}));
```

### Error de Base de Datos
1. Verifica las credenciales en Render.com
2. Asegúrate de que la base de datos esté inicializada
3. Revisa los logs en Render.com

### Error de Build
1. Verifica que todas las dependencias estén en `package.json`
2. Revisa los logs de build en Render.com
3. Prueba el build localmente: `npm run build`

## 📞 Soporte

- **Render.com**: [Documentación oficial](https://render.com/docs)
- **Hostinger**: [Centro de ayuda](https://www.hostinger.com/help)
- **PostgreSQL**: [Documentación oficial](https://www.postgresql.org/docs/)

## 🎉 ¡Listo!

Tu aplicación estará disponible en:
- **Frontend**: `https://tudominio.com`
- **Backend**: `https://tu-backend.onrender.com`
- **Credenciales**: `admin` / `admin123`
