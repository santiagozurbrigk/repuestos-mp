const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function addUnitCostColumnProduction() {
  try {
    console.log('🔄 Agregando columna unit_cost a la tabla products en producción...');
    
    // Usar DATABASE_URL para producción (Render.com)
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
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
    await pool.end();
  }
}

// Ejecutar el script
addUnitCostColumnProduction();
