import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Divider,
  Empty,
  Input,
  List,
  Modal,
  Radio,
  Space,
  Spin,
  Typography,
  message,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { cartService, orderService } from '../Services';
import { getProductImageUrl } from '../utils/productImage';
import { PAYMENT_METHOD_OPTIONS, isOnlinePayment } from '../utils/paymentMethod';
import { PAYMENT_QR_ALT, PAYMENT_QR_IMAGE_URL } from '../utils/paymentQr';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [processing, setProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [newOrderId, setNewOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await cartService.getCart();
        if (res.success) {
          setCartItems(res.cart);
        }
      } catch (error) {
        message.error('Không thể tải giỏ hàng');
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const calculateTotal = () =>
    cartItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

  const handleCheckout = async () => {
    if (!address.trim()) {
      return message.warning('Vui lòng nhập địa chỉ giao hàng');
    }

    setProcessing(true);

    try {
      const res = await orderService.checkoutCart({
        shippingAddress: address,
        paymentMethod,
      });

      if (res.success) {
        message.success(res.message || 'Đặt hàng thành công');
        window.dispatchEvent(new Event('storage'));

        if (isOnlinePayment(paymentMethod)) {
          setNewOrderId(res.data?.id);
          setShowQR(true);
        } else {
          navigate(`/orders/${res.data?.id}`, { state: { justCreated: true } });
        }
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Thanh toán thất bại');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: '50px' }}>
        <Card>
          <Empty description="Giỏ hàng trống" />
          <Button onClick={() => navigate('/')}>Quay lại mua sắm</Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '920px', margin: '0 auto' }}>
      <Card
        title={<Title level={3} style={{ margin: 0 }}>Xác nhận đơn hàng</Title>}
        style={{ borderRadius: 24 }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message="Sau khi xác nhận, đơn hàng sẽ xuất hiện trong mục Đơn hàng để bạn theo dõi trạng thái."
          />

          <List
            itemLayout="horizontal"
            dataSource={cartItems}
            renderItem={(item) => (
              <List.Item extra={<Text strong>{(Number(item.price) * Number(item.quantity)).toLocaleString('vi-VN')}đ</Text>}>
                <List.Item.Meta
                  avatar={(
                    <img
                      src={getProductImageUrl(item.image)}
                      alt={item.name}
                      style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 8 }}
                      onError={(event) => {
                        event.currentTarget.src = 'https://via.placeholder.com/56?text=No';
                      }}
                    />
                  )}
                  title={item.name}
                  description={`Số lượng: ${item.quantity} x ${Number(item.price).toLocaleString('vi-VN')}đ`}
                />
              </List.Item>
            )}
          />

          <Divider style={{ margin: 0 }} />

          <div style={{ textAlign: 'right' }}>
            <Title level={4} style={{ marginBottom: 0 }}>
              Tổng cộng: <span style={{ color: '#f5222d' }}>{calculateTotal().toLocaleString('vi-VN')}đ</span>
            </Title>
          </div>

          <div>
            <Title level={5}>Địa chỉ giao hàng</Title>
            <TextArea
              rows={4}
              placeholder="Nhập địa chỉ nhận hàng chi tiết..."
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>

          <div>
            <Title level={5}>Phương thức thanh toán</Title>
            <Radio.Group
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {PAYMENT_METHOD_OPTIONS.map((method) => (
                  <Card
                    key={method.value}
                    size="small"
                    hoverable
                    onClick={() => setPaymentMethod(method.value)}
                    style={{
                      borderColor: paymentMethod === method.value ? '#1677ff' : '#e5e7eb',
                      background: paymentMethod === method.value ? '#f0f7ff' : '#fff',
                    }}
                  >
                    <Radio value={method.value}>
                      <Space direction="vertical" size={2}>
                        <Text strong>{method.label}</Text>
                        <Text type="secondary">{method.description}</Text>
                      </Space>
                    </Radio>
                  </Card>
                ))}
              </Space>
            </Radio.Group>

            {isOnlinePayment(paymentMethod) && (
              <Card
                size="small"
                style={{
                  marginTop: 16,
                  borderRadius: 16,
                  borderColor: '#91caff',
                  background: '#f7fbff',
                }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Text strong>Mã QR thanh toán của shop</Text>
                  <Text type="secondary">
                    Khi bạn thanh toán bằng mã QR, Sẽ giúp cho đơn hàng của bạn được đẩy nhanh tiến trình hơn.
                  </Text>
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={PAYMENT_QR_IMAGE_URL}
                      alt={PAYMENT_QR_ALT}
                      style={{
                        width: '100%',
                        maxWidth: 280,
                        borderRadius: 16,
                        border: '1px solid #e5e7eb',
                        background: '#fff',
                      }}
                    />
                  </div>
                </Space>
              </Card>
            )}
          </div>

          <Alert
            type={isOnlinePayment(paymentMethod) ? 'info' : 'success'}
            showIcon
            message={isOnlinePayment(paymentMethod)
              ? 'Sau khi tạo đơn, hệ thống sẽ tiếp tục hiện mã QR này để bạn hoàn tất chuyển khoản.'
              : 'Bạn chọn thanh toán trực tiếp khi gặp mặt. Đơn hàng vẫn sẽ được tạo để bạn theo dõi trạng thái.'}
          />

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Button size="large" onClick={() => navigate('/cart')}>
              Quay lại giỏ hàng
            </Button>
            <Button type="primary" size="large" onClick={handleCheckout} loading={processing}>
              {isOnlinePayment(paymentMethod) ? 'Tiếp tục xác nhận thanh toán' : 'Xác nhận đặt hàng'}
            </Button>
          </div>
        </Space>
      </Card>

      <Modal
        title="Thanh toán bằng mã QR"
        open={showQR}
        onOk={() => navigate(`/orders/${newOrderId}`, { state: { justCreated: true } })}
        onCancel={() => navigate(`/orders/${newOrderId}`, { state: { justCreated: true } })}
        okText="Tôi đã thanh toán"
        cancelText="Đóng"
        centered
      >
        <div style={{ textAlign: 'center' }}>
          <p>Vui lòng quét mã QR bên dưới để hoàn tất thanh toán:</p>
          <img
            src={PAYMENT_QR_IMAGE_URL}
            alt={PAYMENT_QR_ALT}
            style={{ width: '100%', maxWidth: 300, borderRadius: 8 }}
          />
          {newOrderId ? (
            <div style={{ marginTop: 12 }}>
              <Text type="secondary">Mã đơn của bạn: #{newOrderId}</Text>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
};

export default CheckoutPage;
