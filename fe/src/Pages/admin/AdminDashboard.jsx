import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Col,
  Form,
  Grid,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Row,
  Select,
  Space,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  OrderedListOutlined,
  ShopOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import DashboardOverview from '../../Components/admin/DashboardOverview';
import ProductManagement from '../../Components/admin/ProductManagement';
import OrderManagement from '../../Components/admin/OrderManagement';
import EmployeeManagement from '../../Components/admin/EmployeeManagement';
import CustomerManagement from '../../Components/admin/CustomerManagement';
import {
  dashboardService,
  employeeService,
  orderService,
  productService,
} from '../../Services';
import { getProductImageUrl } from '../../utils/productImage';

const { Header, Content, Sider } = Layout;
const { Option } = Select;

const AdminDashboard = () => {
  const screens = Grid.useBreakpoint();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState({});
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(!screens.lg);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [fileList, setFileList] = useState([]);

  const token = localStorage.getItem('token');
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (error) {
      return {};
    }
  });

  const role = user?.role;
  const isAdmin = role === 'Admin';
  const isStaff = role === 'Admin' || role === 'Employee';

  useEffect(() => {
    setCollapsed(!screens.lg);
  }, [screens.lg]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await productService.getAll();
      setProducts(data.data || []);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Không thể tải sản phẩm');
      throw error;
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/categories');
      const result = await response.json();

      if (result.success) {
        setCategories(result.data || []);
        return;
      }

      throw new Error(result.message || 'Không thể tải danh mục');
    } catch (error) {
      message.error(error.message || 'Không thể tải danh mục');
      throw error;
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const response = await employeeService.getAllUsers();

      if (response.success) {
        const allUsers = response.data || [];
        setMembers(allUsers.filter((item) => item.role === 'Admin' || item.role === 'Employee'));
        setCustomers(allUsers.filter((item) => item.role === 'Customer'));
        return;
      }

      throw new Error(response.message || 'Không thể tải danh sách người dùng');
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Không thể tải danh sách người dùng');
      throw error;
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const response = await orderService.getAllOrders();

      if (response.success) {
        setOrders(response.data || []);
        return;
      }

      throw new Error(response.message || 'Không thể tải đơn hàng');
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Không thể tải đơn hàng');
      throw error;
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    setDashboardLoading(true);

    try {
      const currentYear = new Date().getFullYear();
      const [summaryResponse, revenueResponse, topProductsResponse] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getRevenueByMonth(currentYear),
        dashboardService.getTopProducts(5),
      ]);

      setDashboardSummary(summaryResponse.data || {});
      setMonthlyRevenue(revenueResponse.data || []);
      setTopProducts(topProductsResponse.data || []);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Không thể tải dashboard');
      throw error;
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token || !isStaff) {
      message.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }

    let isMounted = true;

    const bootstrap = async () => {
      setPageLoading(true);

      await Promise.allSettled([
        loadProducts(),
        loadCategories(),
        loadUsers(),
        loadOrders(),
        loadDashboard(),
      ]);

      if (isMounted) {
        setPageLoading(false);
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [isStaff, loadCategories, loadDashboard, loadOrders, loadProducts, loadUsers, navigate, token]);

  const resourceLoading = pageLoading || actionLoading;

  const closeProductModal = () => {
    setIsProductModalVisible(false);
    setEditingProduct(null);
    setFileList([]);
    form.resetFields();
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFileList([]);
    form.resetFields();
    setIsProductModalVisible(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFileList([]);
    form.setFieldsValue({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
      description: product.description,
    });
    setIsProductModalVisible(true);
  };

  const handleUpdateUserRole = async (userId, roleId) => {
    setActionLoading(true);

    try {
      const response = await employeeService.updateRole(userId, roleId);

      if (response.success) {
        message.success(response.message || 'Cập nhật quyền thành công');
        await loadUsers();
        await loadDashboard();
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Không thể cập nhật quyền');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    setActionLoading(true);

    try {
      const response = await orderService.updateStatus(orderId, status);

      if (response.success) {
        message.success(response.message || 'Cập nhật trạng thái thành công');
        await Promise.all([loadOrders(), loadProducts(), loadDashboard()]);
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Lỗi cập nhật đơn hàng');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddOrEditProduct = async (values) => {
    setActionLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('price', values.price);
      formData.append('stock', values.stock || 0);
      formData.append('category_id', values.category_id || '');
      formData.append('description', values.description || '');

      if (editingProduct?.image) {
        formData.append('currentImage', editingProduct.image);
      }

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      const response = editingProduct
        ? await productService.update(editingProduct.id, formData)
        : await productService.add(formData);

      if (response.success || response.productId) {
        message.success(editingProduct ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công');
        closeProductModal();
        await Promise.all([loadProducts(), loadDashboard()]);
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Thao tác thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    setActionLoading(true);

    try {
      const response = await productService.delete(id);
      message.success(response.message || 'Đã xóa sản phẩm');
      await Promise.all([loadProducts(), loadDashboard()]);
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Không thể xóa sản phẩm');
    } finally {
      setActionLoading(false);
    }
  };

  const menuItems = [
    { key: 'overview', icon: <DashboardOutlined />, label: 'Tổng quan' },
    { key: 'products', icon: <ShopOutlined />, label: 'Sản phẩm' },
    { key: 'orders', icon: <OrderedListOutlined />, label: 'Đơn hàng' },
    { key: 'members', icon: <TeamOutlined />, label: 'Nhân sự' },
    { key: 'customers', icon: <UserOutlined />, label: 'Khách hàng' },
  ];

  const headerTitle = menuItems.find((item) => item.key === activeTab)?.label || 'Dashboard';

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: '#f3f4f6',
        borderRadius: 28,
        overflow: 'hidden',
      }}
    >
      <Sider
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        breakpoint="lg"
        collapsedWidth={0}
        width={260}
        style={{
          background: '#fff',
          borderRight: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            padding: '24px 20px 12px',
            borderBottom: '1px solid #f3f4f6',
          }}
        >
          <Typography.Text
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 999,
              background: '#111827',
              color: '#fff',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            <DashboardOutlined />
            {isAdmin ? 'ADMIN PANEL' : 'EMPLOYEE PANEL'}
          </Typography.Text>

          <Typography.Title level={4} style={{ margin: '16px 0 4px' }}>
            Quản trị Phone Store
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Thống kê doanh thu, quản lý tồn kho và xử lý đơn hàng tập trung.
          </Typography.Paragraph>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          items={menuItems}
          onClick={(event) => {
            setActiveTab(event.key);

            if (!screens.lg) {
              setCollapsed(true);
            }
          }}
          style={{ borderInlineEnd: 'none', padding: '12px 8px' }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            borderBottom: '1px solid #e5e7eb',
            padding: screens.xs ? '14px 16px' : '16px 24px',
            height: 'auto',
            lineHeight: 'normal',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <Space size={12} align="center">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed((prev) => !prev)}
                style={{ fontSize: 18 }}
              />

              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {headerTitle}
                </Typography.Title>
                <Typography.Text type="secondary">
                  Xin chào, {user?.name || 'người dùng'} - vai trò hiện tại: {role}
                </Typography.Text>
              </div>
            </Space>

            <Button onClick={() => navigate('/')}>
              Quay về shop
            </Button>
          </div>
        </Header>

        <Content style={{ padding: screens.xs ? 16 : 24 }}>
          {activeTab === 'overview' && (
            <DashboardOverview
              summary={dashboardSummary}
              monthlyRevenue={monthlyRevenue}
              topProducts={topProducts}
              loading={dashboardLoading}
              products={products}
            />
          )}

          {activeTab === 'products' && (
            <ProductManagement
              products={products}
              loading={resourceLoading}
              onAdd={openCreateModal}
              onEdit={openEditModal}
              onDelete={handleDeleteProduct}
            />
          )}

          {activeTab === 'orders' && (
            <OrderManagement
              orders={orders}
              loading={resourceLoading}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}

          {activeTab === 'members' && (
            <EmployeeManagement
              members={members}
              loading={resourceLoading}
              onUpdateRole={handleUpdateUserRole}
              readOnly={!isAdmin}
              title="Nhân sự hệ thống"
              description={
                isAdmin
                  ? 'Admin có thể xem và điều chỉnh phân quyền của từng thành viên.'
                  : 'Nhân viên chỉ có quyền theo dõi danh sách nhân sự.'
              }
            />
          )}

          {activeTab === 'customers' && (
            <CustomerManagement
              customers={customers}
              loading={resourceLoading}
              title={isAdmin ? 'Quản lý khách hàng' : 'Khách hàng phụ trách'}
            />
          )}
        </Content>
      </Layout>

      <Modal
        title={editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
        open={isProductModalVisible}
        onCancel={closeProductModal}
        onOk={() => form.submit()}
        width={screens.xs ? '100%' : 680}
        confirmLoading={actionLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrEditProduct}>
          <Form.Item name="name" label="Tên điện thoại" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="price" label="Giá bán" rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="stock" label="Số lượng kho" rules={[{ required: true, message: 'Vui lòng nhập số lượng kho' }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="category_id" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
            <Select placeholder="Chọn danh mục">
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Ảnh sản phẩm">
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList: nextFileList }) => setFileList(nextFileList)}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                </div>
              )}
            </Upload>

            {editingProduct && !fileList.length && (
              <div style={{ marginTop: 12 }}>
                <Typography.Text type="secondary">Ảnh hiện tại</Typography.Text>
                <div style={{ marginTop: 10 }}>
                  <img
                    src={getProductImageUrl(editingProduct.image)}
                    alt="current"
                    style={{ width: 120, borderRadius: 14, border: '1px solid #e5e7eb', padding: 8, background: '#f8fafc' }}
                    onError={(event) => {
                      event.currentTarget.src = 'https://via.placeholder.com/120?text=No+Image';
                    }}
                  />
                </div>
              </div>
            )}
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminDashboard;
