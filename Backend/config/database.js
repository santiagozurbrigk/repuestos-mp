const { Pool } = require('pg');
require('dotenv').config();

// Configuración para desarrollo y producción
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'repuestos_mp',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    client.release();
  } catch (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
  }
};

// Función para inicializar las tablas
const initDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Crear tabla de categorías
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de productos
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(20) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        quantity INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category) REFERENCES categories(name) ON DELETE RESTRICT
      )
    `);

    // Crear índice para búsquedas
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('spanish', name))
    `);

    // Crear trigger para actualizar updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_products_updated_at ON products;
      CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    // Crear tabla de usuarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de caja
    await client.query(`
      CREATE TABLE IF NOT EXISTS cash_register (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        cash_sales DECIMAL(10,2) DEFAULT 0,
        card_sales DECIMAL(10,2) DEFAULT 0,
        shipping DECIMAL(10,2) DEFAULT 0,
        miscellaneous_expenses DECIMAL(10,2) DEFAULT 0,
        fernando_withdrawal DECIMAL(10,2) DEFAULT 0,
        pedro_withdrawal DECIMAL(10,2) DEFAULT 0,
        accessories DECIMAL(10,2) DEFAULT 0,
        sheet_metal DECIMAL(10,2) DEFAULT 0,
        led DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear índices para caja
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_cash_register_date ON cash_register(date)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_cash_register_created_at ON cash_register(created_at)
    `);

    // Crear trigger para updated_at en caja
    await client.query(`
      DROP TRIGGER IF EXISTS update_cash_register_updated_at ON cash_register;
      CREATE TRIGGER update_cash_register_updated_at
        BEFORE UPDATE ON cash_register
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    client.release();
    console.log('✅ Base de datos inicializada correctamente');
  } catch (err) {
    console.error('❌ Error inicializando base de datos:', err.message);
  }
};

module.exports = {
  pool,
  testConnection,
  initDatabase
};
