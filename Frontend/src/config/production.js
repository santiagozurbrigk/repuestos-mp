// Configuración para producción
export const config = {
  // Cambiar esta URL por la URL de tu backend en Render.com
  API_BASE_URL: 'https://repuestos-mp-backend.onrender.com/api',
  
  // Configuración de la aplicación
  APP_NAME: 'Repuestos MP',
  APP_VERSION: '1.0.0',
  
  // Configuración de autenticación
  JWT_STORAGE_KEY: 'token',
  USER_STORAGE_KEY: 'user',
  
  // Timeouts
  REQUEST_TIMEOUT: 10000,
  AUTH_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
};

export default config;
