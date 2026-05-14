import React from 'react';
import { Table, Tag, Typography } from 'antd';

const CustomerManagement = ({ customers = [], loading = false, title = 'Khách hàng' }) => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color="green">{role}</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value) => (value ? new Date(value).toLocaleString('vi-VN') : '-'),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Typography.Title level={3} style={{ marginBottom: 8 }}>{title}</Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 18 }}>
        Danh sách khách hàng để nhân viên theo dõi và hỗ trợ.
      </Typography.Paragraph>

      <Table
        columns={columns}
        dataSource={customers}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        scroll={{ x: 760 }}
      />
    </div>
  );
};

export default CustomerManagement;
