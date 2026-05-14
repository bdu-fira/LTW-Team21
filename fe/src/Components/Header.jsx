import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Grid,
  Input,
  message,
  Modal,
  Space,
  Typography,
} from 'antd';
import {
  DashboardOutlined,
  LogoutOutlined,
  MenuOutlined,
  MobileOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import authService from '../Services/auth.service';
import cartService from '../Services/cart.service';

const { Text, Title } = Typography;

const Header = () => {
  const screens = Grid.useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(authService.getCurrentUser());
  const [cartItems, setCartItems] = useState([]);
  const [isAuthVisible, setAuthVisible] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isDesktop = !!screens.lg;
  const isStaff = user?.role === 'Admin' || user?.role === 'Employee';
  const isRegisterMode = authMode === 'register';
  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );

  const resetAuthFields = useCallback(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }, []);

  const openAuthModal = useCallback((mode = 'login') => {
    setAuthMode(mode);
    setAuthVisible(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthVisible(false);
    setAuthMode('login');
    resetAuthFields();
  }, [resetAuthFields]);

  const syncSession = useCallback(async () => {
    const nextUser = authService.getCurrentUser();
    setUser(nextUser);

    if (!nextUser) {
      setCartItems([]);
      return;
    }

    try {
      const response = await cartService.getCart();

      if (response.success) {
        setCartItems(response.cart || []);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    syncSession();
    window.addEventListener('storage', syncSession);

    return () => window.removeEventListener('storage', syncSession);
  }, [syncSession]);

  const handleHomeClick = (event) => {
    event?.preventDefault();
    setDrawerOpen(false);

    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    navigate('/');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 150);
  };

  const handleProductClick = (event) => {
    event?.preventDefault();
    setDrawerOpen(false);

    const scrollToSection = () => {
      const element = document.getElementById('product-showcase');

      if (!element) {
        return;
      }

      const offset = isDesktop ? 112 : 88;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
    };

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(scrollToSection, 400);
      return;
    }

    scrollToSection();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      message.warning('Vui long nhap day du email va mat khau');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(email, password);

      if (response.success) {
        setUser(response.user);
        message.success('Dang nhap thanh cong');
        closeAuthModal();
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      message.error(error.message || 'Dang nhap that bai');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      message.warning('Vui long nhap day du thong tin dang ky');
      return;
    }

    if (password.length < 6) {
      message.warning('Mat khau can it nhat 6 ky tu');
      return;
    }

    if (password !== confirmPassword) {
      message.warning('Mat khau xac nhan khong khop');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(name, email, password);

      if (response.success) {
        message.success(response.message || 'Dang ky thanh cong');
        setAuthMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      message.error(error.message || 'Dang ky that bai');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCartItems([]);
    setDrawerOpen(false);
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  const navItems = [
    { key: 'home', label: 'Trang chu', onClick: handleHomeClick },
    { key: 'products', label: 'San pham', onClick: handleProductClick },
    { key: 'orders', label: 'Don hang', to: '/orders' },
    { key: 'support', label: 'Ho tro', to: '/support' },
  ];

  const renderNavItem = (item) => {
    if (item.to) {
      return (
        <Link
          key={item.key}
          to={item.to}
          onClick={() => setDrawerOpen(false)}
          style={{ color: '#e5e7eb', fontWeight: 600 }}
        >
          {item.label}
        </Link>
      );
    }

    return (
      <button
        key={item.key}
        type="button"
        onClick={item.onClick}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#e5e7eb',
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
        }}
      >
        {item.label}
      </button>
    );
  };

  return (
    <>
      <header
        style={{
          background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)',
          color: '#fff',
          padding: isDesktop ? '0 36px' : '0 16px',
          minHeight: isDesktop ? 88 : 72,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 10px 28px rgba(15, 23, 42, 0.18)',
          gap: 12,
        }}
      >
        <div
          onClick={handleHomeClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              background: '#b49a6c',
              padding: isDesktop ? 11 : 9,
              borderRadius: 14,
              boxShadow: '0 8px 18px rgba(180, 154, 108, 0.32)',
            }}
          >
            <MobileOutlined style={{ fontSize: isDesktop ? 28 : 22, color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: isDesktop ? 24 : 19, fontWeight: 800, letterSpacing: '0.02em' }}>
              PHONE<span style={{ color: '#b49a6c' }}>STORE</span>
            </div>
            {isDesktop && (
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
                Premium mobile shopping experience
              </Text>
            )}
          </div>
        </div>

        {isDesktop && (
          <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {navItems.map(renderNavItem)}
          </nav>
        )}

        <Space size={isDesktop ? 18 : 10} align="center">
          <Badge count={cartCount} color="#b49a6c" size="default">
            <ShoppingCartOutlined
              style={{ fontSize: isDesktop ? 28 : 24, color: '#fff', cursor: 'pointer' }}
              onClick={() => navigate('/cart')}
            />
          </Badge>

          {user ? (
            <Space size={isDesktop ? 16 : 10} align="center">
              {isStaff && isDesktop && (
                <Button
                  type="primary"
                  icon={<DashboardOutlined />}
                  onClick={() => navigate('/admin/dashboard')}
                  style={{ background: '#b49a6c', border: 'none', fontWeight: 700 }}
                >
                  Quan tri
                </Button>
              )}

              {isDesktop ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar size={40} icon={<UserOutlined />} style={{ border: '2px solid #b49a6c' }} />
                  <div style={{ lineHeight: 1.2 }}>
                    <Text style={{ color: '#fff', display: 'block', fontWeight: 700 }}>{user.name}</Text>
                    <Text style={{ color: '#b49a6c', fontSize: 11 }}>{user.role?.toUpperCase()}</Text>
                  </div>
                  <LogoutOutlined style={{ color: '#ff7875', fontSize: 20, cursor: 'pointer' }} onClick={handleLogout} />
                </div>
              ) : (
                <Avatar size={36} icon={<UserOutlined />} style={{ border: '2px solid #b49a6c' }} />
              )}
            </Space>
          ) : (
            isDesktop && (
              <Button
                type="primary"
                onClick={() => openAuthModal('login')}
                style={{ background: '#b49a6c', border: 'none', fontWeight: 700 }}
              >
                Dang nhap
              </Button>
            )
          )}

          {!isDesktop && (
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: '#fff', fontSize: 22 }} />}
              onClick={() => setDrawerOpen(true)}
            />
          )}
        </Space>
      </header>

      <Drawer
        title="Menu"
        placement="right"
        open={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={280}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {navItems.map((item) => (
              <Button
                key={item.key}
                block
                size="large"
                onClick={item.to ? () => { navigate(item.to); setDrawerOpen(false); } : item.onClick}
              >
                {item.label}
              </Button>
            ))}
          </Space>

          {user ? (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div
                style={{
                  padding: 16,
                  borderRadius: 18,
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                }}
              >
                <Space align="center">
                  <Avatar size={44} icon={<UserOutlined />} />
                  <div>
                    <Text strong style={{ display: 'block' }}>{user.name}</Text>
                    <Text type="secondary">{user.role}</Text>
                  </div>
                </Space>
              </div>

              {isStaff && (
                <Button type="primary" icon={<DashboardOutlined />} onClick={() => { navigate('/admin/dashboard'); setDrawerOpen(false); }}>
                  Vao trang quan tri
                </Button>
              )}

              <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
                Dang xuat
              </Button>
            </Space>
          ) : (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button type="primary" onClick={() => { setDrawerOpen(false); openAuthModal('login'); }}>
                Dang nhap
              </Button>
              <Button onClick={() => { setDrawerOpen(false); openAuthModal('register'); }}>
                Dang ky
              </Button>
            </Space>
          )}
        </Space>
      </Drawer>

      <Modal
        title={<Title level={3} style={{ margin: 0 }}>{isRegisterMode ? 'Dang ky tai khoan' : 'Dang nhap'}</Title>}
        open={isAuthVisible}
        onCancel={closeAuthModal}
        footer={null}
        centered
      >
        <div style={{ padding: '20px 0' }}>
          {isRegisterMode && (
            <Input
              size="large"
              placeholder="Ho va ten"
              value={name}
              onChange={(event) => setName(event.target.value)}
              style={{ marginBottom: 16, borderRadius: 10 }}
              prefix={<UserOutlined />}
            />
          )}

          <Input
            size="large"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={{ marginBottom: 16, borderRadius: 10 }}
            prefix={<UserOutlined />}
            onPressEnter={isRegisterMode ? handleRegister : handleLogin}
          />

          <Input.Password
            size="large"
            placeholder="Mat khau"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{ marginBottom: isRegisterMode ? 16 : 24, borderRadius: 10 }}
            onPressEnter={isRegisterMode ? handleRegister : handleLogin}
          />

          {isRegisterMode && (
            <Input.Password
              size="large"
              placeholder="Nhap lai mat khau"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              style={{ marginBottom: 24, borderRadius: 10 }}
              onPressEnter={handleRegister}
            />
          )}

          <Button
            type="primary"
            block
            size="large"
            loading={loading}
            onClick={isRegisterMode ? handleRegister : handleLogin}
            style={{ background: '#111827', height: 48, fontWeight: 700 }}
          >
            {isRegisterMode ? 'Tao tai khoan' : 'Vao cua hang'}
          </Button>

          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <Text type="secondary">
              {isRegisterMode ? 'Da co tai khoan?' : 'Chua co tai khoan?'}{' '}
            </Text>
            <Button
              type="link"
              style={{ paddingInline: 4 }}
              onClick={() => setAuthMode(isRegisterMode ? 'login' : 'register')}
            >
              {isRegisterMode ? 'Dang nhap ngay' : 'Dang ky tai day'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Header;
