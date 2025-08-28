const { Pool } = require('pg');

// Configuración temporal para la migración
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'repuestos_mp',
  password: 'tu_contraseña_aqui', // Cambia esto por tu contraseña real
  port: 5432,
});e
const fs = require('fs');
const path = require('path');

async function addUnitCostColumn() {
  try {
    console.log('🔄 Agregando columna unit_cost a la tabla products...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'add-unit-cost-column.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar la migración
    await pool.query(sql);
    
    console.log('✅ Columna unit_cost agregada exitosamente');
    
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
addUnitCostColumn();
