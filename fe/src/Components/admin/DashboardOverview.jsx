import React, { useMemo } from 'react';
import {
  Card,
  Col,
  Empty,
  List,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  AppstoreOutlined,
  DollarCircleOutlined,
  FireOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getProductImageUrl } from '../../utils/productImage';

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')} đ`;

const summaryCardStyles = {
  borderRadius: 24,
  minHeight: 164,
  boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
};

const chartCardStyles = {
  borderRadius: 28,
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)',
};

const DashboardLoading = () => (
  <div>
    <Row gutter={[20, 20]}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Col xs={24} sm={12} xl={6} key={index}>
          <Card style={summaryCardStyles}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        </Col>
      ))}
    </Row>

    <Row gutter={[20, 20]} style={{ marginTop: 12 }}>
      <Col xs={24} xl={16}>
        <Card style={{ ...chartCardStyles, minHeight: 420 }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </Col>
      <Col xs={24} xl={8}>
        <Card style={{ ...chartCardStyles, minHeight: 420 }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </Col>
    </Row>
  </div>
);

const DashboardOverview = ({
  summary = {},
  monthlyRevenue = [],
  topProducts = [],
  loading = false,
  products = [],
}) => {
  const lowStockProducts = useMemo(
    () => products
      .filter((product) => Number(product.stock || 0) <= 5)
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
      .slice(0, 5),
    [products]
  );

  const cards = [
    {
      title: 'Tổng doanh thu',
      value: Number(summary.total_revenue || 0),
      prefix: <DollarCircleOutlined />,
      color: '#1677ff',
      formatter: formatCurrency,
      caption: `${Number(summary.total_orders || 0)} đơn hàng đã tạo`,
    },
    {
      title: 'Người dùng',
      value: Number(summary.total_users || 0),
      prefix: <UserOutlined />,
      color: '#7c3aed',
      caption: `${Number(summary.total_customers || 0)} khách hàng, ${Number(summary.total_staff || 0)} nhân sự`,
    },
    {
      title: 'Sản phẩm',
      value: Number(summary.total_products || 0),
      prefix: <AppstoreOutlined />,
      color: '#059669',
      caption: `${Number(summary.out_of_stock_products || 0)} sản phẩm hết hàng`,
    },
    {
      title: 'Cảnh báo tồn kho',
      value: Number(summary.low_stock_products || 0),
      prefix: <FireOutlined />,
      color: '#d97706',
      caption: 'Sản phẩm còn từ 1 đến 5 máy',
    },
  ];

  const topProductChartData = topProducts.map((product) => ({
    ...product,
    short_name: product.name?.length > 24 ? `${product.name.slice(0, 24)}...` : product.name,
  }));

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
          padding: '28px 30px',
          borderRadius: 28,
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 42%, #334155 100%)',
          color: '#fff',
        }}
      >
        <Typography.Text style={{ color: 'rgba(255,255,255,0.75)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Dashboard Admin
        </Typography.Text>
        <Typography.Title level={2} style={{ color: '#fff', margin: '8px 0 10px' }}>
          Theo dõi doanh thu, đơn hàng và sức khỏe tồn kho theo thời gian thực
        </Typography.Title>
        <Typography.Paragraph style={{ color: 'rgba(255,255,255,0.78)', marginBottom: 0 }}>
          Biểu đồ doanh thu theo tháng và Top 5 điện thoại bán chạy được lấy trực tiếp từ backend để admin thao tác nhanh hơn.
        </Typography.Paragraph>
      </div>

      <Row gutter={[20, 20]}>
        {cards.map((card) => (
          <Col xs={24} sm={12} xl={6} key={card.title}>
            <Card bordered={false} style={summaryCardStyles}>
              <Statistic
                title={card.title}
                value={card.value}
                prefix={card.prefix}
                formatter={card.formatter}
                valueStyle={{ color: card.color, fontWeight: 700 }}
              />
              <Typography.Text type="secondary">{card.caption}</Typography.Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 12 }}>
        <Col xs={24} xl={16}>
          <Card
            title="Doanh thu theo tháng"
            extra={<Tag color="blue">{new Date().getFullYear()}</Tag>}
            style={chartCardStyles}
          >
            {monthlyRevenue.length > 0 ? (
              <div style={{ width: '100%', height: 360 }}>
                <ResponsiveContainer>
                  <AreaChart data={monthlyRevenue}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1677ff" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#1677ff" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis
                      tickFormatter={(value) => `${Math.round(Number(value || 0) / 1000000)}M`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value) : value,
                        name === 'revenue' ? 'Doanh thu' : 'Đơn hàng',
                      ]}
                      labelFormatter={(label) => `Tháng ${String(label).replace('T', '')}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#1677ff"
                      fill="url(#revenueGradient)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu doanh thu trong năm này" />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card
            title="Top 5 điện thoại bán chạy"
            extra={<Tag color="geekblue">Best seller</Tag>}
            style={chartCardStyles}
          >
            {topProductChartData.length > 0 ? (
              <div style={{ width: '100%', height: 360 }}>
                <ResponsiveContainer>
                  <BarChart data={topProductChartData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="short_name"
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'sold_quantity' ? `${value} máy` : formatCurrency(value),
                        name === 'sold_quantity' ? 'Đã bán' : 'Doanh thu',
                      ]}
                    />
                    <Bar dataKey="sold_quantity" radius={[0, 12, 12, 0]}>
                      {topProductChartData.map((item) => (
                        <Cell
                          key={item.id}
                          fill={Number(item.stock || 0) === 0 ? '#ef4444' : '#111827'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu bán chạy" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 12 }}>
        <Col xs={24} xl={12}>
          <Card title="Sản phẩm cần chú ý tồn kho" style={chartCardStyles}>
            <List
              dataSource={lowStockProducts}
              locale={{ emptyText: 'Hiện chưa có sản phẩm tồn kho thấp.' }}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={(
                      <img
                        src={getProductImageUrl(item.image)}
                        alt={item.name}
                        style={{ width: 54, height: 54, objectFit: 'contain', borderRadius: 12, background: '#f8fafc', padding: 6 }}
                        onError={(event) => {
                          event.currentTarget.src = 'https://via.placeholder.com/54?text=No';
                        }}
                      />
                    )}
                    title={item.name}
                    description={
                      <Space size={8} wrap>
                        <Tag color={Number(item.stock || 0) === 0 ? 'red' : 'gold'}>
                          {Number(item.stock || 0) === 0 ? 'Hết hàng' : `Còn ${item.stock} máy`}
                        </Tag>
                        {item.brand && <Typography.Text type="secondary">{item.brand}</Typography.Text>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card title="Top 5 bán chạy chi tiết" style={chartCardStyles}>
            <List
              dataSource={topProducts}
              locale={{ emptyText: 'Chưa có sản phẩm nào được ghi nhận trong danh sách bán chạy.' }}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space size={10} wrap>
                        <Tag color={index === 0 ? 'gold' : 'blue'}>#{index + 1}</Tag>
                        <Typography.Text strong>{item.name}</Typography.Text>
                      </Space>
                    }
                    description={
                      <Space size={12} wrap>
                        <Typography.Text type="secondary">Đã bán: {item.sold_quantity} máy</Typography.Text>
                        <Typography.Text type="secondary">Còn kho: {item.stock} máy</Typography.Text>
                      </Space>
                    }
                  />
                  <Typography.Text strong style={{ color: '#cf1322' }}>
                    {formatCurrency(item.revenue)}
                  </Typography.Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverview;
