import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, DatePicker, Space } from 'antd';
import { ShoppingCartOutlined, DollarCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { orderService } from '../../Services';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

// Đăng ký các thành phần của Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([]);
    const [brandStats, setBrandStats] = useState([]);
    const [dates, setDates] = useState([dayjs().subtract(30, 'day'), dayjs()]);

    useEffect(() => {
        fetchStats();
    }, [dates]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const startDate = dates ? dates[0].format('YYYY-MM-DD') : null;
            const endDate = dates ? dates[1].format('YYYY-MM-DD') : null;

            const [revenueRes, brandRes] = await Promise.all([
                orderService.getRevenueStats(startDate, endDate),
                orderService.getRevenueByBrand(startDate, endDate)
            ]);
            if (revenueRes.success) setStats(revenueRes.data);
            if (brandRes.success) setBrandStats(brandRes.data);
        } catch (error) {
            console.error("Lỗi lấy thống kê:", error);
        } finally {
            setLoading(false);
        }
    };

    const chartData = {
        labels: stats.map(item => item.date),
        datasets: [
            {
                fill: true,
                label: 'Doanh thu (VNĐ)',
                data: stats.map(item => item.daily_revenue),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4, // Tạo độ cong cho đường kẻ
            },
        ],
    };

    const pieData = {
        labels: brandStats.map(item => item.brand || 'Khác'),
        datasets: [
            {
                label: 'Doanh thu theo hãng',
                data: brandStats.map(item => item.revenue),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',  // Blue (Samsung/Apple)
                    'rgba(249, 115, 22, 0.7)',  // Orange (Xiaomi)
                    'rgba(16, 185, 129, 0.7)',  // Green
                    'rgba(139, 92, 246, 0.7)',  // Purple
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    if (loading) return <div className="text-center py-20"><Spin size="large" /></div>;

    const totalRevenue = stats.reduce((sum, item) => sum + Number(item.daily_revenue), 0);
    const totalOrders = stats.reduce((sum, item) => sum + item.total_orders, 0);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Báo Cáo Tổng Quan</h1>
                <Space direction="vertical" size={12}>
                    <RangePicker 
                        value={dates}
                        onChange={(values) => setDates(values)}
                        format="DD/MM/YYYY"
                        allowClear={false}
                    />
                </Space>
            </div>
            
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} sm={8}>
                    <Card className="shadow-sm border-0">
                        <Statistic 
                            title="Tổng Doanh Thu" 
                            value={totalRevenue} 
                            precision={0}
                            prefix={<DollarCircleOutlined className="text-blue-500" />} 
                            suffix="đ"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="shadow-sm border-0">
                        <Statistic 
                            title="Tổng Đơn Hàng" 
                            value={totalOrders} 
                            prefix={<ShoppingCartOutlined className="text-green-500" />} 
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card title="Doanh thu 30 ngày qua" className="shadow-sm border-0">
                        <div style={{ height: '400px' }}>
                            <Line data={chartData} options={options} />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Tỉ lệ theo hãng" className="shadow-sm border-0">
                        <div style={{ height: '400px', display: 'flex', justifyContent: 'center' }}>
                            <Pie data={pieData} />
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;