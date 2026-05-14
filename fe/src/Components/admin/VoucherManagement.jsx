import React from 'react';
import { Table, Tag, Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const VoucherManagement = ({ vouchers }) => {
    const columns = [
        { 
            title: 'Mã Voucher', 
            dataIndex: 'code', 
            key: 'code',
            render: (code) => <Tag color="purple" style={{ fontWeight: 'bold' }}>{code}</Tag>
        },
        { 
            title: 'Giảm giá', 
            dataIndex: 'discount', 
            key: 'discount',
            render: (val) => <b className="text-green-600">{val}%</b>,
            sorter: (a, b) => a.discount - b.discount
        },
        { 
            title: 'Ngày hết hạn', 
            dataIndex: 'expiry', 
            key: 'expiry' 
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => (
                <Tag color={status === 'Active' || !status ? 'green' : 'red'}>
                    {status ? status.toUpperCase() : 'ĐANG HOẠT ĐỘNG'}
                </Tag>
            )
        }
    ];

    return (
        <Card 
            title="Quản lý mã giảm giá" 
            extra={<Button type="primary" icon={<PlusOutlined />}>Tạo Voucher mới</Button>}
        >
            <Table 
                columns={columns} 
                dataSource={vouchers} 
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />
        </Card>
    );
};

export default VoucherManagement;