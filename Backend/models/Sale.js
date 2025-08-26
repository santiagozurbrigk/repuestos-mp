const { pool } = require('../config/database');

class Sale {
  // Crear una nueva venta
  static async create(saleData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Generar número de venta
      const saleNumberResult = await client.query('SELECT generate_sale_number() as sale_number');
      const saleNumber = saleNumberResult.rows[0].sale_number;
      
      // Calcular total de ítems
      const totalItems = saleData.items.reduce((sum, item) => sum + item.quantity, 0);
      
      // Crear la venta
      const saleResult = await client.query(`
        INSERT INTO sales (sale_number, total_items)
        VALUES ($1, $2)
        RETURNING *
      `, [saleNumber, totalItems]);
      
      const sale = saleResult.rows[0];
      
      // Crear los items de venta y actualizar stock
      for (const item of saleData.items) {
        // Verificar stock disponible
        const stockResult = await client.query(`
          SELECT quantity FROM products WHERE id = $1
        `, [item.product_id]);
        
        if (stockResult.rows.length === 0) {
          throw new Error(`Producto ${item.product_id} no encontrado`);
        }
        
        const currentStock = stockResult.rows[0].quantity;
        if (currentStock < item.quantity) {
          throw new Error(`Stock insuficiente para ${item.product_name}. Disponible: ${currentStock}, Solicitado: ${item.quantity}`);
        }
        
        // Obtener información del producto
        const productResult = await client.query(`
          SELECT name, category FROM products WHERE id = $1
        `, [item.product_id]);
        
        const product = productResult.rows[0];
        
        // Crear item de venta
        await client.query(`
          INSERT INTO sale_items (sale_id, product_id, product_name, category, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          sale.id,
          item.product_id,
          product.name,
          product.category,
          item.quantity,
          item.unit_price || 0,
          (item.unit_price || 0) * item.quantity
        ]);
        
        // Actualizar stock del producto
        await client.query(`
          UPDATE products 
          SET quantity = quantity - $1 
          WHERE id = $2
        `, [item.quantity, item.product_id]);
      }
      
      await client.query('COMMIT');
      
      // Retornar la venta con sus items
      return await this.getById(sale.id);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Obtener venta por ID
  static async getById(id) {
    const saleResult = await pool.query(`
      SELECT * FROM sales WHERE id = $1
    `, [id]);
    
    if (saleResult.rows.length === 0) {
      return null;
    }
    
    const sale = saleResult.rows[0];
    
    // Obtener items de la venta
    const itemsResult = await pool.query(`
      SELECT * FROM sale_items WHERE sale_id = $1 ORDER BY created_at
    `, [id]);
    
    sale.items = itemsResult.rows;
    return sale;
  }

  // Obtener todas las ventas con paginación y filtros
  static async getAll(filters = {}) {
    const { page = 1, limit = 10, search, startDate, endDate } = filters;
    
    let query = `
      SELECT s.*, 
             COUNT(si.id) as items_count,
             SUM(si.total_price) as total_amount
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    // Filtro por búsqueda (número de venta)
    if (search) {
      query += ` AND s.sale_number ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Filtro por fecha
    if (startDate) {
      query += ` AND s.created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND s.created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    // Agrupar por venta
    query += ` GROUP BY s.id, s.sale_number, s.total_items, s.created_at, s.updated_at`;

    // Contar total de registros
    const countQuery = query.replace('SELECT s.*, COUNT(si.id) as items_count, SUM(si.total_price) as total_amount', 'SELECT COUNT(DISTINCT s.id) as count');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0]?.count || 0);

    // Agregar ordenamiento y paginación
    query += ` ORDER BY s.created_at DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);
    
    return {
      sales: result.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  // Obtener estadísticas de ventas
  static async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(total_items), 0) as total_items_sold,
        COALESCE(SUM(
          (SELECT SUM(total_price) FROM sale_items WHERE sale_id = s.id)
        ), 0) as total_revenue
      FROM sales s
    `);
    
    return result.rows[0];
  }

  // Obtener ventas por período (últimos 30 días)
  static async getRecentSales(days = 30) {
    const result = await pool.query(`
      SELECT 
        DATE(s.created_at) as date,
        COUNT(*) as sales_count,
        COALESCE(SUM(s.total_items), 0) as items_sold,
        COALESCE(SUM(
          (SELECT SUM(total_price) FROM sale_items WHERE sale_id = s.id)
        ), 0) as daily_revenue
      FROM sales s
      WHERE s.created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(s.created_at)
      ORDER BY date DESC
    `);
    
    return result.rows;
  }
}

module.exports = Sale;
