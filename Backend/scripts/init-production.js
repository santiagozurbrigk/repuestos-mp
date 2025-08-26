const { Pool } = require('pg');
require('dotenv').config();

// Configuración para producción
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

async function initProductionDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🗄️ Inicializando base de datos de producción...');
    
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

    // Crear tabla de ventas
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        sale_number VARCHAR(20) UNIQUE NOT NULL,
        total_items INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla "sales" creada');

    // Crear tabla de items de venta
    await client.query(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id SERIAL PRIMARY KEY,
        sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
        product_id VARCHAR(20) REFERENCES products(id) ON DELETE RESTRICT,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla "sale_items" creada');

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

    // Crear índices
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('spanish', name))
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);
    console.log('✅ Índices creados');

    // Crear función para generar números de venta
    await client.query(`
      CREATE OR REPLACE FUNCTION generate_sale_number()
      RETURNS TRIGGER AS $$
      DECLARE
        next_number INTEGER;
      BEGIN
        SELECT COALESCE(MAX(CAST(SUBSTRING(s.sale_number FROM 5) AS INTEGER)), 0) + 1
        INTO next_number
        FROM sales s;
        
        NEW.sale_number := 'VENT-' || LPAD(next_number::TEXT, 6, '0');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('✅ Función generate_sale_number creada');

    // Crear trigger para generar números de venta
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_generate_sale_number ON sales;
      CREATE TRIGGER trigger_generate_sale_number
        BEFORE INSERT ON sales
        FOR EACH ROW
        EXECUTE FUNCTION generate_sale_number()
    `);
    console.log('✅ Trigger generate_sale_number creado');

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

    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('✅ Triggers creados');

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

    console.log('🎉 Base de datos de producción inicializada correctamente!');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos de producción:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  initProductionDatabase()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { initProductionDatabase };
