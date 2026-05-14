import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Image,
  List,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import { ArrowLeftOutlined, QrcodeOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import orderService from '../Services/order.service';
import authService from '../Services/auth.service';
import { getOrderStatusMeta } from '../utils/orderStatus';
import { getPaymentMethodMeta, isOnlinePayment } from '../utils/paymentMethod';
import { getProductImageUrl } from '../utils/productImage';
import { PAYMENT_QR_IMAGE_URL } from '../utils/paymentQr';

const formatCurrency = (value) => Number(value || 0).toLocaleString('vi-VN');
const formatDate = (value) => (value ? new Date(value).toLocaleString('vi-VN') : '-');

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useMemo(() => authService.getCurrentUser(), []);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.justCreated) {
      message.success('Đơn hàng đã được tạo thành công.');
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const loadOrder = async () => {
      setLoading(true);
      try {
        const response = await orderService.getById(id);
        if (response.success) {
          setOrder(response.data);
        }
      } catch (error) {
        message.error(error?.response?.data?.message || error.message || 'Không thể tải chi tiết đơn hàng');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, navigate, user]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <Card style={{ borderRadius: 24 }}>
        <Empty description="Không tìm thấy đơn hàng" />
      </Card>
    );
  }

  const statusMeta = getOrderStatusMeta(order.status);
  const paymentMeta = getPaymentMethodMeta(order.payment_method);
  const isOnlineMethod = isOnlinePayment(order.payment_method);
  const showQrSection = isOnlineMethod && order.status !== 'Refused';

  return (
    <div style={{ maxWidth: 1180, margin: '24px auto 40px' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')} style={{ marginBottom: 20 }}>
        Quay lại đơn hàng
      </Button>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={15}>
          <Card
            title={<Typography.Title level={3} style={{ margin: 0 }}>Chi tiết đơn hàng #{order.id}</Typography.Title>}
            style={{ borderRadius: 24 }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Descriptions column={1} size="middle">
                <Descriptions.Item label="Ngày tạo">{formatDate(order.created_at)}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={statusMeta.color}>{statusMeta.label}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức thanh toán">
                  <Tag color={isOnlineMethod ? 'geekblue' : 'green'}>{paymentMeta.label}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ giao hàng">
                  {order.shipping_address || 'Chưa cập nhật'}
                </Descriptions.Item>
              </Descriptions>

              <Alert
                type={statusMeta.value === 'Paid' ? 'success' : 'info'}
                showIcon
                message={statusMeta.description}
              />

              <Divider style={{ margin: 0 }} />

              <List
                itemLayout="horizontal"
                dataSource={order.items || []}
                locale={{ emptyText: 'Chưa có sản phẩm trong đơn hàng này' }}
                renderItem={(item) => (
                  <List.Item
                    extra={(
                      <Typography.Text strong style={{ color: '#cf1322' }}>
                        {formatCurrency(item.price * item.quantity)}đ
                      </Typography.Text>
                    )}
                  >
                    <List.Item.Meta
                      avatar={(
                        <img
                          src={getProductImageUrl(item.image)}
                          alt={item.name}
                          style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 10 }}
                          onError={(event) => {
                            event.currentTarget.src = 'https://via.placeholder.com/64?text=No';
                          }}
                        />
                      )}
                      title={item.name}
                      description={`Số lượng: ${item.quantity} x ${formatCurrency(item.price)}đ`}
                    />
                  </List.Item>
                )}
              />

              <Divider style={{ margin: 0 }} />

              <div style={{ textAlign: 'right' }}>
                <Typography.Title level={4} style={{ marginBottom: 0 }}>
                  Tổng cộng: <span style={{ color: '#cf1322' }}>{formatCurrency(order.total_amount)}đ</span>
                </Typography.Title>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card
              title={showQrSection ? <><QrcodeOutlined /> Thanh toán bằng mã QR</> : paymentMeta.label}
              style={{ borderRadius: 24 }}
            >
              {showQrSection ? (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Alert
                    type="info"
                    showIcon
                    message={`Quét mã QR bên dưới để thanh toán đơn hàng. Nếu cần đối chiếu, hãy ghi thêm mã đơn #${order.id} trong nội dung chuyển khoản.`}
                  />
                  <div style={{ textAlign: 'center' }}>
                    <Image
                      src={PAYMENT_QR_IMAGE_URL}
                      alt={`QR đơn hàng ${order.id}`}
                      preview={false}
                      style={{ width: '100%', maxWidth: 320, borderRadius: 16 }}
                    />
                  </div>
                  <Typography.Text type="secondary">
                    Sau khi chuyển khoản, bạn có thể giữ lại ảnh chụp giao dịch để đối chiếu khi cần.
                  </Typography.Text>
                </Space>
              ) : (
                <Alert
                  type="success"
                  showIcon
                  message="Bạn đã chọn thanh toán trực tiếp khi gặp mặt. Đơn hàng sẽ được xử lý và thanh toán khi giao hàng hoặc gặp trực tiếp."
                />
              )}
            </Card>

            <Card title="Thông tin người nhận" style={{ borderRadius: 24 }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Khách hàng">{order.customer_name || user?.name || '-'}</Descriptions.Item>
                <Descriptions.Item label="Email">{order.customer_email || user?.email || '-'}</Descriptions.Item>
                <Descriptions.Item label="Mã đơn">#{order.id}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetailPage;
