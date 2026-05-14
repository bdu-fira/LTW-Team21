const db = require('../config/db');

const tableExists = async (tableName) => {
    try {
        await db.query('SELECT 1 FROM ?? LIMIT 1', [tableName]);
        return true;
    } catch (error) {
        return false;
    }
};

const resolveOrderItemsTable = async () => {
    if (await tableExists('order_items')) {
        return 'order_items';
    }

    return null;
};

const getSummary = async (req, res) => {
    try {
        const [[orderSummary]] = await db.query(`
            SELECT
                COUNT(*) AS total_orders,
                COALESCE(SUM(CASE WHEN status <> 'Refused' THEN total_amount ELSE 0 END), 0) AS total_revenue
            FROM orders
        `);

        const [[userSummary]] = await db.query(`
            SELECT
                COUNT(*) AS total_users,
                SUM(CASE WHEN r.name_role = 'Customer' THEN 1 ELSE 0 END) AS total_customers,
                SUM(CASE WHEN r.name_role IN ('Admin', 'Employee') THEN 1 ELSE 0 END) AS total_staff
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
        `);

        const [[productSummary]] = await db.query(`
            SELECT
                COUNT(*) AS total_products,
                SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) AS out_of_stock_products,
                SUM(CASE WHEN stock > 0 AND stock <= 5 THEN 1 ELSE 0 END) AS low_stock_products
            FROM products
        `);

        res.json({
            success: true,
            data: {
                total_revenue: Number(orderSummary.total_revenue || 0),
                total_orders: Number(orderSummary.total_orders || 0),
                total_users: Number(userSummary.total_users || 0),
                total_customers: Number(userSummary.total_customers || 0),
                total_staff: Number(userSummary.total_staff || 0),
                total_products: Number(productSummary.total_products || 0),
                out_of_stock_products: Number(productSummary.out_of_stock_products || 0),
                low_stock_products: Number(productSummary.low_stock_products || 0),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getRevenueByMonth = async (req, res) => {
    const requestedYear = Number(req.query.year) || new Date().getFullYear();

    if (!Number.isInteger(requestedYear) || requestedYear < 2000 || requestedYear > 3000) {
        return res.status(400).json({ success: false, message: 'Năm không hợp lệ' });
    }

    try {
        const [rows] = await db.query(`
            SELECT
                MONTH(created_at) AS month,
                COUNT(*) AS total_orders,
                COALESCE(SUM(total_amount), 0) AS revenue
            FROM orders
            WHERE YEAR(created_at) = ? AND status <> 'Refused'
            GROUP BY MONTH(created_at)
            ORDER BY MONTH(created_at)
        `, [requestedYear]);

        const revenueByMonthMap = new Map(
            rows.map((row) => [
                Number(row.month),
                {
                    revenue: Number(row.revenue || 0),
                    total_orders: Number(row.total_orders || 0),
                },
            ])
        );

        const data = Array.from({ length: 12 }, (_, index) => {
            const month = index + 1;
            const currentMonth = revenueByMonthMap.get(month) || { revenue: 0, total_orders: 0 };

            return {
                month,
                label: `T${month}`,
                year: requestedYear,
                revenue: currentMonth.revenue,
                total_orders: currentMonth.total_orders,
            };
        });

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getTopProducts = async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), 10);
    const orderItemsTable = await resolveOrderItemsTable();

    if (!orderItemsTable) {
        return res.json({ success: true, data: [] });
    }

    try {
        const [rows] = await db.query(`
            SELECT
                p.id,
                p.name,
                p.image,
                p.stock,
                COALESCE(SUM(oi.quantity), 0) AS sold_quantity,
                COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
            FROM ?? oi
            INNER JOIN orders o ON o.id = oi.order_id
            INNER JOIN products p ON p.id = oi.product_id
            WHERE o.status <> 'Refused'
            GROUP BY p.id, p.name, p.image, p.stock
            ORDER BY sold_quantity DESC, revenue DESC, p.name ASC
            LIMIT ?
        `, [orderItemsTable, limit]);

        res.json({
            success: true,
            data: rows.map((row) => ({
                ...row,
                stock: Number(row.stock || 0),
                sold_quantity: Number(row.sold_quantity || 0),
                revenue: Number(row.revenue || 0),
            })),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getSummary,
    getRevenueByMonth,
    getTopProducts,
};
