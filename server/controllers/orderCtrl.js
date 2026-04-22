const Order = require('../model/Order');
const Product = require('../model/Product');
const Stripe = require('stripe');
const { assertStripeSecretKey } = require('../utils/stripeConfig');

const getRole = (userInfo) => {
    if (!userInfo) return 'guest';
    if (userInfo.authScope === 'admin') return 'admin';
    if (userInfo.role) return userInfo.role;
    return userInfo.isAdmin ? 'admin' : 'user';
};

const isAdmin = (userInfo) => getRole(userInfo) === 'admin' || Boolean(userInfo?.isAdmin);
const isMerchant = (userInfo) => getRole(userInfo) === 'merchant';

const canAccessOrder = (order, userInfo) => {
    if (!order || !userInfo) return false;
    if (isAdmin(userInfo)) return true;

    const role = getRole(userInfo);
    const userId = String(userInfo._id);

    if (role === 'merchant') {
        return order.merchantIds?.some((merchantId) => String(merchantId) === userId);
    }

    return order.buyerId && String(order.buyerId) === userId;
};

const createMockPaymentNo = () => `PM${Date.now()}${Math.floor(Math.random() * 1000)}`;

function getStripeClient() {
    return new Stripe(assertStripeSecretKey(process.env.STRIPE_SECRET_KEY));
}

function toStripeAmount(amount) {
    return Math.round(Number(amount) * 100);
}

async function applyStripePaymentResult(order, paymentIntent) {
    const updateData = {
        paymentProvider: 'stripe_test',
        paymentMethod: 'Stripe测试支付',
        stripePaymentIntentId: paymentIntent.id,
        stripePaymentStatus: paymentIntent.status
    };

    if (paymentIntent.status === 'succeeded') {
        updateData.paymentStatus = '已支付';
        updateData.status = order.status === '待支付' ? '待发货' : order.status;
        updateData.paymentTime = order.paymentTime || new Date();
        updateData.paymentMockNo = paymentIntent.id;
        updateData.paymentFailReason = '';
    } else {
        updateData.paymentStatus = '未支付';
        updateData.status = '待支付';
        updateData.paymentFailReason = `Stripe支付状态：${paymentIntent.status}`;
    }

    return Order.findByIdAndUpdate(order._id, updateData, { new: true });
}

const isValidDeliveryTransition = (currentStatus, nextStatus) => {
    const validTransitions = {
        '待发货': ['配送中'],
        '配送中': ['已送达', '配送失败'],
        '配送失败': ['配送中']
    };

    if (currentStatus === nextStatus) return true;
    return validTransitions[currentStatus]?.includes(nextStatus);
};

// 获取订单列表
exports.getOrders = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            paymentStatus, 
            deliveryStatus,
            keyword,
            startDate,
            endDate
        } = req.query;

        // 构建查询条件
        const filter = {};
        
        if (status) filter.status = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if (deliveryStatus) filter.deliveryStatus = deliveryStatus;
        
        // 关键词搜索（订单号或客户姓名）
        if (keyword) {
            filter.$or = [
                { orderNumber: { $regex: keyword, $options: 'i' } },
                { 'customer.name': { $regex: keyword, $options: 'i' } },
                { 'customer.phone': { $regex: keyword, $options: 'i' } }
            ];
        }
        
        // 时间范围查询
        if (startDate || endDate) {
            filter.orderTime = {};
            if (startDate) filter.orderTime.$gte = new Date(startDate);
            if (endDate) filter.orderTime.$lte = new Date(endDate + ' 23:59:59');
        }

        // 角色隔离：管理员看全量，商家看涉及自身商品订单，用户看自己的订单
        const role = getRole(req.userInfo);
        if (role === 'merchant') {
            filter.merchantIds = req.userInfo._id;
        } else if (role === 'user') {
            filter.buyerId = req.userInfo._id;
        }

        const skip = (page - 1) * limit;
        
        const orders = await Order.find(filter)
            .populate('items.productId', 'name image')
            .sort({ orderTime: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(filter);

        res.json({
            code: 0,
            message: '获取订单列表成功',
            data: {
                orders,
                pagination: {
                    current: parseInt(page),
                    pageSize: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('获取订单列表错误:', error);
        res.json({
            code: 1,
            message: '获取订单列表失败',
            error: error.message
        });
    }
};

// 获取订单详情
exports.getOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const order = await Order.findById(id)
            .populate('items.productId', 'name image category brand');
        
        if (!order) {
            return res.json({
                code: 1,
                message: '订单不存在'
            });
        }

        if (!canAccessOrder(order, req.userInfo)) {
            return res.json({
                code: 1,
                message: '无权访问该订单'
            });
        }

        res.json({
            code: 0,
            message: '获取订单详情成功',
            data: order
        });
    } catch (error) {
        console.error('获取订单详情错误:', error);
        res.json({
            code: 1,
            message: '获取订单详情失败',
            error: error.message
        });
    }
};

// 创建订单
exports.createOrder = async (req, res) => {
    try {
        const { customer, items, deliveryFee = 0, discountAmount = 0, paymentMethod, remark } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.json({
                code: 1,
                message: '订单商品不能为空'
            });
        }

        // 验证商品并计算金额
        let totalAmount = 0;
        const orderItems = [];
        const merchantSet = new Set();

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.json({
                    code: 1,
                    message: `商品不存在: ${item.productId}`
                });
            }

            if (product.stock < item.quantity) {
                return res.json({
                    code: 1,
                    message: `商品库存不足: ${product.name}`
                });
            }

            const subtotal = product.price * item.quantity;
            totalAmount += subtotal;

            orderItems.push({
                productId: item.productId,
                productName: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal
            });

            if (product.merchantId) {
                merchantSet.add(String(product.merchantId));
            }
        }

        const actualAmount = totalAmount + deliveryFee - discountAmount;

        const order = new Order({
            customer,
            buyerId: req.userInfo?._id || null,
            merchantIds: Array.from(merchantSet),
            items: orderItems,
            totalAmount,
            deliveryFee,
            discountAmount,
            actualAmount,
            paymentMethod,
            remark
        });

        await order.save();

        // 更新商品库存
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -item.quantity, sales: item.quantity } }
            );
        }

        res.json({
            code: 0,
            message: '创建订单成功',
            data: order
        });
    } catch (error) {
        console.error('创建订单错误:', error);
        res.json({
            code: 1,
            message: '创建订单失败',
            error: error.message
        });
    }
};

