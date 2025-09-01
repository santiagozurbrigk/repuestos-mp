const { pool } = require('../config/database');

class CashRegister {
  // Crear nuevo registro de caja
  static async create(cashData) {
    const {
      date,
      cash_sales = 0,
      card_sales = 0,
      shipping = 0,
      miscellaneous_expenses = 0,
      fernando_withdrawal = 0,
      pedro_withdrawal = 0,
      accessories = 0,
      sheet_metal = 0,
      led = 0,
      notes = ''
    } = cashData;

    const query = `
      INSERT INTO cash_register (
        date, cash_sales, card_sales, shipping, miscellaneous_expenses,
        fernando_withdrawal, pedro_withdrawal, accessories, sheet_metal, led, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      date, 
      parseFloat(cash_sales) || 0, 
      parseFloat(card_sales) || 0, 
      parseFloat(shipping) || 0, 
      parseFloat(miscellaneous_expenses) || 0,
      parseFloat(fernando_withdrawal) || 0, 
      parseFloat(pedro_withdrawal) || 0, 
      parseFloat(accessories) || 0, 
      parseFloat(sheet_metal) || 0, 
      parseFloat(led) || 0, 
      notes || ''
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Obtener registro por fecha
  static async getByDate(date) {
    const query = 'SELECT * FROM cash_register WHERE date = $1';
    const result = await pool.query(query, [date]);
    return result.rows[0];
  }

  // Obtener registro por ID
  static async getById(id) {
    const query = 'SELECT * FROM cash_register WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener todos los registros con paginación
  static async getAll(options = {}) {
    const { page = 1, limit = 10, startDate, endDate } = options;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM cash_register';
    let countQuery = 'SELECT COUNT(*) FROM cash_register';
    let whereConditions = [];
    let queryParams = [];

    // Filtros de fecha
    if (startDate && endDate) {
      whereConditions.push('date BETWEEN $1 AND $2');
      queryParams.push(startDate, endDate);
    } else if (startDate) {
      whereConditions.push('date >= $1');
      queryParams.push(startDate);
    } else if (endDate) {
      whereConditions.push('date <= $1');
      queryParams.push(endDate);
    }

    // Aplicar condiciones WHERE si existen
    if (whereConditions.length > 0) {
      const whereClause = ' WHERE ' + whereConditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    // Ordenar por fecha descendente
    query += ' ORDER BY date DESC';

    // Aplicar paginación
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    // Ejecutar consultas
    const [result, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2))
    ]);

    const totalRecords = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalRecords / limit);

    return {
      records: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalRecords,
        totalPages
      }
    };
  }

  // Actualizar registro
  static async update(id, updateData) {
    // Validar que el ID sea válido
    if (!id || isNaN(parseInt(id))) {
      throw new Error('ID inválido');
    }

    const {
      cash_sales,
      card_sales,
      shipping,
      miscellaneous_expenses,
      fernando_withdrawal,
      pedro_withdrawal,
      accessories,
      sheet_metal,
      led,
      notes
    } = updateData;

    let query = 'UPDATE cash_register SET';
    const params = [];
    let paramIndex = 1;
    const updates = [];

    if (cash_sales !== undefined && cash_sales !== null) {
      updates.push(` cash_sales = $${paramIndex}`);
      params.push(parseFloat(cash_sales) || 0);
      paramIndex++;
    }
    if (card_sales !== undefined && card_sales !== null) {
      updates.push(` card_sales = $${paramIndex}`);
      params.push(parseFloat(card_sales) || 0);
      paramIndex++;
    }
    if (shipping !== undefined && shipping !== null) {
      updates.push(` shipping = $${paramIndex}`);
      params.push(parseFloat(shipping) || 0);
      paramIndex++;
    }
    if (miscellaneous_expenses !== undefined && miscellaneous_expenses !== null) {
      updates.push(` miscellaneous_expenses = $${paramIndex}`);
      params.push(parseFloat(miscellaneous_expenses) || 0);
      paramIndex++;
    }
    if (fernando_withdrawal !== undefined && fernando_withdrawal !== null) {
      updates.push(` fernando_withdrawal = $${paramIndex}`);
      params.push(parseFloat(fernando_withdrawal) || 0);
      paramIndex++;
    }
    if (pedro_withdrawal !== undefined && pedro_withdrawal !== null) {
      updates.push(` pedro_withdrawal = $${paramIndex}`);
      params.push(parseFloat(pedro_withdrawal) || 0);
      paramIndex++;
    }
    if (accessories !== undefined && accessories !== null) {
      updates.push(` accessories = $${paramIndex}`);
      params.push(parseFloat(accessories) || 0);
      paramIndex++;
    }
    if (sheet_metal !== undefined && sheet_metal !== null) {
      updates.push(` sheet_metal = $${paramIndex}`);
      params.push(parseFloat(sheet_metal) || 0);
      paramIndex++;
    }
    if (led !== undefined && led !== null) {
      updates.push(` led = $${paramIndex}`);
      params.push(parseFloat(led) || 0);
      paramIndex++;
    }
    if (notes !== undefined && notes !== null) {
      updates.push(` notes = $${paramIndex}`);
      params.push(notes || '');
      paramIndex++;
    }

    // Si no hay campos para actualizar, retornar el registro actual
    if (updates.length === 0) {
      return await this.getById(id);
    }

    query += updates.join(',');
    query += ` WHERE id = $${paramIndex} RETURNING *`;
    params.push(id);

    console.log('Query:', query);
    console.log('Params:', params);
    
    const result = await pool.query(query, params);
    return result.rows[0];
  }

  // Eliminar registro
  static async delete(id) {
    const query = 'DELETE FROM cash_register WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener estadísticas del dashboard
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_days,
        COALESCE(SUM(cash_sales), 0) as total_cash_sales,
        COALESCE(SUM(card_sales), 0) as total_card_sales,
        COALESCE(SUM(cash_sales + card_sales), 0) as total_sales,
        COALESCE(SUM(shipping), 0) as total_shipping,
        COALESCE(SUM(miscellaneous_expenses), 0) as total_miscellaneous_expenses,
        COALESCE(SUM(fernando_withdrawal), 0) as total_fernando_withdrawal,
        COALESCE(SUM(pedro_withdrawal), 0) as total_pedro_withdrawal,
        COALESCE(SUM(accessories), 0) as total_accessories,
        COALESCE(SUM(sheet_metal), 0) as total_sheet_metal,
        COALESCE(SUM(led), 0) as total_led,
        COALESCE(SUM(cash_sales + card_sales - shipping - miscellaneous_expenses - fernando_withdrawal - pedro_withdrawal - accessories - sheet_metal - led), 0) as net_profit
      FROM cash_register
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }

  // Obtener estadísticas por período
  static async getStatsByPeriod(startDate, endDate) {
    const query = `
      SELECT 
        COUNT(*) as total_days,
        COALESCE(SUM(cash_sales), 0) as total_cash_sales,
        COALESCE(SUM(card_sales), 0) as total_card_sales,
        COALESCE(SUM(cash_sales + card_sales), 0) as total_sales,
        COALESCE(SUM(shipping), 0) as total_shipping,
        COALESCE(SUM(miscellaneous_expenses), 0) as total_miscellaneous_expenses,
        COALESCE(SUM(fernando_withdrawal), 0) as total_fernando_withdrawal,
        COALESCE(SUM(pedro_withdrawal), 0) as total_pedro_withdrawal,
        COALESCE(SUM(accessories), 0) as total_accessories,
        COALESCE(SUM(sheet_metal), 0) as total_sheet_metal,
        COALESCE(SUM(led), 0) as total_led,
        COALESCE(SUM(cash_sales + card_sales - shipping - miscellaneous_expenses - fernando_withdrawal - pedro_withdrawal - accessories - sheet_metal - led), 0) as net_profit
      FROM cash_register
      WHERE date BETWEEN $1 AND $2
    `;

    const result = await pool.query(query, [startDate, endDate]);
    return result.rows[0];
  }

  // Verificar si ya existe un registro para una fecha
  static async existsByDate(date) {
    const query = 'SELECT EXISTS(SELECT 1 FROM cash_register WHERE date = $1)';
    const result = await pool.query(query, [date]);
    return result.rows[0].exists;
  }
}

module.exports = CashRegister;
