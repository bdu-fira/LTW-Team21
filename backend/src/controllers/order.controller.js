const db = require('../config/db');
const paymentController = require('./payment.controller');

const createHttpError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const tableExists = async (tableName) => {
    try {
        await db.query('SELECT 1 FROM ?? LIMIT 1', [tableName]);
        return true;
    } catch (error) {
        return false;
    }
};

const resolveCartTable = async () => {
    if (await tableExists('cart')) {
        return 'cart';
    }

    if (await tableExists('cart_items')) {
        return 'cart_items';
    }

    return null;
};

const resolveOrderItemsTable = async () => {
    if (await tableExists('order_items')) {
        return 'order_items';
    }

    return null;
};

const normalizeItems = (items = []) => {
    const groupedItems = new Map();

    for (const item of items) {
        const productId = Number(item?.product_id);
        const quantity = Number(item?.quantity || 0);

        if (!productId || quantity <= 0) {
            continue;
        }

        groupedItems.set(productId, (groupedItems.get(productId) || 0) + quantity);
    }

    return Array.from(groupedItems.entries()).map(([product_id, quantity]) => ({
        product_id,
        quantity,
    }));
};

const buildItemsFromPayload = (payload = {}) => {
    if (Array.isArray(payload.items) && payload.items.length > 0) {
        return normalizeItems(payload.items);
    }

    return normalizeItems([
        {
            product_id: payload.product_id,
            quantity: payload.quantity || 1,
        },
    ]);
};

const lockAndHydrateItems = async (connection, rawItems) => {
    const normalizedItems = normalizeItems(rawItems);

    if (!normalizedItems.length) {
        throw createHttpError(400, 'Sản phẩm không hợp lệ');
    }

    const hydratedItems = [];

    for (const item of normalizedItems) {
        const [rows] = await connection.query(
            'SELECT id, name, price, image, stock FROM products WHERE id = ? FOR UPDATE',
            [item.product_id]
        );

        if (!rows.length) {
            throw createHttpError(404, `Sản phẩm #${item.product_id} không tồn tại`);
        }

        const product = rows[0];
        const stock = Number(product.stock || 0);

        if (item.quantity > stock) {
            throw createHttpError(400, `Sản phẩm ${product.name} chỉ còn ${stock} sản phẩm trong kho`);
        }

        hydratedItems.push({
            product_id: product.id,
            name: product.name,
            image: product.image,
            quantity: item.quantity,
            price: Number(product.price || 0),
        });
    }

    return hydratedItems;
};

const decreaseProductStock = async (connection, items) => {
    for (const item of items) {
        await connection.query(
            'UPDATE products SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.product_id]
        );
    }
};

const restoreProductStock = async (connection, orderId) => {
    const orderItemsTable = await resolveOrderItemsTable();

    if (!orderItemsTable) {
        return;
    }

    const [orderItems] = await connection.query(
        'SELECT product_id, quantity FROM ?? WHERE order_id = ?',
        [orderItemsTable, orderId]
    );

    for (const item of orderItems) {
        await connection.query(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [Number(item.quantity || 0), item.product_id]
        );
    }
};

