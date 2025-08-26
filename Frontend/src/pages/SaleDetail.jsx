import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, DollarSign, ShoppingCart, Plus } from 'lucide-react';
import { salesAPI } from '../services/api';

const SaleDetail = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSale();
  }, [id]);

  const loadSale = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getById(id);
      setSale(response.data);
    } catch (err) {
      setError('Error al cargar la venta');
      console.error('Error loading sale:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Venta no encontrada</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {error || 'La venta que buscas no existe o ha sido eliminada.'}
        </p>
        <Link
          to="/sales"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="-ml-1 mr-2 h-5 w-5" />
          Volver al historial
        </Link>
      </div>
    );
  }

  const totalAmount = sale.items?.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/sales"
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver al historial</span>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Completada
          </div>
        </div>
      </div>

      {/* Información principal de la venta */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{sale.sale_number}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Detalle de la venta</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalAmount)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total de la venta</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha y hora</p>
              <p className="text-sm text-gray-900 dark:text-white">{formatDate(sale.created_at)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Productos vendidos</p>
              <p className="text-sm text-gray-900 dark:text-white">{sale.items?.length || 0} productos</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cantidad total</p>
              <p className="text-sm text-gray-900 dark:text-white">{sale.total_items} unidades</p>
            </div>
          </div>
        </div>
      </div>

             {/* Lista de productos vendidos */}
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-200">
         <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
           <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Productos vendidos</h2>
         </div>

         {sale.items && sale.items.length > 0 ? (
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
               <thead className="bg-gray-50 dark:bg-gray-700">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Producto
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Categoría
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Cantidad
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Precio Unitario
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Total
                   </th>
                 </tr>
               </thead>
               <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                 {sale.items.map((item, index) => (
                   <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div>
                         <div className="text-sm font-medium text-gray-900 dark:text-white">
                           {item.product_name}
                         </div>
                         <div className="text-sm text-gray-500 dark:text-gray-400">
                           ID: {item.product_id}
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                         {item.category}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900 dark:text-white">{item.quantity}</div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900 dark:text-white">
                         {formatCurrency(item.unit_price)}
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-900 dark:text-white">
                         {formatCurrency(item.total_price)}
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         ) : (
           <div className="text-center py-12">
             <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
             <h3 className="text-sm font-medium text-gray-900 dark:text-white">No hay productos en esta venta</h3>
             <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
               Esta venta no contiene productos.
             </p>
           </div>
         )}
       </div>

             {/* Resumen de la venta */}
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
         <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumen de la venta</h2>
         
         <div className="space-y-3">
           <div className="flex justify-between items-center">
             <span className="text-gray-600 dark:text-gray-400">Número de productos:</span>
             <span className="font-medium dark:text-white">{sale.items?.length || 0}</span>
           </div>
           
           <div className="flex justify-between items-center">
             <span className="text-gray-600 dark:text-gray-400">Cantidad total de unidades:</span>
             <span className="font-medium dark:text-white">{sale.total_items}</span>
           </div>
           
           <div className="flex justify-between items-center">
             <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
             <span className="font-medium dark:text-white">{formatCurrency(totalAmount)}</span>
           </div>
           
           <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
             <div className="flex justify-between items-center">
               <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
               <span className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(totalAmount)}</span>
             </div>
           </div>
         </div>
       </div>

             {/* Acciones */}
       <div className="flex justify-center space-x-4">
         <Link
           to="/sales/new"
           className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
         >
           <Plus className="-ml-1 mr-2 h-5 w-5" />
           Nueva Venta
         </Link>
         
         <Link
           to="/sales"
           className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 shadow-sm text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
         >
           <ArrowLeft className="-ml-1 mr-2 h-5 w-5" />
           Volver al historial
         </Link>
       </div>
    </div>
  );
};

export default SaleDetail;
