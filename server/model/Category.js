const mongoose = require('mongoose');

// 商品分类表
const categorySchema = new mongoose.Schema({
    // 分类名称
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
        unique: true
    },
    // 分类描述
    description: {
        type: String,
        default: ''
    },
    // 分类图标
    icon: {
        type: String,
        default: ''
    },
    // 分类图片
    image: {
        type: String,
        default: ''
    },
    // 父分类ID
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    // 分类级别
    level: {
        type: Number,
        default: 1,
        min: 1,
        max: 3
    },
    // 分类状态
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
    // 是否显示在首页
    showOnHome: {
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
    collection: 'categories'
});

// 更新时间中间件
categorySchema.pre('save', function(next) {
    this.updateTime = new Date();
    next();
});

module.exports = mongoose.model('Category', categorySchema); 