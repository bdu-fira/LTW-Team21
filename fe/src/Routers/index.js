import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../Pages/HomePage';
import Dashboard from '../Pages/Dashboard';
import OrdersPage from '../Pages/OrdersPage';
import OrderDetailPage from '../Pages/OrderDetailPage';
import AdminDashboard from '../Pages/admin/AdminDashboard';
import CartPage from '../Pages/CartPage';
import CheckoutPage from '../Pages/CheckoutPage';
import ProductDetail from '../Pages/ProductDetail';
import SupportPage from '../Pages/SupportPage';
import ProtectedRoute from '../Components/ProtectedRoute';

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/products" element={<HomePage />} />
    <Route path="/support" element={<SupportPage />} />
    <Route path="/product/:id" element={<ProductDetail />} />
    <Route path="/profile" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
    <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
    <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
    <Route
      path="/admin/dashboard"
      element={(
        <ProtectedRoute allowedRoles={['Admin', 'Employee']}>
          <AdminDashboard />
        </ProtectedRoute>
      )}
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRouter;
