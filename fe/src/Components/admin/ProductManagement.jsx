import React from 'react';
import { Table, Button, Space, Popconfirm, Tag, Card, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { getProductImageUrl } from '../../utils/productImage';

const getStockTag = (stock) => {
  if (stock <= 0) {
    return <Tag color="red">Hết hàng</Tag>;
  }

  if (stock <= 5) {
    return <Tag color="volcano">Sắp hết</Tag>;
  }

  if (stock <= 10) {
    return <Tag color="gold">Tồn kho thấp</Tag>;
  }

  return <Tag color="green">Ổn định</Tag>;
};

const ProductManagement = ({ products, loading, onAdd, onEdit, onDelete }) => {
  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image',
      width: 90,
      render: (image) => (
        <img
          src={getProductImageUrl(image)}
          alt="product"
          style={{
            width: 52,
            height: 52,
            objectFit: 'contain',
            borderRadius: 10,
            backgroundColor: '#f8fafc',
            border: '1px solid #e5e7eb',
          }}
          onError={(event) => {
            event.currentTarget.src = 'https://via.placeholder.com/52?text=No';
          }}
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{name}</Typography.Text>
          {record.brand && <Typography.Text type="secondary">{record.brand}</Typography.Text>}
        </Space>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      render: (price) => <b style={{ color: '#cf1322' }}>{Number(price || 0).toLocaleString('vi-VN')} đ</b>,
      sorter: (a, b) => Number(a.price || 0) - Number(b.price || 0),
    },
    {
      title: 'Kho',
      dataIndex: 'stock',
      width: 180,
      render: (stock) => (
        <Space direction="vertical" size={4}>
          <Typography.Text>{Number(stock || 0)} máy</Typography.Text>
          {getStockTag(Number(stock || 0))}
        </Space>
      ),
      sorter: (a, b) => Number(a.stock || 0) - Number(b.stock || 0),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => onEdit(record)} size="small" />
          <Popconfirm
            title="Xóa sản phẩm này?"
            onConfirm={() => onDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Danh sách sản phẩm"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>Thêm mới</Button>}
      styles={{ body: { paddingTop: 12 } }}
    >
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        Theo dõi tồn kho, chỉnh sửa thông tin và xử lý nhanh các sản phẩm sắp hết hàng.
      </Typography.Paragraph>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 6, showSizeChanger: false }}
        scroll={{ x: 880 }}
      />
    </Card>
  );
};

export default ProductManagement;
