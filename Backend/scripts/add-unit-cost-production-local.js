const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// IMPORTANTE: Reemplaza esta URL con tu DATABASE_URL real de Render.com
const DATABASE_URL = 'postgresql://repuestos_mp_user:gbAqn1oPbwTeOffGYVxJ2aHF2kSD3NLY@dpg-d2n0druuk2gs73ejbg70-a:5432/repuestos_mp'; // Ejemplo: postgresql://user:pass@host:port/database

async function addUnitCostColumnProduction() {
  let pool = null;
  try {
    console.log('🔄 Conectando a la base de datos de producción...');
    
    if (DATABASE_URL === 'TU_DATABASE_URL_AQUI') {
      console.error('❌ ERROR: Debes reemplazar DATABASE_URL con tu URL real de Render.com');
      console.log('📋 Instrucciones:');
      console.log('1. Ve a tu servicio PostgreSQL en Render.com');
      console.log('2. Copia la DATABASE_URL de la sección Environment');
      console.log('3. Reemplaza la línea 6 en este archivo');
      return;
    }
    
    // Usar DATABASE_URL para producción (Render.com)
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('✅ Conexión establecida');
    console.log('🔄 Agregando columna unit_cost a la tabla products...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'add-unit-cost-column.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar la migración
    await pool.query(sql);
    
    console.log('✅ Columna unit_cost agregada exitosamente en producción');
    
    // Verificar que la columna se agregó correctamente
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'unit_cost'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verificación exitosa: la columna unit_cost existe en la tabla products');
      console.log('📋 Detalles de la columna:', result.rows[0]);
    } else {
      console.log('❌ Error: No se pudo verificar la columna unit_cost');
    }
    
  } catch (error) {
    console.error('❌ Error al agregar la columna unit_cost:', error.message);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Ejecutar el script
addUnitCostColumnProduction();
