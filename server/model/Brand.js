const mongoose = require('mongoose');

// 品牌表
const brandSchema = new mongoose.Schema({
    // 品牌名称
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
        unique: true
    },
    // 品牌描述
    description: {
        type: String,
        default: ''
    },
    // 品牌LOGO
    logo: {
        type: String,
        default: ''
    },
    // 品牌图片
    image: {
        type: String,
        default: ''
    },
    // 品牌官网
    website: {
        type: String,
        default: ''
    },
    // 品牌状态
    status: {
        type: String,
        enum: ['启用', '禁用'],
        default: '启用'
    },
    // 排序字段
    sort: {
        type: Number,
        default: 0
    },
    // 商品数量
    productCount: {
        type: Number,
        default: 0,
        min: 0
    },
    // 是否推荐品牌
    isRecommended: {
        type: Boolean,
        default: false
    },
    // 创建时间
    createTime: {
        type: Date,
        default: Date.now
    },
    // 更新时间
    updateTime: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'brands'
});

// 更新时间中间件
brandSchema.pre('save', function(next) {
    this.updateTime = new Date();
    next();
});

module.exports = mongoose.model('Brand', brandSchema); 