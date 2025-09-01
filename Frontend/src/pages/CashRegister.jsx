import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Truck, CreditCard, User, Package, AlertTriangle, Save, Plus, Trash2, Minus } from 'lucide-react';
import { cashRegisterAPI } from '../services/api';

const CashRegister = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shipping: '',
    miscellaneous_expenses: '',
    notes: ''
  });

  // Estados para ventas dinámicas
  const [sales, setSales] = useState([]);
  const [newSale, setNewSale] = useState({ value: '', type: 'cash' });

  // Estados para categorías dinámicas
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ value: '', type: 'accessories' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null);

  useEffect(() => {
    checkExistingRecord();
  }, [formData.date]);

  const checkExistingRecord = async () => {
    try {
      const response = await cashRegisterAPI.getByDate(formData.date);
      console.log('Respuesta de getByDate:', response);
      if (response.data) {
        console.log('Registro existente encontrado:', response.data);
        setExistingRecord(response.data);
        setFormData({
          date: response.data.date,
          shipping: response.data.shipping || '',
          miscellaneous_expenses: response.data.miscellaneous_expenses || '',
          notes: response.data.notes || ''
        });
        
        // Cargar ventas existentes
        const existingSales = [];
        if (response.data.cash_sales > 0) {
          existingSales.push({ value: response.data.cash_sales, type: 'cash' });
        }
        if (response.data.card_sales > 0) {
          existingSales.push({ value: response.data.card_sales, type: 'card' });
        }
        setSales(existingSales);

        // Cargar categorías existentes
        const existingCategories = [];
        if (response.data.accessories > 0) {
          existingCategories.push({ value: response.data.accessories, type: 'accessories' });
        }
        if (response.data.sheet_metal > 0) {
          existingCategories.push({ value: response.data.sheet_metal, type: 'sheet_metal' });
        }
        if (response.data.led > 0) {
          existingCategories.push({ value: response.data.led, type: 'led' });
        }
        setCategories(existingCategories);
      } else {
        setExistingRecord(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error en checkExistingRecord:', error);
      setExistingRecord(null);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      shipping: '',
      miscellaneous_expenses: '',
      notes: ''
    });
    setSales([]);
    setCategories([]);
    setNewSale({ value: '', type: 'cash' });
    setNewCategory({ value: '', type: 'accessories' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Funciones para manejar ventas
  const handleSaleChange = (e) => {
    const { name, value } = e.target;
    setNewSale(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSale = () => {
    if (!newSale.value || parseFloat(newSale.value) <= 0) return;
    
    setSales(prev => [...prev, { ...newSale, id: Date.now() }]);
    setNewSale({ value: '', type: 'cash' });
  };

  const removeSale = (id) => {
    setSales(prev => prev.filter(sale => sale.id !== id));
  };

  const handleSaleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSale();
    }
  };

  // Funciones para manejar categorías
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addCategory = () => {
    if (!newCategory.value || parseFloat(newCategory.value) <= 0) return;
    
    setCategories(prev => [...prev, { ...newCategory, id: Date.now() }]);
    setNewCategory({ value: '', type: 'accessories' });
  };

  const removeCategory = (id) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const handleCategoryKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCategory();
    }
  };

  // Cálculos automáticos
  const calculateTotalSales = () => {
    return sales.reduce((total, sale) => total + parseFloat(sale.value || 0), 0);
  };

  const calculateCashSales = () => {
    return sales
      .filter(sale => sale.type === 'cash')
      .reduce((total, sale) => total + parseFloat(sale.value || 0), 0);
  };

  const calculateCardSales = () => {
    return sales
      .filter(sale => sale.type === 'card')
      .reduce((total, sale) => total + parseFloat(sale.value || 0), 0);
  };

  const calculateTotalCategories = () => {
    return categories.reduce((total, cat) => total + parseFloat(cat.value || 0), 0);
  };

  const calculateAccessories = () => {
    return categories
      .filter(cat => cat.type === 'accessories')
      .reduce((total, cat) => total + parseFloat(cat.value || 0), 0);
  };

  const calculateSheetMetal = () => {
    return categories
      .filter(cat => cat.type === 'sheet_metal')
      .reduce((total, cat) => total + parseFloat(cat.value || 0), 0);
  };

  const calculateLed = () => {
    return categories
      .filter(cat => cat.type === 'led')
      .reduce((total, cat) => total + parseFloat(cat.value || 0), 0);
  };

  const calculateFernandoWithdrawal = () => {
    return calculateTotalSales() * 0.10; // 10%
  };

  const calculatePedroWithdrawal = () => {
    return calculateTotalSales() * 0.15; // 15%
  };

  const calculateTotalExpenses = () => {
    const shipping = parseFloat(formData.shipping) || 0;
    const misc = parseFloat(formData.miscellaneous_expenses) || 0;
    const fernando = calculateFernandoWithdrawal();
    const pedro = calculatePedroWithdrawal();
    const categoriesTotal = calculateTotalCategories();
    
    return shipping + misc + fernando + pedro + categoriesTotal;
  };

  const calculateNetProfit = () => {
    return calculateTotalSales() - calculateTotalExpenses();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const submitData = {
        date: formData.date,
        cash_sales: calculateCashSales(),
        card_sales: calculateCardSales(),
        shipping: parseFloat(formData.shipping) || 0,
        miscellaneous_expenses: parseFloat(formData.miscellaneous_expenses) || 0,
        fernando_withdrawal: calculateFernandoWithdrawal(),
        pedro_withdrawal: calculatePedroWithdrawal(),
        accessories: calculateAccessories(),
        sheet_metal: calculateSheetMetal(),
        led: calculateLed(),
        notes: formData.notes || ''
      };

      console.log('Datos a enviar:', submitData);

      if (existingRecord) {
        console.log('Actualizando registro con ID:', existingRecord.id);
        await cashRegisterAPI.update(existingRecord.id, submitData);
        setSuccess('Registro actualizado correctamente');
      } else {
        await cashRegisterAPI.create(submitData);
        setSuccess('Registro creado correctamente');
        setExistingRecord(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Caja</h1>
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {new Date(formData.date).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Alertas */}
      {existingRecord && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Registro existente
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                Ya existe un registro para esta fecha. Puedes modificarlo y guardar los cambios.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fecha */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fecha</h3>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        {/* Ventas Dinámicas */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
            Ventas
          </h3>
          
          {/* Agregar nueva venta */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              name="value"
              value={newSale.value}
              onChange={handleSaleChange}
              onKeyPress={handleSaleKeyPress}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Valor de la venta (ej: 47500)"
            />
            <select
              name="type"
              value={newSale.type}
              onChange={handleSaleChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="cash">Contado</option>
              <option value="card">Tarjeta</option>
            </select>
            <button
              type="button"
              onClick={addSale}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar</span>
            </button>
          </div>

          {/* Lista de ventas */}
          {sales.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Ventas registradas:</h4>
              {sales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      ${parseFloat(sale.value).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {sale.type === 'cash' ? 'Contado' : 'Tarjeta'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSale(sale.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gastos */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Truck className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
            Gastos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Flete
              </label>
              <input
                type="text"
                name="shipping"
                value={formData.shipping}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gastos Varios
              </label>
              <input
                type="text"
                name="miscellaneous_expenses"
                value={formData.miscellaneous_expenses}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Retiros de Empleados (Automáticos) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
            Retiros de Empleados (Automáticos)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                Retiro Fernando (10%)
              </label>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ${calculateFernandoWithdrawal().toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                Retiro Pedro (15%)
              </label>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ${calculatePedroWithdrawal().toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Categorías de Productos Dinámicas */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
            Categorías de Productos
          </h3>
          
          {/* Agregar nueva categoría */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              name="value"
              value={newCategory.value}
              onChange={handleCategoryChange}
              onKeyPress={handleCategoryKeyPress}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Valor (ej: 15000)"
            />
            <select
              name="type"
              value={newCategory.type}
              onChange={handleCategoryChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="accessories">Accesorios</option>
              <option value="sheet_metal">Chapa</option>
              <option value="led">Led</option>
            </select>
            <button
              type="button"
              onClick={addCategory}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar</span>
            </button>
          </div>

          {/* Lista de categorías */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Categorías registradas:</h4>
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                      ${parseFloat(cat.value).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {cat.type === 'accessories' ? 'Accesorios' : 
                       cat.type === 'sheet_metal' ? 'Chapa' : 'Led'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCategory(cat.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notas */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notas</h3>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Notas adicionales..."
          />
        </div>

        {/* Resumen */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumen del Día</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Ventas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${calculateTotalSales().toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Contado: ${calculateCashSales().toFixed(2)} | Tarjeta: ${calculateCardSales().toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Gastos</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${calculateTotalExpenses().toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Ganancia Neta</p>
              <p className={`text-2xl font-bold ${calculateNetProfit() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ${calculateNetProfit().toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{existingRecord ? 'Actualizar' : 'Guardar'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CashRegister;
