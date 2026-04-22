// 引入mongoose插件
const mongoose = require('mongoose')

// 创建用户表
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 20
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    // 开发专用：明文密码字段（仅开发环境使用）
    plainPassword: {
        type: String,
        default: undefined,
        select: false // 默认查询时不返回此字段
    },
    avatar: {
        type: String,
        default: 'http://127.0.0.1:8088/default-avatar.jpg'
    },
    tel: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^1[3-9]\d{9}$/.test(v);
            },
            message: '手机号格式不正确'
        }
    },
    email: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: '邮箱格式不正确'
        }
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'merchant'],
        default: function () {
            return this.isAdmin ? 'admin' : 'user';
        }
    },
    merchantProfile: {
        shopName: {
            type: String,
            default: ''
        },
        contactName: {
            type: String,
            default: ''
        },
        contactPhone: {
            type: String,
            default: ''
        }
    },
    createTime: {
        type: Date,
        default: Date.now
    },
    lastLoginTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['启用', '禁用', '封禁'],
        default: '启用'
    }
}, {
    timestamps: true, // 自动添加createdAt和updatedAt字段
    collection: 'users' // 明确指定collection名称
});

module.exports = mongoose.model('User', userSchema);


