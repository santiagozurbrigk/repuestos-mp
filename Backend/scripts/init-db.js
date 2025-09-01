const { Pool } = require('pg');
require('dotenv').config();

// Conectar directamente a la base de datos repuestos_mp
const pool = new Pool({
  user: 'postgres', // Hardcoded for troubleshooting
  host: 'localhost', // Hardcoded for troubleshooting
  database: 'repuestos_mp', // Hardcoded for troubleshooting
  password: 'San48291258', // Hardcoded for troubleshooting
  port: 5432, // Hardcoded for troubleshooting
});

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🗄️ Inicializando base de datos...');
    
    // Crear tabla de categorías
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla "categories" creada');

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
    console.log('✅ Tabla "products" creada');

    // Crear índices
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('spanish', name))
    `);
    console.log('✅ Índices creados');

    // Crear trigger para updated_at
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
    console.log('✅ Triggers creados');

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
    console.log('✅ Tabla "users" creada');

    // Crear índices para usuarios
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);
    console.log('✅ Índices de usuarios creados');

    // Crear trigger para updated_at en usuarios
    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('✅ Triggers de usuarios creados');

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
    console.log('✅ Tabla "cash_register" creada');

    // Crear índices para caja
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_cash_register_date ON cash_register(date)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_cash_register_created_at ON cash_register(created_at)
    `);
    console.log('✅ Índices de caja creados');

    // Crear trigger para updated_at en caja
    await client.query(`
      DROP TRIGGER IF EXISTS update_cash_register_updated_at ON cash_register;
      CREATE TRIGGER update_cash_register_updated_at
        BEFORE UPDATE ON cash_register
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('✅ Triggers de caja creados');

    // Insertar datos de ejemplo
    await client.query(`
      INSERT INTO categories (name) VALUES 
        ('Filtros'),
        ('Aceites'),
        ('Frenos'),
        ('Suspensión')
      ON CONFLICT (name) DO NOTHING
    `);
    console.log('✅ Datos de ejemplo insertados');

    client.release();
    
    console.log('🎉 Base de datos inicializada correctamente!');
    console.log('📋 Para usar la aplicación:');
    console.log('   1. El archivo .env ya está configurado');
    console.log('   2. Ejecuta: npm run dev');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  } finally {
    pool.end();
  }
}

initDatabase();
