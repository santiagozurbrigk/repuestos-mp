import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';

import CategoryManagement from './pages/CategoryManagement';
import CashRegister from './pages/CashRegister';
import CashHistory from './pages/CashHistory';
import Reports from './pages/Reports';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />
            
            {/* Rutas protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                  <Sidebar />
                  <main className="lg:ml-64">
                    <div className="px-4 py-8 lg:px-8">
                      <Dashboard />
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/products" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                  <Sidebar />
                  <main className="lg:ml-64">
                    <div className="px-4 py-8 lg:px-8">
                      <ProductList />
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            } />
            

            
            <Route path="/cash-register" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                  <Sidebar />
                  <main className="lg:ml-64">
                    <div className="px-4 py-8 lg:px-8">
                      <CashRegister />
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/cash-history" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                  <Sidebar />
                  <main className="lg:ml-64">
                    <div className="px-4 py-8 lg:px-8">
                      <CashHistory />
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                  <Sidebar />
                  <main className="lg:ml-64">
                    <div className="px-4 py-8 lg:px-8">
                      <Reports />
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/categories" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                  <Sidebar />
                  <main className="lg:ml-64">
                    <div className="px-4 py-8 lg:px-8">
                      <CategoryManagement />
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
