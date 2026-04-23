const Order = require('../model/Order');
const Product = require('../model/Product');
const ShopUser = require('../model/shopUser');

function startOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

function formatDateKey(date) {
    return date.toISOString().slice(0, 10);
}

function buildLastSevenDays() {
    const today = startOfToday();
    return Array.from({ length: 7 }, (_, index) => addDays(today, index - 6));
}

async function getDashboardOverview(req, res) {
    try {
        const today = startOfToday();
        const tomorrow = addDays(today, 1);
        const days = buildLastSevenDays();
        const trendStart = days[0];

        const [
            todayOrders,
            pendingShipment,
            totalProducts,
            uploadedToday,
            totalUsers,
            orderTrend,
            categoryStats,
            popularProducts,
            recentOrders,
            recentUploads
        ] = await Promise.all([
            Order.aggregate([
                { $match: { orderTime: { $gte: today, $lt: tomorrow } } },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalAmount: { $sum: '$actualAmount' }
                    }
                }
            ]),
            Order.countDocuments({ deliveryStatus: '待发货' }),
            Product.countDocuments(),
            Product.countDocuments({ uploadTime: { $gte: today, $lt: tomorrow } }),
            ShopUser.countDocuments({ role: 'user' }),
            Order.aggregate([
                { $match: { orderTime: { $gte: trendStart } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderTime' } },
                        orders: { $sum: 1 },
                        amount: { $sum: '$actualAmount' }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Product.aggregate([
                { $group: { _id: '$category', products: { $sum: 1 } } },
                { $sort: { products: -1 } },
                { $limit: 8 }
            ]),
            Product.find()
                .sort({ sales: -1, uploadTime: -1 })
                .limit(4)
                .select('name image price rating sales brand category stock status uploadTime'),
            Order.find()
                .sort({ orderTime: -1 })
                .limit(6)
                .select('orderNumber customer items actualAmount orderTime status deliveryStatus paymentStatus'),
            Product.find()
                .sort({ uploadTime: -1 })
                .limit(6)
                .select('name brand category price stock status uploadTime image merchantId')
        ]);

        const trendMap = new Map(orderTrend.map((item) => [item._id, item]));
        const dailyTrends = days.map((date) => {
            const key = formatDateKey(date);
            const row = trendMap.get(key) || {};
            return {
                date: key,
                label: `${date.getMonth() + 1}/${date.getDate()}`,
                orders: row.orders || 0,
                amount: row.amount || 0
            };
        });

        const todaySummary = todayOrders[0] || { totalOrders: 0, totalAmount: 0 };

        res.json({
            code: 0,
            message: '获取首页数据成功',
            data: {
                summary: {
                    todayOrders: todaySummary.totalOrders || 0,
                    todaySales: todaySummary.totalAmount || 0,
                    totalProducts,
                    uploadedToday,
                    pendingShipment,
                    totalUsers
                },
                dailyTrends,
                categories: categoryStats.map((item) => ({
                    name: item._id || '未分类',
                    products: item.products
                })),
                popularProducts,
                recentOrders,
                recentUploads
            }
        });
    } catch (error) {
        console.error('获取首页数据失败:', error);
        res.json({
            code: 1,
            message: '获取首页数据失败',
            error: error.message
        });
    }
}

module.exports = {
    getDashboardOverview,
    __testables: {
        buildLastSevenDays,
        formatDateKey
    }
};
