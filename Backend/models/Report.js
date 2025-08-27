const { pool } = require('../config/database');

class Report {
  // Obtener métricas principales para un período
  static async getMetrics(startDate, endDate) {
    const query = `
      SELECT 
        COUNT(DISTINCT s.id) as total_sales,
        SUM(s.total_items) as total_units,
        SUM(si.total_price) as total_revenue,
        AVG(si.total_price) as average_sale_value
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.created_at >= $1 AND s.created_at <= $2
    `;
    
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows[0];
  }

  // Obtener productos más vendidos (top 5)
  static async getTopProducts(startDate, endDate, limit = 5) {
    const query = `
      SELECT 
f        p.name as product_name,
        si.product_id,
        SUM(si.quantity) as total_quantity,
        SUM(si.total_price) as total_revenue,
        COUNT(DISTINCT s.id) as sales_count
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN products p ON si.product_id = p.id
      WHERE s.created_at >= $1 AND s.created_at <= $2
      GROUP BY p.name, si.product_id
      ORDER BY total_quantity DESC
      LIMIT $3
    `;
    
    const result = await pool.query(query, [startDate, endDate, limit]);
    return result.rows;
  }

  // Obtener categorías más vendidas
  static async getTopCategories(startDate, endDate) {
    const query = `
      SELECT 
        p.category,
        SUM(si.quantity) as total_quantity,
        SUM(si.total_price) as total_revenue,
        COUNT(DISTINCT s.id) as sales_count
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN products p ON si.product_id = p.id
      WHERE s.created_at >= $1 AND s.created_at <= $2
      GROUP BY p.category
      ORDER BY total_quantity DESC
    `;
    
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }

  // Obtener evolución de ventas por día
  static async getSalesEvolution(startDate, endDate) {
    const query = `
      SELECT 
        DATE(s.created_at) as date,
        COUNT(DISTINCT s.id) as sales_count,
        SUM(s.total_items) as total_units,
        SUM(si.total_price) as total_revenue
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.created_at >= $1 AND s.created_at <= $2
      GROUP BY DATE(s.created_at)
      ORDER BY date
    `;
    
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }

  // Obtener ventas detalladas para la tabla
  static async getSalesDetail(startDate, endDate, page = 1, limit = 10, search = '') {
    let query = `
      SELECT 
        s.id,
        s.sale_number,
        s.created_at,
        s.total_items,
        COUNT(si.id) as products_count,
        SUM(si.total_price) as total_amount
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.created_at >= $1 AND s.created_at <= $2
    `;
    
    const params = [startDate, endDate];
    let paramIndex = 3;

    if (search) {
      query += ` AND s.sale_number ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY s.id, s.sale_number, s.created_at, s.total_items`;

    // Contar total de registros
    const countQuery = query.replace('SELECT s.id, s.sale_number, s.created_at, s.total_items, COUNT(si.id) as products_count, SUM(si.total_price) as total_amount', 'SELECT COUNT(DISTINCT s.id) as count');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0]?.count || 0);

    // Agregar ordenamiento y paginación
    query += ` ORDER BY s.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);
    
    return {
      sales: result.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  // Obtener resumen por período (hoy, últimos 7 días, últimos 30 días)
  static async getPeriodSummary(period) {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'last7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'last30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      default:
        throw new Error('Período no válido');
    }

    const metrics = await this.getMetrics(startDate, endDate);
    const topProducts = await this.getTopProducts(startDate, endDate);
    const topCategories = await this.getTopCategories(startDate, endDate);
    const evolution = await this.getSalesEvolution(startDate, endDate);

    return {
      period,
      startDate,
      endDate,
      metrics,
      topProducts,
      topCategories,
      evolution
    };
  }
}

module.exports = Report;
