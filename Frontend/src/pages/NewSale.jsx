import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
import { productsAPI, salesAPI } from '../services/api';

const NewSale = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // Filtrar productos basado en el término de búsqueda
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll({ limit: 1000 });
      setProducts(response.data.products);
    } catch (err) {
      setError('Error al cargar productos');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      // Si ya existe en el carrito, aumentar cantidad
      if (existingItem.quantity < product.quantity) {
        setCart(cart.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setError(`No hay suficiente stock. Disponible: ${product.quantity}`);
      }
    } else {
      // Agregar nuevo item al carrito
      if (product.quantity > 0) {
        setCart([...cart, {
          product_id: product.id,
          product_name: product.name,
          category: product.category,
          quantity: 1,
          unit_price: 0, // Precio inicial en 0
          available_stock: product.quantity
        }]);
      } else {
        setError('Este producto no tiene stock disponible');
      }
    }
    setError(null);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find(item => item.product_id === productId);
    if (newQuantity > item.available_stock) {
      setError(`No hay suficiente stock. Disponible: ${item.available_stock}`);
      return;
    }

    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
    setError(null);
  };

  const updateCartPrice = (productId, newPrice) => {
    const price = parseFloat(newPrice) || 0;
    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, unit_price: price }
        : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      setError('Debe agregar al menos un producto al carrito');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
             const saleData = {
         items: cart.map(item => ({
           product_id: item.product_id,
           quantity: item.quantity,
           unit_price: item.unit_price || 0
         }))
       };

      const response = await salesAPI.create(saleData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/sales');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la venta');
      console.error('Error creating sale:', err);
    } finally {
      setSaving(false);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nueva Venta</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 px-3 py-2 rounded-lg">
            <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Total: ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-green-600 dark:text-green-400">¡Venta creada exitosamente! Redirigiendo...</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Búsqueda y lista de productos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Buscar Productos</h2>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>ID: {product.id}</span>
                      <span>Categoría: {product.category}</span>
                      <span className={`font-medium ${product.quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        Stock: {product.quantity}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.quantity === 0}
                    className={`ml-4 p-2 rounded-lg transition-colors ${
                      product.quantity > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Carrito de compras */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Carrito de Compras</h2>
          
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No hay productos en el carrito</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Busca y agrega productos para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.product_id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{item.product_name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                        className="p-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                        disabled={item.quantity >= item.available_stock}
                        className={`p-1 rounded ${
                          item.quantity >= item.available_stock
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="ml-2 p-1 rounded bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Campo de precio */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Precio unitario:</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_price || ''}
                        onChange={(e) => updateCartPrice(item.product_id, e.target.value)}
                        className="pl-8 pr-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total: ${((item.unit_price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">Total de productos:</span>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{totalItems}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-gray-900 dark:text-white">Total de la venta:</span>
                  <span className="font-bold text-lg text-green-600 dark:text-green-400">${totalAmount.toFixed(2)}</span>
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={saving || cart.length === 0}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    saving || cart.length === 0
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {saving ? 'Procesando venta...' : 'Confirmar Venta'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewSale;