// 更新订单状态
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentStatus, deliveryStatus } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.json({
                code: 1,
                message: '订单不存在'
            });
        }

        if (!canAccessOrder(order, req.userInfo)) {
            return res.json({
                code: 1,
                message: '无权更新该订单'
            });
        }

        if (isMerchant(req.userInfo) && (status || paymentStatus)) {
            return res.json({
                code: 1,
                message: '商家仅可更新物流状态'
            });
        }

        if (deliveryStatus && order.paymentStatus !== '已支付') {
            return res.json({
                code: 1,
                message: '未支付订单不能更新物流状态'
            });
        }

        if (deliveryStatus && !isValidDeliveryTransition(order.deliveryStatus, deliveryStatus)) {
            return res.json({
                code: 1,
                message: `物流状态不允许从${order.deliveryStatus}变更为${deliveryStatus}`
            });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (deliveryStatus) updateData.deliveryStatus = deliveryStatus;

        // 根据状态更新时间戳
        if (paymentStatus === '已支付' && !updateData.paymentTime) {
            updateData.paymentTime = new Date();
        }
        if (deliveryStatus === '配送中' && !updateData.shipmentTime) {
            updateData.shipmentTime = new Date();
        }
        if (status === '已完成' && !updateData.completionTime) {
            updateData.completionTime = new Date();
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.json({
            code: 0,
            message: '更新订单状态成功',
            data: updatedOrder
        });
    } catch (error) {
        console.error('更新订单状态错误:', error);
        res.json({
            code: 1,
            message: '更新订单状态失败',
            error: error.message
        });
    }
};

// 删除订单
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);
        if (!order) {
            return res.json({
                code: 1,
                message: '订单不存在'
            });
        }

        // 只允许删除已取消的订单
        if (order.status !== '已取消') {
            return res.json({
                code: 1,
                message: '只能删除已取消的订单'
            });
        }

        await Order.findByIdAndDelete(id);

        res.json({
            code: 0,
            message: '删除订单成功'
        });
    } catch (error) {
        console.error('删除订单错误:', error);
        res.json({
            code: 1,
            message: '删除订单失败',
            error: error.message
        });
    }
};

// 批量删除订单
exports.batchDeleteOrders = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids)) {
            return res.json({
                code: 1,
                message: 'ids参数错误，应为数组格式'
            });
        }

        // 检查所有订单都是已取消状态
        const orders = await Order.find({ _id: { $in: ids } });
        const nonCancelledOrders = orders.filter(order => order.status !== '已取消');
        
        if (nonCancelledOrders.length > 0) {
            return res.json({
                code: 1,
                message: '只能删除已取消的订单'
            });
        }

        await Order.deleteMany({ _id: { $in: ids } });

        res.json({
            code: 0,
            message: `成功删除${ids.length}个订单`
        });
    } catch (error) {
        console.error('批量删除订单错误:', error);
        res.json({
            code: 1,
            message: '批量删除订单失败',
            error: error.message
        });
    }
};

