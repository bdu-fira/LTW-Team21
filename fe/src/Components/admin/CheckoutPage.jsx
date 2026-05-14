import React from 'react';
import { Card, Button, Typography, Divider } from 'antd';

const { Title, Text } = Typography;

const CheckoutPage = () => {
    return (
        <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
            <Card>
                <Title level={2}>Xác nhận thanh toán</Title>
                <Divider />
                <div style={{ marginBottom: '20px' }}>
                    <Text strong>Vui lòng kiểm tra lại giỏ hàng và địa chỉ giao hàng trước khi đặt hàng.</Text>
                </div>
                <Button type="primary" size="large" block>
                    Đặt hàng ngay
                </Button>
            </Card>
        </div>
    );
};

export default CheckoutPage;