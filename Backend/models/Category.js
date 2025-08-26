const { pool } = require('../config/database');

class Category {
  // Obtener todas las categorías con estadísticas
  static async getAll() {
    const query = `
      SELECT 
        c.name,
        c.created_at,
        COUNT(p.id) as product_count,
        COALESCE(SUM(p.quantity), 0) as total_quantity
      FROM categories c
      LEFT JOIN products p ON c.name = p.category
      GROUP BY c.id, c.name, c.created_at
      ORDER BY c.name
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtener categoría por nombre
  static async getByName(name) {
    const query = 'SELECT * FROM categories WHERE name = $1';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  // Crear nueva categoría
  static async create(categoryData) {
    const { name } = categoryData;
    
    const query = `
      INSERT INTO categories (name)
      VALUES ($1)
      RETURNING *
    `;
    
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  // Eliminar categoría
  static async delete(name) {
    // Primero verificar si hay productos en esta categoría
    const checkQuery = 'SELECT COUNT(*) FROM products WHERE category = $1';
    const checkResult = await pool.query(checkQuery, [name]);
    const productCount = parseInt(checkResult.rows[0].count);

    if (productCount > 0) {
      throw new Error(`No se puede eliminar la categoría "${name}" porque tiene ${productCount} producto(s) asociado(s)`);
    }

    const query = 'DELETE FROM categories WHERE name = $1 RETURNING *';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  // Verificar si una categoría existe
  static async exists(name) {
    const query = 'SELECT EXISTS(SELECT 1 FROM categories WHERE name = $1)';
    const result = await pool.query(query, [name]);
    return result.rows[0].exists;
  }

  // Obtener estadísticas de categorías para el dashboard
  static async getStats() {
    const query = `
      SELECT 
        c.name as category,
        COUNT(p.id) as product_count,
        COALESCE(SUM(p.quantity), 0) as total_quantity
      FROM categories c
      LEFT JOIN products p ON c.name = p.category
      GROUP BY c.name
      ORDER BY product_count DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Category;
