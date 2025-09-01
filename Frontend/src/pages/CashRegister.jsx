import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Truck, CreditCard, User, Package, AlertTriangle, Save, Plus } from 'lucide-react';
import { cashRegisterAPI } from '../services/api';

const CashRegister = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    cash_sales: '',
    card_sales: '',
    shipping: '',
    miscellaneous_expenses: '',
    fernando_withdrawal: '',
    pedro_withdrawal: '',
    accessories: '',
    sheet_metal: '',
    led: '',
    notes: ''
  });

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
      if (response.data) {
        setExistingRecord(response.data);
        setFormData({
          date: response.data.date,
          cash_sales: response.data.cash_sales || '',
          card_sales: response.data.card_sales || '',
          shipping: response.data.shipping || '',
          miscellaneous_expenses: response.data.miscellaneous_expenses || '',
          fernando_withdrawal: response.data.fernando_withdrawal || '',
          pedro_withdrawal: response.data.pedro_withdrawal || '',
          accessories: response.data.accessories || '',
          sheet_metal: response.data.sheet_metal || '',
          led: response.data.led || '',
          notes: response.data.notes || ''
        });
      } else {
        setExistingRecord(null);
        resetForm();
      }
    } catch (error) {
      // Si no existe registro, continuar normalmente
      setExistingRecord(null);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      cash_sales: '',
      card_sales: '',
      shipping: '',
      miscellaneous_expenses: '',
      fernando_withdrawal: '',
      pedro_withdrawal: '',
      accessories: '',
      sheet_metal: '',
      led: '',
      notes: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotalSales = () => {
    const cash = parseFloat(formData.cash_sales) || 0;
    const card = parseFloat(formData.card_sales) || 0;
    return cash + card;
  };

  const calculateTotalExpenses = () => {
    const shipping = parseFloat(formData.shipping) || 0;
    const misc = parseFloat(formData.miscellaneous_expenses) || 0;
    const fernando = parseFloat(formData.fernando_withdrawal) || 0;
    const pedro = parseFloat(formData.pedro_withdrawal) || 0;
    const accessories = parseFloat(formData.accessories) || 0;
    const sheetMetal = parseFloat(formData.sheet_metal) || 0;
    const led = parseFloat(formData.led) || 0;
    return shipping + misc + fernando + pedro + accessories + sheetMetal + led;
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
      if (existingRecord) {
        await cashRegisterAPI.update(existingRecord.id, formData);
        setSuccess('Registro actualizado correctamente');
      } else {
        await cashRegisterAPI.create(formData);
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

        {/* Ventas */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
            Ventas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Venta de Contado
              </label>
              <input
                type="text"
                name="cash_sales"
                value={formData.cash_sales}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Venta Tarjeta
              </label>
              <input
                type="text"
                name="card_sales"
                value={formData.card_sales}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>
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

        {/* Retiros de Empleados */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
            Retiros de Empleados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Retiro Fernando (10%)
              </label>
              <input
                type="text"
                name="fernando_withdrawal"
                value={formData.fernando_withdrawal}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Retiro Pedro (15%)
              </label>
              <input
                type="text"
                name="pedro_withdrawal"
                value={formData.pedro_withdrawal}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Categorías de Productos */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
            Categorías de Productos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Accesorios
              </label>
              <input
                type="text"
                name="accessories"
                value={formData.accessories}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chapa
              </label>
              <input
                type="text"
                name="sheet_metal"
                value={formData.sheet_metal}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Led
              </label>
              <input
                type="text"
                name="led"
                value={formData.led}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>
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
