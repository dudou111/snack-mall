const User = require('../model/user');
const MD5 = require('md5');

const resolveRoleFromPayload = (payload = {}) => {
    if (payload.role && ['admin', 'user', 'merchant'].includes(payload.role)) {
        return payload.role;
    }

    if (typeof payload.isAdmin === 'boolean') {
        return payload.isAdmin ? 'admin' : 'user';
    }

    return undefined;
};

// 获取用户列表
exports.getUsers = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            isAdmin,
            role,
            keyword 
        } = req.query;

        // 构建查询条件
        const filter = {};
        const andConditions = [];
        
        if (status) filter.status = status;
        if (isAdmin !== undefined) filter.isAdmin = isAdmin === 'true';
        if (role) {
            andConditions.push({
                $or: [
                { role },
                ...(role === 'admin' ? [{ isAdmin: true, role: { $exists: false } }] : [])
                ]
            });
        }
        
        // 关键词搜索（用户名、邮箱、手机号）
        if (keyword) {
            andConditions.push({
                $or: [
                    { username: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                    { tel: { $regex: keyword, $options: 'i' } }
                ]
            });
        }

        if (andConditions.length > 0) {
            filter.$and = andConditions;
        }

        const skip = (page - 1) * limit;
        
        const users = await User.find(filter)
            .select('-password') // 不返回密码字段
            .sort({ createTime: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(filter);

        res.json({
            code: 0,
            message: '获取用户列表成功',
            data: {
                users,
                pagination: {
                    current: parseInt(page),
                    pageSize: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('获取用户列表错误:', error);
        res.json({
            code: 1,
            message: '获取用户列表失败',
            error: error.message
        });
    }
};

// 获取用户详情
exports.getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id)
            .select('-password'); // 不返回密码字段
        
        if (!user) {
            return res.json({
                code: 1,
                message: '用户不存在'
            });
        }

        res.json({
            code: 0,
            message: '获取用户详情成功',
            data: user
        });
    } catch (error) {
        console.error('获取用户详情错误:', error);
        res.json({
            code: 1,
            message: '获取用户详情失败',
            error: error.message
        });
    }
};

// 创建用户
exports.createUser = async (req, res) => {
    try {
        const { username, password, email, tel, isAdmin = false, merchantProfile } = req.body;
        const role = resolveRoleFromPayload(req.body) || 'user';

        // 检查用户名是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.json({
                code: 1,
                message: '用户名已存在'
            });
        }

        // 检查邮箱是否已存在
        if (email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.json({
                    code: 1,
                    message: '邮箱已被使用'
                });
            }
        }

        // 检查手机号是否已存在
        if (tel) {
            const existingTel = await User.findOne({ tel });
            if (existingTel) {
                return res.json({
                    code: 1,
                    message: '手机号已被使用'
                });
            }
        }

        const user = new User({
            username,
            password: MD5(password),
            plainPassword: process.env.NODE_ENV !== 'production' ? password : undefined,
            email,
            tel,
            isAdmin: role === 'admin' || Boolean(isAdmin),
            role,
            merchantProfile: merchantProfile || undefined
        });

        await user.save();

        // 返回用户信息（不包含密码）
        const userInfo = await User.findById(user._id).select('-password');

        res.json({
            code: 0,
            message: '创建用户成功',
            data: userInfo
        });
    } catch (error) {
        console.error('创建用户错误:', error);
        res.json({
            code: 1,
            message: '创建用户失败',
            error: error.message
        });
    }
};

// 更新用户信息
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, tel, isAdmin, status, merchantProfile } = req.body;

        // 检查用户是否存在
        const user = await User.findById(id);
        if (!user) {
            return res.json({
                code: 1,
                message: '用户不存在'
            });
        }

        // 如果更新用户名，检查是否已存在
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.json({
                    code: 1,
                    message: '用户名已存在'
                });
            }
        }

        // 如果更新邮箱，检查是否已存在
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.json({
                    code: 1,
                    message: '邮箱已被使用'
                });
            }
        }

        // 如果更新手机号，检查是否已存在
        if (tel && tel !== user.tel) {
            const existingTel = await User.findOne({ tel });
            if (existingTel) {
                return res.json({
                    code: 1,
                    message: '手机号已被使用'
                });
            }
        }

        const updateData = {};
        if (username) updateData.username = username;
        if (email !== undefined) updateData.email = email;
        if (tel !== undefined) updateData.tel = tel;
        const nextRole = resolveRoleFromPayload(req.body);
        if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
        if (nextRole) {
            updateData.role = nextRole;
            updateData.isAdmin = nextRole === 'admin';
        }
        if (merchantProfile !== undefined) updateData.merchantProfile = merchantProfile;
        if (status) updateData.status = status;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('-password');

        res.json({
            code: 0,
            message: '更新用户信息成功',
            data: updatedUser
        });
    } catch (error) {
        console.error('更新用户信息错误:', error);
        res.json({
            code: 1,
            message: '更新用户信息失败',
            error: error.message
        });
    }
};

