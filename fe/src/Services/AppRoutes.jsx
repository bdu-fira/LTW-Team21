import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from '../Components/Header';
import authService from '../Services/auth.service';

// Giả định các Component trang (Bạn cần import các file thực tế tại đây)
const HomePage = () => <div className="p-10"><h1>Chào mừng đến với Phone Store</h1></div>;
const CartPage = () => <div className="p-10"><h1>Giỏ hàng của bạn</h1></div>;
const AdminDashboard = () => <div className="p-10"><h1>Hệ thống quản trị</h1></div>;

// Component bảo vệ Route (Yêu cầu đăng nhập hoặc quyền Admin)
const ProtectedRoute = ({ children, isAdmin = false }) => {
    const user = authService.getCurrentUser();
    if (!user) return <Navigate to="/" />;
    if (isAdmin && user.role !== 'Admin' && user.role !== 'Employee') return <Navigate to="/" />;
    return children;
};

const AppRoutes = () => {
  return (
    <>
      <Header />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute isAdmin={true}><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  );
};

export default AppRoutes;