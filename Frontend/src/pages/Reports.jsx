import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Package, DollarSign, BarChart3, PieChart, Search, Download } from 'lucide-react';
import { reportsAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last7days');
  const [customDateRange, setCustomDateRange] = useState({ startDate: '', endDate: '' });
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [salesDetail, setSalesDetail] = useState({ sales: [], total: 0, page: 1, totalPages: 0 });
  const [detailPage, setDetailPage] = useState(1);
  const [detailSearch, setDetailSearch] = useState('');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    loadReport();
  }, [selectedPeriod, useCustomRange, customDateRange]);

  useEffect(() => {
    if (reportData) {
      loadSalesDetail();
    }
  }, [reportData, detailPage, detailSearch]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (useCustomRange && customDateRange.startDate && customDateRange.endDate) {
        const response = await reportsAPI.getCustom({
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate
        });
        data = response.data;
      } else {
        const response = await reportsAPI.getSummary(selectedPeriod);
        data = response.data;
      }

      setReportData(data);
    } catch (err) {
      setError('Error al cargar el reporte');
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSalesDetail = async () => {
    if (!reportData) return;

    try {
      const params = {
        startDate: reportData?.startDate,
        endDate: reportData?.endDate,
        page: detailPage,
        limit: 10,
        search: detailSearch || undefined
      };

      const result = await reportsAPI.getSalesDetail(params);
      setSalesDetail(result.data);
    } catch (err) {
      console.error('Error loading sales detail:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount || 0);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setUseCustomRange(false);
  };

  const handleCustomRangeSubmit = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      setUseCustomRange(true);
    }
  };

  const handleDetailSearch = () => {
    setDetailPage(1);
    loadSalesDetail();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reportes de Ventas</h1>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Download className="h-4 w-4" />
          <span>Exportar</span>
        </button>
      </div>

      {/* Selector de período */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Período de Análisis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Períodos predefinidos */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Períodos Predefinidos</h3>
            <div className="space-y-2">
              {[
                { value: 'today', label: 'Hoy' },
                { value: 'last7days', label: 'Últimos 7 días' },
                { value: 'last30days', label: 'Últimos 30 días' }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => handlePeriodChange(period.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedPeriod === period.value && !useCustomRange
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rango personalizado */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Rango Personalizado</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de inicio</label>
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de fin</label>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button
                onClick={handleCustomRangeSubmit}
                disabled={!customDateRange.startDate || !customDateRange.endDate}
                className={`w-full px-4 py-2 rounded-lg transition-colors ${
                  customDateRange.startDate && customDateRange.endDate
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                Aplicar Rango
              </button>
            </div>
          </div>
        </div>

        {reportData && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <Calendar className="inline h-4 w-4 mr-1" />
                             Período: {formatDate(reportData?.startDate)} - {formatDate(reportData?.endDate)}
            </p>
          </div>
        )}
      </div>

      {reportData && (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ventas</p>
                                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData?.metrics?.total_sales || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unidades Vendidas</p>
                                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData?.metrics?.total_units || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ingresos Totales</p>
                                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(reportData?.metrics?.total_revenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Promedio por Venta</p>
                                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(reportData?.metrics?.average_sale_value)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evolución de ventas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Evolución de Ventas</h3>
              <ResponsiveContainer width="100%" height={300}>
                                 <LineChart data={reportData?.evolution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => formatDate(value)}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value)}
                    formatter={(value, name) => [
                      name === 'sales_count' ? value : formatCurrency(value),
                      name === 'sales_count' ? 'Ventas' : name === 'total_units' ? 'Unidades' : 'Ingresos'
                    ]}
                  />
                  <Line type="monotone" dataKey="sales_count" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="total_revenue" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Productos más vendidos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Productos Más Vendidos</h3>
              <ResponsiveContainer width="100%" height={300}>
                                 <BarChart data={reportData?.topProducts || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product_name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Unidades']} />
                  <Bar dataKey="total_quantity" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribución por categorías */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución por Categorías</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                                     <Pie
                     data={reportData?.topCategories || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_quantity"
                  >
                    {(reportData?.topCategories || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Unidades']} />
                </RechartsPieChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                                     {(reportData?.topCategories || []).map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="font-medium dark:text-white">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold dark:text-white">{category.total_quantity} unidades</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(category.total_revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabla de detalle */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalle de Ventas</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por número de venta..."
                    value={detailSearch}
                    onChange={(e) => setDetailSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleDetailSearch()}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleDetailSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Buscar
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Número de Venta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Productos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Unidades
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {salesDetail.sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {sale.sale_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(sale.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {sale.products_count} productos
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {sale.total_items}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(sale.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {salesDetail.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Mostrando página {salesDetail.page} de {salesDetail.totalPages} ({salesDetail.total} ventas)
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setDetailPage(detailPage - 1)}
                    disabled={detailPage === 1}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      detailPage === 1
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setDetailPage(detailPage + 1)}
                    disabled={detailPage === salesDetail.totalPages}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      detailPage === salesDetail.totalPages
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
