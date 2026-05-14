import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
// Đảm bảo đường dẫn import này chính xác với cấu trúc thư mục của bạn
import authService from '../Services/auth.service'; 

const LoginModal = ({ visible, onClose, onSwitchToRegister }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm(); // Sử dụng instance của form để control dữ liệu

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Gọi service login với email và password từ Form
      const res = await authService.login(values.email, values.password);
      
      if (res.success) {
        message.success(`Chào mừng trở lại, ${res.user.name}!`);
        
        form.resetFields(); // Xóa dữ liệu trên form
        onClose(); // Đóng Modal

        // Tùy chọn: Nếu bạn dùng React Router, nên dùng navigate thay vì reload
        // Nếu dùng reload để cập nhật Header nhanh:
        setTimeout(() => {
            window.location.reload();
        }, 500);
      }
    } catch (err) {
      // err.message lúc này đã được xử lý ở auth.service.js
      message.error(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại!");
    } finally {
      setLoading(false);
    }
  };

  // Hàm đóng modal và reset dữ liệu
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal 
      title={<div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}>ĐĂNG NHẬP</div>} 
      open={visible} 
      onCancel={handleCancel} 
      footer={null}
      centered
      destroyOnClose // Tự động hủy các thành phần bên trong khi đóng
    >
      <Form 
        form={form}
        layout="vertical" 
        onFinish={onFinish}
        initialValues={{ remember: true }}
      >
        <Form.Item 
          label="Email" 
          name="email" 
          rules={[
            { required: true, message: 'Vui lòng nhập Email!' },
            { type: 'email', message: 'Email không đúng định dạng!' }
          ]}
        >
          <Input placeholder="example@gmail.com" size="large" />
        </Form.Item>

        <Form.Item 
          label="Mật khẩu" 
          name="password" 
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password placeholder="Nhập mật khẩu" size="large" />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            block 
            size="large"
            style={{ backgroundColor: '#1890ff', fontWeight: 'bold' }}
          >
            ĐĂNG NHẬP
          </Button>
        </Form.Item>
        
        <div style={{ textAlign: 'center' }}>
          Bạn chưa có tài khoản?{' '}
          <a 
            style={{ color: '#1890ff', fontWeight: 'bold' }} 
            onClick={() => {
              form.resetFields();
              onSwitchToRegister();
            }}
          >
            Đăng ký ngay
          </a>
        </div>
      </Form>
    </Modal>
  );
};

export default LoginModal;