const createOrderRecord = async ({ userId, items, shippingAddress, paymentMethod = 'COD' }) => {
    const orderItemsTable = await resolveOrderItemsTable();
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const lockedItems = await lockAndHydrateItems(connection, items);
        const totalAmount = lockedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_amount, shipping_address, status, payment_method) VALUES (?, ?, ?, ?, ?)',
            [userId, totalAmount, shippingAddress || '', 'Pending', paymentMethod]
        );

        if (orderItemsTable && lockedItems.length > 0) {
            const values = lockedItems.map((item) => [orderResult.insertId, item.product_id, item.quantity, item.price]);

            await connection.query(
                'INSERT INTO ?? (order_id, product_id, quantity, price) VALUES ?',
                [orderItemsTable, values]
            );
        }

        await decreaseProductStock(connection, lockedItems);
        await connection.commit();

        return {
            id: orderResult.insertId,
            total_amount: totalAmount,
            status: 'Pending',
            payment_method: paymentMethod,
            items: lockedItems,
            qrUrl: paymentMethod === 'Online'
                ? paymentController.generateQrUrl(orderResult.insertId, totalAmount)
                : null,
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const getAllOrders = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT o.*, u.name AS customer_name, u.email AS customer_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);

        res.json({
            success: true,
            data: rows.map((order) => ({
                ...order,
                total_amount: Number(order.total_amount || 0),
            })),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );

        res.json({
            success: true,
            data: rows.map((order) => ({
                ...order,
                total_amount: Number(order.total_amount || 0),
            })),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const [orders] = await db.query(
            'SELECT o.*, u.name AS customer_name, u.email AS customer_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?',
            [req.params.id]
        );

        if (!orders.length) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        const order = orders[0];
        const userRole = req.user?.role_name || req.user?.role;
        const isStaff = userRole === 'Admin' || userRole === 'Employee';

        if (!isStaff && Number(order.user_id) !== Number(req.user.id)) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền xem đơn hàng này' });
        }

        let items = [];
        const orderItemsTable = await resolveOrderItemsTable();

        if (orderItemsTable) {
            const [orderItems] = await db.query(
                'SELECT oi.*, p.name, p.image FROM ?? oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
                [orderItemsTable, req.params.id]
            );

            items = orderItems.map((item) => ({
                ...item,
                price: Number(item.price || 0),
                quantity: Number(item.quantity || 0),
            }));
        }

        res.json({
            success: true,
            data: {
                ...order,
                total_amount: Number(order.total_amount || 0),
                items,
                qrUrl: order.payment_method === 'Online'
                    ? paymentController.generateQrUrl(order.id, Number(order.total_amount || 0))
                    : null,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const checkoutDirect = async (req, res) => {
    try {
        const rawItems = buildItemsFromPayload(req.body);

        if (!rawItems.length) {
            return res.status(400).json({ success: false, message: 'Sản phẩm không hợp lệ' });
        }

        const order = await createOrderRecord({
            userId: req.user.id,
            items: rawItems,
            shippingAddress: req.body.shipping_address,
            paymentMethod: req.body.payment_method || 'COD',
        });

        res.status(201).json({ success: true, message: 'Đặt hàng thành công', data: order });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

const checkoutCart = async (req, res) => {
    try {
        const cartTable = await resolveCartTable();

        if (!cartTable) {
            return res.status(500).json({ success: false, message: 'Giỏ hàng chưa được khởi tạo' });
        }

        const [cartItems] = await db.query(
            'SELECT product_id, quantity FROM ?? WHERE user_id = ?',
            [cartTable, req.user.id]
        );

        if (!cartItems.length) {
            return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
        }

        const order = await createOrderRecord({
            userId: req.user.id,
            items: cartItems,
            shippingAddress: req.body.shipping_address,
            paymentMethod: req.body.payment_method || 'COD',
        });

        await db.query('DELETE FROM ?? WHERE user_id = ?', [cartTable, req.user.id]);

        res.status(201).json({ success: true, message: 'Đặt hàng thành công', data: order });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    if (!status) {
        return res.status(400).json({ success: false, message: 'Thiếu trạng thái đơn hàng' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [orders] = await connection.query(
            'SELECT id, status FROM orders WHERE id = ? FOR UPDATE',
            [orderId]
        );

        if (!orders.length) {
            throw createHttpError(404, 'Không tìm thấy đơn hàng');
        }

        const currentStatus = orders[0].status;

        if (currentStatus === 'Received' && status !== 'Received') {
            throw createHttpError(400, 'Đơn hàng đã hoàn tất và không thể thay đổi trạng thái');
        }

        if (currentStatus === 'Refused' && status !== 'Refused') {
            throw createHttpError(400, 'Đơn hàng đã bị từ chối và không thể kích hoạt lại');
        }

        if (currentStatus === status) {
            await connection.rollback();
            return res.json({ success: true, message: 'Trạng thái đơn hàng đã được cập nhật' });
        }

        if (status === 'Refused' && currentStatus !== 'Refused') {
            await restoreProductStock(connection, orderId);
        }

        await connection.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, orderId]
        );

        await connection.commit();
        res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        await connection.rollback();
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

module.exports = {
    getAllOrders,
    getMyOrders,
    getOrderById,
    checkoutDirect,
    checkoutCart,
    updateOrderStatus,
};
