const { Pool } = require('pg');
require('dotenv').config();

// Usar la URL completa de la base de datos de Render
const DATABASE_URL = 'postgres://repuestos_mp_user:repuestos_mp_password@dpg-cp8j8v8cmk4c73b8j8v0-a.oregon-postgres.render.com/repuestos_mp';

async function addCashRegisterTable() {
  let pool = null;
  
  try {
    console.log('🗄️ Conectando a la base de datos de producción...');
    
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    const client = await pool.connect();
    
    console.log('✅ Conectado a la base de datos de producción');
    
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

    client.release();
    
    console.log('🎉 Tabla cash_register agregada correctamente a la base de datos de producción!');
    
  } catch (error) {
    console.error('❌ Error agregando tabla cash_register:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

addCashRegisterTable();
