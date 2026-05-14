import React, { useEffect, useState } from 'react';
import { Table, Button, message, Typography, Space, InputNumber, Popconfirm, Tag } from 'antd';
import { DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../Services';
import { getProductImageUrl } from '../utils/productImage';

const { Title, Text } = Typography;

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    try {
      const response = await cartService.getCart();

      if (response.success) {
        setCartItems(response.cart || []);
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Lỗi tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQty = async (productId, newQty, maxStock) => {
    if (newQty < 1) {
      return;
    }

    if (newQty > Number(maxStock || 0)) {
      message.warning(`Kho chỉ còn ${maxStock} sản phẩm`);
      return;
    }

    try {
      const response = await cartService.updateQuantity(productId, newQty);

      if (response.success) {
        fetchData();
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Không thể cập nhật số lượng');
    }
  };

  const handleRemove = async (productId) => {
    try {
      const response = await cartService.removeItem(productId);

      if (response.success) {
        message.success(response.message || 'Đã xóa sản phẩm');
        await fetchData();
        window.dispatchEvent(new Event('storage'));
      } else {
        message.error(response.message || 'Không thể xóa sản phẩm');
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Lỗi kết nối khi xóa sản phẩm');
    }
  };

  const goToCheckout = () => {
    if (cartItems.length === 0) {
      message.warning('Giỏ hàng của bạn đang trống');
      return;
    }

    navigate('/checkout');
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);

  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => (
        <Space align="start">
          <img
            src={getProductImageUrl(record.image)}
            alt={record.name}
            style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 8, cursor: 'pointer' }}
            onClick={() => navigate(`/product/${record.product_id}`)}
            onError={(event) => {
              event.currentTarget.src = 'https://via.placeholder.com/60?text=No';
            }}
          />
          <Space direction="vertical" size={4}>
            <Text strong style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${record.product_id}`)}>
              {record.name}
            </Text>
            <Tag color={Number(record.stock || 0) > 0 ? 'green' : 'red'}>
              {Number(record.stock || 0) > 0 ? `Còn ${record.stock} máy` : 'Hết hàng'}
            </Tag>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      render: (price) => <Text type="danger">{Number(price || 0).toLocaleString('vi-VN')}đ</Text>,
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => handleUpdateQty(record.product_id, record.quantity - 1, record.stock)}
          />
          <InputNumber min={1} value={record.quantity} readOnly style={{ width: 52, textAlign: 'center' }} />
          <Button
            size="small"
            icon={<PlusOutlined />}
            disabled={Number(record.quantity || 0) >= Number(record.stock || 0)}
            onClick={() => handleUpdateQty(record.product_id, record.quantity + 1, record.stock)}
          />
        </Space>
      ),
    },
    {
      title: 'Thành tiền',
      render: (_, record) => (
        <Text strong>{(Number(record.price || 0) * Number(record.quantity || 0)).toLocaleString('vi-VN')}đ</Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Popconfirm title="Xóa khỏi giỏ hàng?" onConfirm={() => handleRemove(record.product_id)}>
          <Button danger type="text" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: '40px 20px', maxWidth: 1100, margin: '0 auto' }}>
      <Title level={2}>Giỏ hàng của bạn</Title>

      <Table
        dataSource={cartItems}
        columns={columns}
        rowKey="product_id"
        loading={loading}
        pagination={false}
        scroll={{ x: 840 }}
        footer={() => (
          <div style={{ textAlign: 'right' }}>
            <Title level={4}>
              Tổng cộng: <Text type="danger">{totalAmount.toLocaleString('vi-VN')}đ</Text>
            </Title>
            <Button
              type="primary"
              size="large"
              style={{ marginTop: 10, paddingInline: 40 }}
              onClick={goToCheckout}
              disabled={cartItems.length === 0}
            >
              Thanh toán ngay
            </Button>
          </div>
        )}
      />
    </div>
  );
};

export default CartPage;
