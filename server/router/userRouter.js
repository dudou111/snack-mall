const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userCtrl');
const auth = require('../middleware/auth');

// 获取用户列表
router.get('/list', auth, userCtrl.getUsers);

// 获取用户详情
router.get('/detail/:id', auth, userCtrl.getUserDetail);

// 创建用户
router.post('/create', auth, userCtrl.createUser);

// 更新用户信息
router.put('/:id', auth, userCtrl.updateUser);

// 重置用户密码
router.patch('/reset-password/:id', auth, userCtrl.resetPassword);

// 更新用户状态
router.patch('/status/:id', auth, userCtrl.updateUserStatus);

// 更新用户身份（VIP/普通用户）
router.patch('/role/:id', auth, userCtrl.updateUserRole);

// 删除用户
router.delete('/:id', auth, userCtrl.deleteUser);

// 批量删除用户
router.delete('/batch/delete', auth, userCtrl.batchDeleteUsers);

// 获取用户统计
router.get('/stats', auth, userCtrl.getUserStats);

module.exports = router; 