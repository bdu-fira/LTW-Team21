import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Space, Typography, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import OrderManagement from '../Components/admin/OrderManagement';
import orderService from '../Services/order.service';
import authService from '../Services/auth.service';

const OrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useMemo(() => authService.getCurrentUser(), []);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const isStaff = user?.role === 'Admin' || user?.role === 'Employee';

  const pageTitle = useMemo(() => {
    if (user?.role === 'Admin') return 'Đơn hàng toàn hệ thống';
    if (user?.role === 'Employee') return 'Đơn hàng cần theo dõi';
    return 'Đơn hàng của tôi';
  }, [user?.role]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = isStaff
        ? await orderService.getAllOrders()
        : await orderService.getMyOrders();

      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [isStaff]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    loadOrders();
  }, [loadOrders, navigate, user]);

  useEffect(() => {
    if (location.state?.justCreated) {
      message.success('Đơn hàng đã được xác nhận thành công');
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.state, navigate]);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await orderService.updateStatus(orderId, status);
      if (response.success) {
        message.success(response.message || 'Cập nhật trạng thái đơn hàng thành công');
        loadOrders();
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleOpenOrder = (order) => {
    navigate(`/orders/${order.id}`);
  };

  return (
    <div style={{ maxWidth: 1280, margin: '32px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <Typography.Title level={2} style={{ marginBottom: 4 }}>{pageTitle}</Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {isStaff
              ? 'Admin và nhân viên có thể theo dõi và cập nhật trạng thái đơn hàng.'
              : 'Bạn có thể theo dõi trạng thái đơn hàng của mình tại đây. Nhấn vào đơn đang chờ để xem chi tiết và thanh toán online.'}
          </Typography.Paragraph>
        </div>
        <Space>
          <Button onClick={loadOrders}>Tải lại</Button>
          {isStaff && <Button type="primary" onClick={() => navigate('/admin/dashboard')}>Về bảng quản trị</Button>}
        </Space>
      </div>

      <OrderManagement
        orders={orders}
        loading={loading}
        onUpdateStatus={handleUpdateStatus}
        readOnly={!isStaff}
        showCustomer={isStaff}
        title={pageTitle}
        onOpenOrder={!isStaff ? handleOpenOrder : undefined}
      />
    </div>
  );
};

export default OrdersPage;
