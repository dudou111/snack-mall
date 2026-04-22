const mongoose = require('mongoose')

// 订单模型
const orderSchema = new mongoose.Schema({
    // 订单号
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        default: () => 'ORD' + Date.now() + Math.floor(Math.random() * 1000)
    },
    // 客户信息
    customer: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true,
            validate: {
                validator: function(v) {
                    return /^1[3-9]\d{9}$/.test(v);
                },
                message: '手机号格式不正确'
            }
        },
        address: {
            type: String,
            required: true
        }
    },
    // 购买用户
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // 订单涉及商家
    merchantIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // 订单商品
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productName: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    // 订单金额
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    // 配送费
    deliveryFee: {
        type: Number,
        default: 0,
        min: 0
    },
    // 优惠金额
    discountAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    // 实际支付金额
    actualAmount: {
        type: Number,
        required: true,
        min: 0
    },
    // 订单状态
    status: {
        type: String,
        enum: ['待支付', '待发货', '配送中', '已完成', '已取消'],
        default: '待支付'
    },
    // 支付状态
    paymentStatus: {
        type: String,
        enum: ['未支付', '已支付', '已退款'],
        default: '未支付'
    },
    // 配送状态
    deliveryStatus: {
        type: String,
        enum: ['待发货', '配送中', '已送达', '配送失败'],
        default: '待发货'
    },
    // 支付方式
    paymentMethod: {
        type: String,
        enum: ['微信支付', '支付宝', '现金', 'Stripe测试支付'],
        default: '微信支付'
    },
    // 支付通道
    paymentProvider: {
        type: String,
        enum: ['', 'mock', 'stripe_test'],
        default: ''
    },
    // Stripe 测试支付意图 ID
    stripePaymentIntentId: {
        type: String,
        default: ''
    },
    // Stripe 支付意图状态
    stripePaymentStatus: {
        type: String,
        default: ''
    },
    // 模拟支付流水号
    paymentMockNo: {
        type: String,
        default: ''
    },
    // 模拟支付失败原因
    paymentFailReason: {
        type: String,
        default: ''
    },
    // 退款信息
    refund: {
        reviewStatus: {
            type: String,
            enum: ['无', '待处理', '已通过', '已驳回'],
            default: '无'
        },
        applyTime: {
            type: Date
        },
        applyReason: {
            type: String,
            default: ''
        },
        applyAmount: {
            type: Number,
            min: 0,
            default: 0
        },
        reviewBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        reviewTime: {
            type: Date
        },
        rejectReason: {
            type: String,
            default: ''
        },
        refundTime: {
            type: Date
        }
    },
    // 订单备注
    remark: {
        type: String,
        maxlength: 500
    },
    // 创建时间
    orderTime: {
        type: Date,
        default: Date.now
    },
    // 支付时间
    paymentTime: {
        type: Date
    },
    // 发货时间
    shipmentTime: {
        type: Date
    },
    // 完成时间
    completionTime: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'orders'
});

module.exports = mongoose.model('Order', orderSchema);




