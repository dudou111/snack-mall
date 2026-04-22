const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
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
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin'
    },
    isAdmin: {
        type: Boolean,
        default: true
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
    collection: 'admin_users'
});

module.exports = mongoose.model('AdminUser', adminUserSchema);
