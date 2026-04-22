const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/orderCtrl');
const auth = require('../middleware/auth');

// 获取订单列表
router.get('/list', auth, orderCtrl.getOrders);

// 获取订单详情
router.get('/detail/:id', auth, orderCtrl.getOrderDetail);

// 创建订单
router.post('/create', auth, orderCtrl.createOrder);

// 模拟支付
router.post('/pay/mock', auth, orderCtrl.mockPay);

// Stripe 测试支付
router.post('/pay/stripe-intent', auth, orderCtrl.createStripePaymentIntent);
router.post('/pay/stripe-confirm', auth, orderCtrl.confirmStripePayment);

// 申请退款
router.post('/refund/apply', auth, orderCtrl.applyRefund);

// 退款列表
router.get('/refund/list', auth, orderCtrl.getRefundList);

// 退款审核
router.patch('/refund/review/:id', auth, orderCtrl.reviewRefund);

// 更新物流状态
router.patch('/delivery/:id', auth, orderCtrl.updateDeliveryStatus);

// 更新订单状态
router.patch('/status/:id', auth, orderCtrl.updateOrderStatus);

// 删除订单
router.delete('/:id', auth, orderCtrl.deleteOrder);

// 批量删除订单
router.delete('/batch/delete', auth, orderCtrl.batchDeleteOrders);

// 获取订单统计
router.get('/stats', auth, orderCtrl.getOrderStats);

module.exports = router; 