// 获取订单统计信息
exports.getOrderStats = async (req, res) => {
    try {
        const role = getRole(req.userInfo);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const baseMatch = {};
        if (role === 'merchant') {
            baseMatch.merchantIds = req.userInfo._id;
        } else if (role === 'user') {
            baseMatch.buyerId = req.userInfo._id;
        }

        // 今日订单统计
        const todayStats = await Order.aggregate([
            {
                $match: {
                    ...baseMatch,
                    orderTime: { $gte: today, $lt: tomorrow }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalAmount: { $sum: '$actualAmount' },
                    paidOrders: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', '已支付'] }, 1, 0]
                        }
                    },
                    paidAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', '已支付'] }, '$actualAmount', 0]
                        }
                    }
                }
            }
        ]);

        // 订单状态统计
        const statusStats = await Order.aggregate([
            {
                $match: baseMatch
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            code: 0,
            message: '获取订单统计成功',
            data: {
                today: todayStats[0] || { totalOrders: 0, totalAmount: 0, paidOrders: 0, paidAmount: 0 },
                statusStats
            }
        });
    } catch (error) {
        console.error('获取订单统计错误:', error);
        res.json({
            code: 1,
            message: '获取订单统计失败',
            error: error.message
        });
    }
}; 

// 模拟支付
exports.mockPay = async (req, res) => {
    try {
        const { orderId, paymentMethod, mockResult = 'success', failReason = '' } = req.body;

        if (!orderId) {
            return res.json({
                code: 1,
                message: 'orderId不能为空'
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.json({
                code: 1,
                message: '订单不存在'
            });
        }

        if (!canAccessOrder(order, req.userInfo)) {
            return res.json({
                code: 1,
                message: '无权支付该订单'
            });
        }

        if (order.paymentStatus === '已退款') {
            return res.json({
                code: 1,
                message: '订单已退款，不能再次支付'
            });
        }

        const updateData = {
            paymentMethod: paymentMethod || order.paymentMethod
        };

        if (mockResult === 'success') {
            updateData.paymentStatus = '已支付';
            updateData.status = order.status === '待支付' ? '待发货' : order.status;
            updateData.paymentTime = order.paymentTime || new Date();
            updateData.paymentMockNo = order.paymentMockNo || createMockPaymentNo();
            updateData.paymentFailReason = '';
        } else {
            updateData.paymentStatus = '未支付';
            updateData.status = '待支付';
            updateData.paymentFailReason = failReason || '模拟支付失败';
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

        res.json({
            code: 0,
            message: mockResult === 'success' ? '模拟支付成功' : '模拟支付失败',
            data: updatedOrder
        });
    } catch (error) {
        console.error('模拟支付错误:', error);
        res.json({
            code: 1,
            message: '模拟支付失败',
            error: error.message
        });
    }
};

// Stripe 测试支付：后端使用 Stripe 测试支付方式模拟成功扣款
exports.createStripePaymentIntent = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.json({
                code: 1,
                message: 'orderId不能为空'
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.json({
                code: 1,
                message: '订单不存在'
            });
        }

        if (!canAccessOrder(order, req.userInfo)) {
            return res.json({
                code: 1,
                message: '无权支付该订单'
            });
        }

        if (getRole(req.userInfo) !== 'user') {
            return res.json({
                code: 1,
                message: '仅普通用户可以支付订单'
            });
        }

        if (order.paymentStatus !== '未支付') {
            return res.json({
                code: 1,
                message: '该订单不是未支付状态'
            });
        }

        const stripe = getStripeClient();
        const paymentIntent = await stripe.paymentIntents.create({
            amount: toStripeAmount(order.actualAmount),
            currency: 'cny',
            payment_method: 'pm_card_visa',
            payment_method_types: ['card'],
            confirm: true,
            metadata: {
                orderId: String(order._id),
                orderNumber: order.orderNumber
            }
        });

        const updatedOrder = await applyStripePaymentResult(order, paymentIntent);

        return res.json({
            code: paymentIntent.status === 'succeeded' ? 0 : 1,
            message: paymentIntent.status === 'succeeded' ? 'Stripe测试支付成功' : 'Stripe测试支付未完成',
            data: {
                order: updatedOrder,
                orderId: String(order._id),
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status
            }
        });
    } catch (error) {
        const message = ['STRIPE_NOT_CONFIGURED', 'STRIPE_INVALID_SECRET_KEY'].includes(error.code)
            ? error.message
            : '创建Stripe支付失败';
        console.error('创建Stripe支付错误:', error);
        return res.json({
            code: 1,
            message,
            error: error.message
        });
    }
};

// Stripe 支付确认：用于幂等同步 Stripe 测试支付状态
exports.confirmStripePayment = async (req, res) => {
    try {
        const { orderId, paymentIntentId } = req.body;

        if (!orderId || !paymentIntentId) {
            return res.json({
                code: 1,
                message: 'orderId和paymentIntentId不能为空'
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.json({
                code: 1,
                message: '订单不存在'
            });
        }

        if (!canAccessOrder(order, req.userInfo)) {
            return res.json({
                code: 1,
                message: '无权确认该订单支付'
            });
        }

        if (String(order.stripePaymentIntentId) !== String(paymentIntentId)) {
            return res.json({
                code: 1,
                message: '支付流水与订单不匹配'
            });
        }

        const stripe = getStripeClient();
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        const updatedOrder = await applyStripePaymentResult(order, paymentIntent);

        return res.json({
            code: paymentIntent.status === 'succeeded' ? 0 : 1,
            message: paymentIntent.status === 'succeeded' ? 'Stripe测试支付成功' : 'Stripe测试支付未完成',
            data: updatedOrder
        });
    } catch (error) {
        const message = ['STRIPE_NOT_CONFIGURED', 'STRIPE_INVALID_SECRET_KEY'].includes(error.code)
            ? error.message
            : '确认Stripe支付失败';
        console.error('确认Stripe支付错误:', error);
        return res.json({
            code: 1,
            message,
            error: error.message
        });
    }
};

// 申请退款
exports.applyRefund = async (req, res) => {
    try {
        const { orderId, applyReason = '', applyAmount } = req.body;

        if (!orderId) {
            return res.json({
                code: 1,
                message: 'orderId不能为空'
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.json({
                code: 1,
                message: '订单不存在'
            });
        }

        if (!canAccessOrder(order, req.userInfo)) {
            return res.json({
                code: 1,
                message: '无权申请该订单退款'
            });
        }

        if (order.paymentStatus !== '已支付') {
            return res.json({
                code: 1,
                message: '仅已支付订单可申请退款'
            });
        }

        if (order.deliveryStatus === '已送达') {
            return res.json({
                code: 1,
                message: '已送达订单暂不支持退款'
            });
        }

        if (order.refund?.reviewStatus === '待处理' || order.refund?.reviewStatus === '已通过') {
            return res.json({
                code: 1,
                message: '该订单已存在退款申请'
            });
        }

        const refundAmount = applyAmount ? Number(applyAmount) : order.actualAmount;
        if (Number.isNaN(refundAmount) || refundAmount <= 0 || refundAmount > order.actualAmount) {
            return res.json({
                code: 1,
                message: '退款金额不合法'
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                refund: {
                    reviewStatus: '待处理',
                    applyTime: new Date(),
                    applyReason,
                    applyAmount: refundAmount,
                    reviewBy: null,
                    reviewTime: null,
                    rejectReason: '',
                    refundTime: null
                }
            },
            { new: true }
        );

        res.json({
            code: 0,
            message: '退款申请已提交',
            data: updatedOrder
        });
    } catch (error) {
        console.error('申请退款错误:', error);
        res.json({
            code: 1,
            message: '申请退款失败',
            error: error.message
        });
    }
};

// 获取退款列表
exports.getRefundList = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            pageSize,
            reviewStatus,
            keyword,
            startDate,
            endDate
        } = req.query;
        const resolvedLimit = parseInt(pageSize || limit, 10);
        const resolvedPage = parseInt(page, 10);
        const filter = {
            'refund.reviewStatus': { $in: ['待处理', '已通过', '已驳回'] }
        };

        if (reviewStatus) {
            filter['refund.reviewStatus'] = reviewStatus;
        }

        if (keyword) {
            filter.$or = [
                { orderNumber: { $regex: keyword, $options: 'i' } },
                { 'customer.name': { $regex: keyword, $options: 'i' } },
                { 'customer.phone': { $regex: keyword, $options: 'i' } }
            ];
        }

        if (startDate || endDate) {
            filter['refund.applyTime'] = {};
            if (startDate) filter['refund.applyTime'].$gte = new Date(startDate);
            if (endDate) filter['refund.applyTime'].$lte = new Date(endDate + ' 23:59:59');
        }

        const role = getRole(req.userInfo);
        if (role === 'merchant') {
            filter.merchantIds = req.userInfo._id;
        } else if (role === 'user') {
            filter.buyerId = req.userInfo._id;
        }

        const skip = (resolvedPage - 1) * resolvedLimit;
        const orders = await Order.find(filter)
            .sort({ 'refund.applyTime': -1 })
            .skip(skip)
            .limit(resolvedLimit);

        const total = await Order.countDocuments(filter);

        res.json({
            code: 0,
            message: '获取退款列表成功',
            data: {
                orders,
                pagination: {
                    current: resolvedPage,
                    pageSize: resolvedLimit,
                    total,
                    pages: Math.ceil(total / resolvedLimit)
                }
            }
        });
    } catch (error) {
        console.error('获取退款列表错误:', error);
        res.json({
            code: 1,
            message: '获取退款列表失败',
            error: error.message
        });
    }
};

// 退款审核
exports.reviewRefund = async (req, res) => {
    try {
        if (!isAdmin(req.userInfo)) {
            return res.json({
                code: 1,
                message: '只有管理员可以审核退款'
            });
        }

        const { id } = req.params;
        const { action, rejectReason = '' } = req.body;
        const normalizedRejectReason = String(rejectReason || '').trim();

        if (!['approve', 'reject'].includes(action)) {
            return res.json({
                code: 1,
                message: 'action参数无效'
            });
        }

        if (action === 'reject' && !normalizedRejectReason) {
            return res.json({
                code: 1,
                message: '驳回退款时必须填写驳回原因'
            });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.json({
                code: 1,
                message: '订单不存在'
            });
        }

        if (order.refund?.reviewStatus !== '待处理') {
            return res.json({
                code: 1,
                message: '当前退款申请不可审核'
            });
        }

        const now = new Date();
        const updateData = {
            'refund.reviewBy': req.userInfo._id,
            'refund.reviewTime': now
        };

        if (action === 'approve') {
            updateData['refund.reviewStatus'] = '已通过';
            updateData['refund.refundTime'] = now;
            updateData['refund.rejectReason'] = '';
            updateData.paymentStatus = '已退款';
            updateData.status = '已取消';

            // 未发货订单退款后回补库存
            if (order.deliveryStatus === '待发货') {
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(item.productId, {
                        $inc: { stock: item.quantity, sales: -item.quantity }
                    });
                }
            }
        } else {
            updateData['refund.reviewStatus'] = '已驳回';
            updateData['refund.rejectReason'] = normalizedRejectReason;
            updateData['refund.refundTime'] = null;
        }

        const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });

        res.json({
            code: 0,
            message: action === 'approve' ? '退款已通过' : '退款已驳回',
            data: updatedOrder
        });
    } catch (error) {
        console.error('退款审核错误:', error);
        res.json({
            code: 1,
            message: '退款审核失败',
            error: error.message
        });
    }
};

// 更新物流状态
exports.updateDeliveryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { deliveryStatus } = req.body;

        if (!deliveryStatus) {
            return res.json({
                code: 1,
                message: 'deliveryStatus不能为空'
            });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.json({
                code: 1,
                message: '订单不存在'
            });
        }

        if (!canAccessOrder(order, req.userInfo)) {
            return res.json({
                code: 1,
                message: '无权更新该订单物流'
            });
        }

        const role = getRole(req.userInfo);
        if (!isAdmin(req.userInfo) && role !== 'merchant') {
            return res.json({
                code: 1,
                message: '仅管理员或商家可更新物流状态'
            });
        }

        if (order.paymentStatus !== '已支付') {
            return res.json({
                code: 1,
                message: '未支付订单不能发货'
            });
        }

        if (!isValidDeliveryTransition(order.deliveryStatus, deliveryStatus)) {
            return res.json({
                code: 1,
                message: `物流状态不允许从${order.deliveryStatus}变更为${deliveryStatus}`
            });
        }

        const updateData = { deliveryStatus };
        if (deliveryStatus === '配送中') {
            updateData.shipmentTime = order.shipmentTime || new Date();
            updateData.status = '配送中';
        }
        if (deliveryStatus === '已送达') {
            updateData.completionTime = new Date();
            updateData.status = '已完成';
        }
        if (deliveryStatus === '配送失败') {
            updateData.status = '待发货';
        }

        const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });

        res.json({
            code: 0,
            message: '物流状态更新成功',
            data: updatedOrder
        });
    } catch (error) {
        console.error('更新物流状态错误:', error);
        res.json({
            code: 1,
            message: '更新物流状态失败',
            error: error.message
        });
    }
};

exports.__testables = {
    getRole,
    isAdmin,
    isMerchant,
    canAccessOrder
};
