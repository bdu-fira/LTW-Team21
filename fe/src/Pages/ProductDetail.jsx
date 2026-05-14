import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Input,
  InputNumber,
  Modal,
  Radio,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import { LeftOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { productService, orderService } from '../Services';
import { getProductImageUrl } from '../utils/productImage';
import { PAYMENT_METHOD_OPTIONS, isOnlinePayment } from '../utils/paymentMethod';
import { PAYMENT_QR_ALT, PAYMENT_QR_IMAGE_URL } from '../utils/paymentQr';

const { TextArea } = Input;
const { Text } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [processing, setProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [newOrderId, setNewOrderId] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await productService.getById(id);
        setProduct(data.data);
      } catch (error) {
        message.error(error?.response?.data?.message || error.message || 'Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleBuyNow = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      message.warning('Vui lòng đăng nhập để thực hiện mua hàng');
      return;
    }

    if (!shippingAddress.trim()) {
      message.warning('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    if (Number(product?.stock || 0) <= 0) {
      message.warning('Sản phẩm này hiện đã hết hàng');
      return;
    }

    setProcessing(true);

    try {
      const response = await orderService.checkoutDirectly({
        product_id: product.id,
        quantity,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
      });

      if (response.success) {
        message.success(response.message || 'Đặt hàng thành công');
        if (isOnlinePayment(paymentMethod)) {
          setNewOrderId(response.data?.id);
          setShowQR(true);
        } else {
          navigate(`/orders/${response.data?.id}`, { state: { justCreated: true } });
        }
      } else {
        message.error(response.message || 'Đặt hàng thất bại');
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Lỗi hệ thống khi thanh toán');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1040, margin: '40px auto', padding: '0 20px' }}>
        <Card bordered={false} style={{ borderRadius: 24 }}>
          <Skeleton active avatar paragraph={{ rows: 10 }} />
        </Card>
      </div>
    );
  }

  if (!product) {
    return <div style={{ textAlign: 'center', padding: 80 }}>Sản phẩm không tồn tại</div>;
  }

  return (
    <div style={{ maxWidth: 1040, margin: '40px auto', padding: '0 20px' }}>
      <Button icon={<LeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        Quay lại
      </Button>

      <Card bordered={false} style={{ borderRadius: 24, boxShadow: '0 18px 50px rgba(15,23,42,0.08)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
          <div style={{ background: '#f8f8f7', borderRadius: 22, padding: 24, flex: '1 1 360px' }}>
            <img
              src={getProductImageUrl(product.image)}
              alt={product.name}
              style={{ width: '100%', height: 420, objectFit: 'contain' }}
              onError={(event) => {
                event.currentTarget.src = 'https://via.placeholder.com/420?text=No+Image';
              }}
            />
          </div>

          <div style={{ flex: '1 1 360px' }}>
            <Space size={10} wrap style={{ marginBottom: 12 }}>
              {product.brand && <Tag color="blue">{product.brand}</Tag>}
              <Tag color={Number(product.stock || 0) > 0 ? 'green' : 'red'}>
                {Number(product.stock || 0) > 0 ? `Còn ${product.stock} máy` : 'Hết hàng'}
              </Tag>
            </Space>

            <h1 style={{ fontSize: 36, marginBottom: 14 }}>{product.name}</h1>
            <p style={{ fontSize: 28, color: '#cf1322', fontWeight: 700, marginBottom: 20 }}>
              {Number(product.price || 0).toLocaleString('vi-VN')} đ
            </p>

            <Card style={{ marginBottom: 24, background: '#fafaf8', borderRadius: 18 }}>
              <h3 style={{ marginBottom: 10 }}>Mô tả sản phẩm</h3>
              <p style={{ color: '#555', lineHeight: 1.7 }}>
                {product.description || 'Đang cập nhật nội dung mô tả cho sản phẩm này...'}
              </p>
              <p style={{ marginTop: 14, fontWeight: 600, color: Number(product.stock || 0) > 0 ? '#7c5c16' : '#cf1322' }}>
                Còn lại trong kho: {Number(product.stock || 0)} sản phẩm
              </p>
            </Card>

            <Space size="large" align="end" wrap>
              <div>
                <div style={{ fontSize: 12, color: '#777', marginBottom: 6 }}>Số lượng</div>
                <InputNumber
                  min={1}
                  max={Math.max(Number(product.stock || 0), 1)}
                  value={quantity}
                  onChange={(value) => setQuantity(Number(value || 1))}
                  disabled={Number(product.stock || 0) <= 0}
                />
              </div>
            </Space>

            <Card style={{ marginTop: 24, borderRadius: 18, background: '#fffdf8' }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Địa chỉ giao hàng</div>
                  <TextArea
                    rows={3}
                    placeholder="Nhập địa chỉ nhận hàng chi tiết..."
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                  />
                </div>

                <div>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>Phương thức thanh toán</div>
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
                          Khi bạn bấm vào thanh toán bằng mã QR, hệ thống sẽ hiện đúng mã này để bạn quét.
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
                    : 'Bạn chọn thanh toán trực tiếp khi gặp mặt. Hệ thống vẫn tạo đơn để bạn theo dõi tiến độ.'}
                />

                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleBuyNow}
                  loading={processing}
                  disabled={Number(product.stock || 0) <= 0}
                  style={{ background: '#1f2937', borderColor: '#1f2937', minWidth: 220 }}
                >
                  {Number(product.stock || 0) > 0
                    ? (isOnlinePayment(paymentMethod) ? 'Tiếp tục đến mã QR' : 'Mua ngay')
                    : 'Hết hàng'}
                </Button>
              </Space>
            </Card>
          </div>
        </div>
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

export default ProductDetail;
