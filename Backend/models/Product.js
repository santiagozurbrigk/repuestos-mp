const { pool } = require('../config/database');

class Product {
  // Obtener todos los productos con filtros y paginación
  static async getAll(filters = {}) {
    const { search, category, page = 1, limit = 10 } = filters;
    
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category = c.name
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    // Filtro por búsqueda
    if (search) {
      query += ` AND p.name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Filtro por categoría
    if (category && category !== 'all') {
      query += ` AND p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Contar total de registros
    const countQuery = query.replace('SELECT p.*, c.name as category_name', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Agregar ordenamiento y paginación
    query += ` ORDER BY p.created_at DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);
    
    return {
      products: result.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  // Obtener producto por ID
  static async getById(id) {
    const query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category = c.name
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Crear nuevo producto
  static async create(productData) {
    const { id, name, category, quantity = 0, unit_cost = null } = productData;
    
    // Primero asegurar que la categoría existe
    await this.ensureCategoryExists(category);
    
    const query = `
      INSERT INTO products (id, name, category, quantity, unit_cost)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, name, category, quantity, unit_cost]);
    return result.rows[0];
  }

  // Actualizar producto
  static async update(id, updateData) {
    const { name, category, quantity, unit_cost } = updateData;
    
    // Si se está actualizando la categoría, asegurar que existe
    if (category) {
      await this.ensureCategoryExists(category);
    }
    
    let query = 'UPDATE products SET';
    const params = [];
    let paramIndex = 1;
    const updates = [];

    if (name !== undefined) {
      updates.push(` name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }

    if (category !== undefined) {
      updates.push(` category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (quantity !== undefined) {
      updates.push(` quantity = $${paramIndex}`);
      params.push(quantity);
      paramIndex++;
    }

    if (unit_cost !== undefined) {
      updates.push(` unit_cost = $${paramIndex}`);
      params.push(unit_cost);
      paramIndex++;
    }

    query += updates.join(',');
    query += ` WHERE id = $${paramIndex} RETURNING *`;
    params.push(id);

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  // Eliminar producto
  static async delete(id) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Asegurar que una categoría existe (crear si no existe)
  static async ensureCategoryExists(categoryName) {
    const query = `
      INSERT INTO categories (name)
      VALUES ($1)
      ON CONFLICT (name) DO NOTHING
    `;
    await pool.query(query, [categoryName]);
  }

  // Obtener estadísticas de productos
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_products,
        COALESCE(SUM(quantity), 0) as total_quantity,
        COALESCE(SUM(quantity * COALESCE(unit_cost, 0)), 0) as total_inventory_value
      FROM products
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }

  // Obtener productos por categoría para estadísticas
  static async getProductsByCategory() {
    const query = `
      SELECT 
        p.category,
        COUNT(p.id) as product_count,
        COALESCE(SUM(p.quantity), 0) as total_quantity
      FROM products p
      GROUP BY p.category
      ORDER BY product_count DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Product;
