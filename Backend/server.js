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
    const { name, category, quantity = 0 } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({ error: 'Nombre y categoría son requeridos' });
    }
    
    const newProduct = {
      id: generateProductId(),
      name,
      category,
      quantity: parseInt(quantity)
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
    const { name, category, quantity } = req.body;
    
    const existingProduct = await Product.getById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    
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
