import React from 'react';
import { Row, Col, Divider, Button } from 'antd';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={6}>
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-3xl">📱</span>
                <span className="text-white">PhoneStore</span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Cua hang ban dien thoai hang dau voi nhung san pham chat luong cao va dich vu tuyet voi.
              </p>
              <div className="flex gap-4 mt-4">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors text-2xl"><FacebookOutlined /></a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors text-2xl"><TwitterOutlined /></a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors text-2xl"><InstagramOutlined /></a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors text-2xl"><LinkedinOutlined /></a>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <h4 className="text-lg font-bold mb-4">Lien ket nhanh</h4>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-gray-400 hover:text-white transition-colors">Trang chu</Link>
              <Link to="/products" className="text-gray-400 hover:text-white transition-colors">San pham</Link>
              <Link to="/cart" className="text-gray-400 hover:text-white transition-colors">Gio hang</Link>
              <Link to="/support" className="text-gray-400 hover:text-white transition-colors">Ho tro</Link>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <h4 className="text-lg font-bold mb-4">Danh muc</h4>
            <div className="flex flex-col gap-3">
              <Link to="/products" className="text-gray-400 hover:text-white transition-colors">Apple iPhone</Link>
              <Link to="/products" className="text-gray-400 hover:text-white transition-colors">Samsung Galaxy</Link>
              <Link to="/products" className="text-gray-400 hover:text-white transition-colors">Xiaomi Series</Link>
              <Link to="/products" className="text-gray-400 hover:text-white transition-colors">Khac</Link>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <h4 className="text-lg font-bold mb-4">Lien he</h4>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 items-center">
                <PhoneOutlined className="text-gray-400" />
                <a href="tel:0889237769" className="text-gray-400 hover:text-white transition-colors">0889237769</a>
              </div>
              <div className="flex gap-2 items-start">
                <MailOutlined className="text-gray-400 mt-1" />
                <a href="mailto:support@phonestore.com" className="text-gray-400 hover:text-white transition-colors">support@phonestore.com</a>
              </div>
              <div className="flex gap-2 items-start">
                <EnvironmentOutlined className="text-gray-400 mt-1" />
                <span className="text-gray-400">Binh Duong, Viet Nam</span>
              </div>
            </div>
          </Col>
        </Row>

        <Divider style={{ borderColor: '#4b5563' }} />

        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} sm={12}>
            <p className="text-gray-500 text-center sm:text-left">
              &copy; 2026 <span className="font-bold text-white">PhoneStore</span> | Du an Dai hoc Binh Duong
            </p>
          </Col>
          <Col xs={24} sm={12} className="text-center sm:text-right">
            <div className="flex gap-4 justify-center sm:justify-end flex-wrap">
              <Link to="/support" className="text-gray-500 hover:text-white transition-colors text-sm">Chinh sach bao mat</Link>
              <span className="text-gray-600">|</span>
              <Link to="/support" className="text-gray-500 hover:text-white transition-colors text-sm">Dieu khoan dich vu</Link>
              <span className="text-gray-600">|</span>
              <Link to="/support" className="text-gray-500 hover:text-white transition-colors text-sm">Tro giup</Link>
            </div>
          </Col>
        </Row>
      </div>

      <div className="fixed bottom-8 right-8 hidden lg:block">
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          type="primary"
          shape="circle"
          size="large"
          className="bg-gray-700 border-none shadow-lg hover:shadow-xl transition-all text-2xl h-14 w-14 flex items-center justify-center hover:bg-gray-600"
        >
          ↑
        </Button>
      </div>
    </footer>
  );
};

export default Footer;
