const mongoose = require('mongoose');

const shopUserSchema = new mongoose.Schema({
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
    plainPassword: {
        type: String,
        default: undefined,
        select: false
    },
    avatar: {
        type: String,
        default: 'http://127.0.0.1:8088/default-avatar.jpg'
    },
    tel: {
        type: String,
        validate: {
            validator: function (value) {
                return !value || /^1[3-9]\d{9}$/.test(value);
            },
            message: '手机号格式不正确'
        }
    },
    email: {
        type: String,
        validate: {
            validator: function (value) {
                return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: '邮箱格式不正确'
        }
    },
    role: {
        type: String,
        enum: ['user', 'merchant'],
        default: 'user'
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
    timestamps: true,
    collection: 'supermarks_users'
});

module.exports = mongoose.model('ShopUser', shopUserSchema);
