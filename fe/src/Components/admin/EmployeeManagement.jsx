import React, { useMemo, useState } from 'react';
import { Table, Button, Modal, Select, Space, Tag, Typography } from 'antd';

const roleOptions = [
  { value: 1, label: 'Admin', color: 'red' },
  { value: 2, label: 'Employee', color: 'blue' },
  { value: 3, label: 'Customer', color: 'green' },
];

const EmployeeManagement = ({
  members = [],
  loading = false,
  onUpdateRole,
  readOnly = false,
  title = 'Thành viên hệ thống',
  description = 'Danh sách Admin và Employee hiện có.',
}) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [newRole, setNewRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const roleColorMap = useMemo(
    () => roleOptions.reduce((map, role) => ({ ...map, [role.label]: role.color }), {}),
    []
  );

  const openModal = (member) => {
    setSelectedMember(member);
    setNewRole(member.role_id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMember(null);
    setNewRole(null);
    setIsModalOpen(false);
  };

  const handleAssignRole = async () => {
    if (!selectedMember || !newRole || readOnly) {
      return;
    }

    await onUpdateRole(selectedMember.id, newRole);
    closeModal();
  };

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
      render: (role) => <Tag color={roleColorMap[role] || 'default'}>{role}</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value) => (value ? new Date(value).toLocaleString('vi-VN') : '-'),
    },
  ];

  if (!readOnly) {
    columns.push({
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" onClick={() => openModal(record)}>
            Phân quyền
          </Button>
        </Space>
      ),
    });
  }

  return (
    <div style={{ padding: '20px' }}>
      <Typography.Title level={3} style={{ marginBottom: 8 }}>{title}</Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 18 }}>
        {description}
      </Typography.Paragraph>

      <Table
        columns={columns}
        dataSource={members}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        scroll={{ x: 860 }}
      />

      <Modal
        title="Cập nhật vai trò"
        open={isModalOpen}
        onOk={handleAssignRole}
        onCancel={closeModal}
      >
        {selectedMember && (
          <div>
            <p><strong>Người dùng:</strong> {selectedMember.name || selectedMember.email}</p>
            <Select
              value={newRole}
              onChange={setNewRole}
              style={{ width: '100%', marginTop: '10px' }}
              options={roleOptions.map((role) => ({
                value: role.value,
                label: role.label,
              }))}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeManagement;
