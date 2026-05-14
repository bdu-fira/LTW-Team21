import { Navigate } from 'react-router-dom';
import authService from '../Services/auth.service';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = authService.getCurrentUser();

  // 1. Nếu chưa đăng nhập -> Đá về trang chủ
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. Nếu đã đăng nhập nhưng Role không nằm trong danh sách cho phép
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Hoặc trang "Không có quyền"
  }

  return children;
};

export default ProtectedRoute;