import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Space, Typography } from 'antd';
import authService from '../Services/auth.service';
import { AppstoreOutlined, ShoppingOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
    window.location.reload();
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{ maxWidth: 1080, margin: '32px auto', padding: '0 20px' }}>
      <Card style={{ borderRadius: 24 }}>
        <Typography.Title level={2}>Xin chào, {user.name || user.email}</Typography.Title>
        <Typography.Paragraph>Email: {user.email}</Typography.Paragraph>
        <Typography.Paragraph>Vai trò: {user.role}</Typography.Paragraph>

        <Space wrap>
          <Button type="primary" icon={<ShoppingOutlined />} onClick={() => navigate('/orders')}>
            Xem đơn hàng
          </Button>
          {(user.role === 'Admin' || user.role === 'Employee') && (
            <>
              <Button icon={<DashboardOutlined />} onClick={() => navigate('/admin/dashboard')}>
                Bảng điều khiển Admin
              </Button>
              <Button icon={<AppstoreOutlined />} onClick={() => navigate('/admin/categories')}>
                Quản lý danh mục
              </Button>
            </>
          )}
          <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Dashboard;
