import React, { useState } from 'react';
import { Table, Card, Select, Modal, Input, message, Tag, Typography, Space, Empty } from 'antd';
import { ORDER_STATUS_OPTIONS, getOrderStatusMeta } from '../../utils/orderStatus';

const OrderManagement = ({
  orders = [],
  loading = false,
  onUpdateStatus,
  readOnly = false,
  title = 'Danh sách đơn hàng',
  showCustomer = true,
  onOpenOrder,
}) => {
  const [isRefuseModalVisible, setIsRefuseModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [refusalReason, setRefusalReason] = useState('');

  const canOpenOrder = (record) => readOnly && typeof onOpenOrder === 'function' && record.status === 'Pending';

  const handleStatusChange = async (orderId, newStatus) => {
    if (readOnly) return;

    if (newStatus === 'Refused') {
      setCurrentOrder(orderId);
      setIsRefuseModalVisible(true);
      return;
    }

    onUpdateStatus(orderId, newStatus);
  };

  const confirmRefusal = () => {
    if (!refusalReason) {
      return message.warning('Vui lòng nhập lý do từ chối');
    }
    onUpdateStatus(currentOrder, 'Refused');
    setIsRefuseModalVisible(false);
    setRefusalReason('');
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id, record) => (
        <Tag
          color={canOpenOrder(record) ? 'processing' : 'blue'}
          style={canOpenOrder(record) ? { cursor: 'pointer' } : undefined}
          onClick={(event) => {
            if (!canOpenOrder(record)) {
              return;
            }

            event.stopPropagation();
            onOpenOrder(record);
          }}
        >
          #{id}
        </Tag>
      ),
    },
    ...(showCustomer
      ? [{
          title: 'Khách hàng',
          key: 'customer',
          render: (_, record) => (
            <div>
              <div style={{ fontWeight: 'bold' }}>{record.customer_name || 'Khách hàng'}</div>
              <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                {record.customer_email || record.customer_phone || '-'}
              </Typography.Text>
            </div>
          ),
        }]
      : []),
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value) => (value ? new Date(value).toLocaleString('vi-VN') : '-'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      align: 'right',
      render: (value) => (
        <Typography.Text strong style={{ color: '#d32f2f' }}>
          {Number(value || 0).toLocaleString('vi-VN')}₫
        </Typography.Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 200,
      render: (status, record) => {
        const meta = getOrderStatusMeta(status);

        if (readOnly) {
          return <Tag color={meta.color}>{meta.label}</Tag>;
        }

        return (
          <Select
            value={status}
            style={{ width: '100%' }}
            onChange={(value) => handleStatusChange(record.id, value)}
            disabled={status === 'Received' || status === 'Refused'}
            options={ORDER_STATUS_OPTIONS.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
          />
        );
      },
    },
    {
      title: 'Diễn giải',
      key: 'description',
      render: (_, record) => {
        const meta = getOrderStatusMeta(record.status);
        return <Typography.Text type="secondary">{meta.description}</Typography.Text>;
      },
    },
  ];

  return (
    <>
      <Card title={<Typography.Title level={4} style={{ margin: 0 }}>{title}</Typography.Title>} style={{ marginBottom: 20 }}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading ? { spinning: true, tip: 'Đang tải đơn hàng...' } : false}
          locale={{
            emptyText: <Empty description="Chưa có đơn hàng nào" />,
          }}
          pagination={{
            pageSize: 8,
            showTotal: (total) => `Tổng cộng ${total} đơn hàng`,
          }}
          scroll={{ x: 800 }}
          onRow={(record) => (
            canOpenOrder(record)
              ? {
                  onClick: () => onOpenOrder(record),
                  style: { cursor: 'pointer' },
                }
              : {}
          )}
        />
      </Card>

      <Modal
        title="Lý do từ chối đơn hàng"
        open={isRefuseModalVisible}
        onOk={confirmRefusal}
        onCancel={() => {
          setIsRefuseModalVisible(false);
          setRefusalReason('');
        }}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Typography.Text>
            Vui lòng nhập lý do (ví dụ: Hết hàng, sai thông tin khách hàng...)
          </Typography.Text>
          <Input.TextArea
            rows={4}
            placeholder="Nhập lý do tại đây..."
            value={refusalReason}
            onChange={(event) => setRefusalReason(event.target.value)}
          />
        </Space>
      </Modal>
    </>
  );
};

export default OrderManagement;
