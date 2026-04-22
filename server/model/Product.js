const mongoose = require('mongoose');

// 商品表
const productSchema = new mongoose.Schema({
    // 商品名称
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    // 商品图片
    image: {
        type: String,
        default: ''
    },
    // 商品图片列表
    images: [{
        type: String
    }],
    // 商品分类
    category: {
        type: String,
        required: true,
        trim: true
    },
    // 品牌
    brand: {
        type: String,
        required: true,
        trim: true
    },
    // 商品所属商家
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // 创建来源角色
    createdByRole: {
        type: String,
        enum: ['admin', 'merchant', 'system'],
        default: 'system'
    },
    // 售价
    price: {
        type: Number,
        required: true,
        min: 0
    },
    // 原价
    originalPrice: {
        type: Number,
        min: 0,
        default: 0
    },
    // 库存数量
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    // 商品状态
    status: {
        type: String,
        enum: ['上架', '下架', '缺货'],
        default: '上架'
    },
    // 商品标签
    tags: [{
        type: String,
        trim: true
    }],
    // 商品描述
    description: {
        type: String,
        default: ''
    },
    // 重量
    weight: {
        type: String,
        default: ''
    },
    // 保质期
    shelf_life: {
        type: String,
        default: ''
    },
    // 产地
    origin: {
        type: String,
        default: ''
    },
    // 评分
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    // 销量
    sales: {
        type: Number,
        min: 0,
        default: 0
    },
    // 口味
    flavor: {
        type: String,
        default: ''
    },
    // 营养信息
    nutrition: {
        calories: {
            type: Number,
            min: 0,
            default: 0
        },
        protein: {
            type: Number,
            min: 0,
            default: 0
        },
        fat: {
            type: Number,
            min: 0,
            default: 0
        },
        carbohydrate: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    // 商品编码
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    // 最低库存预警
    minStock: {
        type: Number,
        min: 0,
        default: 10
    },
    // 是否推荐
    isRecommended: {
        type: Boolean,
        default: false
    },
    // 排序字段
    sort: {
        type: Number,
        default: 0
    },
    // 创建时间
    createTime: {
        type: Date,
        default: Date.now
    },
    // 上传时间
    uploadTime: {
        type: Date,
        default: Date.now
    },
    // 更新时间
    updateTime: {
        type: Date,
        default: Date.now
    },
    // 最后修改人
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // 最后修改时间
    lastModifiedTime: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'products'
});

// 更新时间中间件
productSchema.pre('save', function(next) {
    this.updateTime = new Date();
    this.lastModifiedTime = new Date();
    next();
});

// 生成SKU编码
productSchema.pre('save', function(next) {
    if (!this.sku && this.isNew) {
        this.sku = 'PRD' + Date.now() + Math.floor(Math.random() * 1000);
    }
    next();
});

module.exports = mongoose.model('Product', productSchema); 