const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar configuración de base de datos y modelos
const { testConnection, initDatabase } = require('./config/database');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Sale = require('./models/Sale');
const Report = require('./models/Report');
const CashRegister = require('./models/CashRegister');

// Importar rutas de autenticación
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Variable para el siguiente ID de producto
let nextProductId = 1;

// Función para generar ID de producto
function generateProductId() {
  const id = `REP-${String(nextProductId).padStart(6, '0')}`;
  nextProductId++;
  return id;
}

// Función para obtener el siguiente ID disponible
async function getNextProductId() {
  try {
    const result = await Product.getAll({ page: 1, limit: 1000 });
    const maxId = result.products.reduce((max, product) => {
      const num = parseInt(product.id.replace('REP-', ''));
      return num > max ? num : max;
    }, 0);
    nextProductId = maxId + 1;
  } catch (error) {
    console.error('Error obteniendo siguiente ID:', error);
  }
}

// Rutas para productos
app.get('/api/products', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    
    const result = await Product.getAll({
      search,
      category,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, category, quantity = 0, unit_cost } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({ error: 'Nombre y categoría son requeridos' });
    }
    
    const newProduct = {
      id: generateProductId(),
      name,
      category,
      quantity: parseInt(quantity),
      unit_cost: unit_cost === '' ? null : parseFloat(unit_cost)
    };
    
    const createdProduct = await Product.create(newProduct);
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, unit_cost } = req.body;
    
    const existingProduct = await Product.getById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (unit_cost !== undefined) updateData.unit_cost = unit_cost === '' ? null : parseFloat(unit_cost);
    
    const updatedProduct = await Product.update(id, updateData);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingProduct = await Product.getById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    await Product.delete(id);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas para categorías
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nombre de categoría es requerido' });
    }
    
    const existingCategory = await Category.getByName(name);
    if (existingCategory) {
      return res.status(400).json({ error: 'La categoría ya existe' });
    }
    
    const createdCategory = await Category.create({ name });
    res.status(201).json(createdCategory);
  } catch (error) {
    console.error('Error creando categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/categories/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    const existingCategory = await Category.getByName(name);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    await Category.delete(name);
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    if (error.message.includes('productos asociados')) {
      res.status(400).json({ 
        error: error.message,
        productCount: error.message.match(/\d+/)[0]
      });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

// Ruta para estadísticas del dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    const productStats = await Product.getStats();
    const categoryStats = await Category.getStats();
    
    // Calcular porcentajes
    const totalProducts = productStats.total_products;
    const statsWithPercentage = categoryStats.map(cat => ({
      ...cat,
      percentage: totalProducts > 0 ? ((cat.product_count / totalProducts) * 100).toFixed(1) : 0
    }));
    
    res.json({
      totalProducts: parseInt(productStats.total_products),
      totalQuantity: parseInt(productStats.total_quantity),
      totalInventoryValue: parseFloat(productStats.total_inventory_value || 0),
      categoryStats: statsWithPercentage
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas para ventas
app.post('/api/sales', async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un producto para la venta' });
    }
    
    // Validar que todos los items tengan los campos requeridos
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: 'Todos los productos deben tener ID y cantidad válida' });
      }
    }
    
    const saleData = { items };
    const createdSale = await Sale.create(saleData);
    
    res.status(201).json(createdSale);
  } catch (error) {
    console.error('Error creando venta:', error);
    if (error.message.includes('Stock insuficiente')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

app.get('/api/sales', async (req, res) => {
  try {
    const { search, page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await Sale.getAll({
      search,
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error obteniendo ventas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/sales/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.getById(id);
    
    if (!sale) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    
    res.json(sale);
  } catch (error) {
    console.error('Error obteniendo venta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/sales/stats/overview', async (req, res) => {
  try {
    const stats = await Sale.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas de ventas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/sales/stats/recent', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const recentSales = await Sale.getRecentSales(parseInt(days));
    res.json(recentSales);
  } catch (error) {
    console.error('Error obteniendo ventas recientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas para reportes
app.get('/api/reports/summary/:period', async (req, res) => {
  try {
    const { period } = req.params;
    const summary = await Report.getPeriodSummary(period);
    res.json(summary);
  } catch (error) {
    console.error('Error obteniendo resumen de reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/reports/custom', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Se requieren fechas de inicio y fin' });
    }

    const metrics = await Report.getMetrics(startDate, endDate);
    const topProducts = await Report.getTopProducts(startDate, endDate);
    const topCategories = await Report.getTopCategories(startDate, endDate);
    const evolution = await Report.getSalesEvolution(startDate, endDate);

    res.json({
      startDate,
      endDate,
      metrics,
      topProducts,
      topCategories,
      evolution
    });
  } catch (error) {
    console.error('Error obteniendo reporte personalizado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/reports/sales-detail', async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10, search = '' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Se requieren fechas de inicio y fin' });
    }

    const result = await Report.getSalesDetail(startDate, endDate, parseInt(page), parseInt(limit), search);
    res.json(result);
  } catch (error) {
    console.error('Error obteniendo detalle de ventas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas para caja
app.post('/api/cash-register', async (req, res) => {
  try {
    const {
      date,
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
    } = req.body;

    // Verificar si ya existe un registro para esta fecha
    const existingRecord = await CashRegister.getByDate(date);
    if (existingRecord) {
      return res.status(400).json({ error: 'Ya existe un registro para esta fecha' });
    }

    const cashData = {
      date,
      cash_sales: parseFloat(cash_sales || 0),
      card_sales: parseFloat(card_sales || 0),
      shipping: parseFloat(shipping || 0),
      miscellaneous_expenses: parseFloat(miscellaneous_expenses || 0),
      fernando_withdrawal: parseFloat(fernando_withdrawal || 0),
      pedro_withdrawal: parseFloat(pedro_withdrawal || 0),
      accessories: parseFloat(accessories || 0),
      sheet_metal: parseFloat(sheet_metal || 0),
      led: parseFloat(led || 0),
      notes: notes || ''
    };

    const createdRecord = await CashRegister.create(cashData);
    res.status(201).json(createdRecord);
  } catch (error) {
    console.error('Error creando registro de caja:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/cash-register', async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const result = await CashRegister.getAll({
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error obteniendo registros de caja:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/cash-register/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await CashRegister.getById(id);
    
    if (!record) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    res.json(record);
  } catch (error) {
    console.error('Error obteniendo registro de caja:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener registro por fecha
app.get('/api/cash-register/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const record = await CashRegister.getByDate(date);
    
    res.json(record);
  } catch (error) {
    console.error('Error obteniendo registro de caja por fecha:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/cash-register/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('ID recibido:', id);
    console.log('Body recibido:', req.body);
    
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
    } = req.body;

    const updateData = {};
    if (cash_sales !== undefined) updateData.cash_sales = parseFloat(cash_sales || 0);
    if (card_sales !== undefined) updateData.card_sales = parseFloat(card_sales || 0);
    if (shipping !== undefined) updateData.shipping = parseFloat(shipping || 0);
    if (miscellaneous_expenses !== undefined) updateData.miscellaneous_expenses = parseFloat(miscellaneous_expenses || 0);
    if (fernando_withdrawal !== undefined) updateData.fernando_withdrawal = parseFloat(fernando_withdrawal || 0);
    if (pedro_withdrawal !== undefined) updateData.pedro_withdrawal = parseFloat(pedro_withdrawal || 0);
    if (accessories !== undefined) updateData.accessories = parseFloat(accessories || 0);
    if (sheet_metal !== undefined) updateData.sheet_metal = parseFloat(sheet_metal || 0);
    if (led !== undefined) updateData.led = parseFloat(led || 0);
    if (notes !== undefined) updateData.notes = notes || '';

    console.log('Datos procesados para actualización:', updateData);

    const updatedRecord = await CashRegister.update(id, updateData);
    res.json(updatedRecord);
  } catch (error) {
    console.error('Error actualizando registro de caja:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/cash-register/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingRecord = await CashRegister.getById(id);
    if (!existingRecord) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    await CashRegister.delete(id);
    res.json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando registro de caja:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para estadísticas de caja
app.get('/api/cash-register/stats/overview', async (req, res) => {
  try {
    const stats = await CashRegister.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas de caja:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/cash-register/stats/period', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Se requieren fechas de inicio y fin' });
    }

    const stats = await CashRegister.getStatsByPeriod(startDate, endDate);
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas de caja por período:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Sistema de gestión de stock funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Inicializar base de datos y servidor
async function startServer() {
  try {
    // Probar conexión a la base de datos
    await testConnection();
    
    // Inicializar tablas
    await initDatabase();
    
    // Obtener el siguiente ID de producto
    await getNextProductId();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 API disponible en http://localhost:${PORT}/api`);
      console.log(`🗄️ Base de datos PostgreSQL conectada`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

startServer();