// 重置用户密码
exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.json({
                code: 1,
                message: '新密码长度不能少于6位'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.json({
                code: 1,
                message: '用户不存在'
            });
        }

        await User.findByIdAndUpdate(id, {
            password: MD5(newPassword),
            plainPassword: process.env.NODE_ENV !== 'production' ? newPassword : undefined
        });

        res.json({
            code: 0,
            message: '重置密码成功'
        });
    } catch (error) {
        console.error('重置密码错误:', error);
        res.json({
            code: 1,
            message: '重置密码失败',
            error: error.message
        });
    }
};

// 删除用户
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.json({
                code: 1,
                message: '用户不存在'
            });
        }

        // 不允许删除管理员账户
        if (user.isAdmin) {
            return res.json({
                code: 1,
                message: '不能删除管理员账户'
            });
        }

        await User.findByIdAndDelete(id);

        res.json({
            code: 0,
            message: '删除用户成功'
        });
    } catch (error) {
        console.error('删除用户错误:', error);
        res.json({
            code: 1,
            message: '删除用户失败',
            error: error.message
        });
    }
};

// 批量删除用户
exports.batchDeleteUsers = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids)) {
            return res.json({
                code: 1,
                message: 'ids参数错误，应为数组格式'
            });
        }

        // 检查是否包含管理员账户
        const users = await User.find({ _id: { $in: ids } });
        const adminUsers = users.filter(user => user.isAdmin);
        
        if (adminUsers.length > 0) {
            return res.json({
                code: 1,
                message: '不能删除管理员账户'
            });
        }

        await User.deleteMany({ _id: { $in: ids } });

        res.json({
            code: 0,
            message: `成功删除${ids.length}个用户`
        });
    } catch (error) {
        console.error('批量删除用户错误:', error);
        res.json({
            code: 1,
            message: '批量删除用户失败',
            error: error.message
        });
    }
};

// 更新用户状态
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.json({
                code: 1,
                message: '用户不存在'
            });
        }

        // 不允许禁用管理员账户
        if (user.isAdmin && status === '封禁') {
            return res.json({
                code: 1,
                message: '不能禁用管理员账户'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).select('-password');

        res.json({
            code: 0,
            message: '更新用户状态成功',
            data: updatedUser
        });
    } catch (error) {
        console.error('更新用户状态错误:', error);
        res.json({
            code: 1,
            message: '更新用户状态失败',
            error: error.message
        });
    }
};

// 更新用户身份（VIP/普通用户）
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { isAdmin, role } = req.body;
        const targetRole = role && ['admin', 'user', 'merchant'].includes(role)
            ? role
            : (Boolean(isAdmin) ? 'admin' : 'user');

        const user = await User.findById(id);
        if (!user) {
            return res.json({
                code: 1,
                message: '用户不存在'
            });
        }

        // 检查权限：只有管理员可以设置其他管理员
        if (targetRole === 'admin' && !req.userInfo.isAdmin) {
            return res.json({
                code: 1,
                message: '只有管理员可以设置VIP会员'
            });
        }

        // 如果要取消管理员权限，确保不是最后一个管理员
        if (targetRole !== 'admin' && user.isAdmin) {
            const adminCount = await User.countDocuments({ isAdmin: true });
            if (adminCount <= 1) {
                return res.json({
                    code: 1,
                    message: '不能取消最后一个管理员的权限'
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                isAdmin: targetRole === 'admin',
                role: targetRole
            },
            { new: true }
        ).select('-password');

        const roleText = targetRole === 'admin' ? '管理员' : (targetRole === 'merchant' ? '商家' : '普通用户');
        res.json({
            code: 0,
            message: `用户身份已更新为${roleText}`,
            data: updatedUser
        });
    } catch (error) {
        console.error('更新用户身份错误:', error);
        res.json({
            code: 1,
            message: '更新用户身份失败',
            error: error.message
        });
    }
};

// 获取用户统计信息
exports.getUserStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 总用户数
        const totalUsers = await User.countDocuments();
        
        // 今日新增用户
        const todayNewUsers = await User.countDocuments({
            createTime: { $gte: today, $lt: tomorrow }
        });

        // 用户状态统计
        const statusStats = await User.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // 管理员数量
        const adminCount = await User.countDocuments({ isAdmin: true });
        const merchantCount = await User.countDocuments({ role: 'merchant' });

        res.json({
            code: 0,
            message: '获取用户统计成功',
            data: {
                totalUsers,
                todayNewUsers,
                adminCount,
                merchantCount,
                statusStats
            }
        });
    } catch (error) {
        console.error('获取用户统计错误:', error);
        res.json({
            code: 1,
            message: '获取用户统计失败',
            error: error.message
        });
    }
}; 