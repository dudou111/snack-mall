const AdminUser = require('../model/adminUser');
const MD5 = require('md5');
const { signAuthToken } = require('../utils/authToken');

function publicAdmin(user) {
    const data = user.toObject ? user.toObject() : { ...user };
    delete data.password;
    delete data.plainPassword;
    data.role = 'admin';
    data.isAdmin = true;
    data.authScope = 'admin';
    return data;
}

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await AdminUser.findOne({
            username,
            password: MD5(password),
            status: '启用'
        });

        if (!admin) {
            const existingAdmin = await AdminUser.findOne({ username });
            if (!existingAdmin) return res.json({ code: 1, message: '管理员不存在' });
            if (existingAdmin.status !== '启用') return res.json({ code: 1, message: '管理员账号已被禁用' });
            return res.json({ code: 1, message: '密码不正确' });
        }

        await AdminUser.findByIdAndUpdate(admin._id, { lastLoginTime: new Date() });
        const userInfo = publicAdmin(admin);
        const token = signAuthToken({ ...userInfo, authScope: 'admin' });

        return res.json({
            code: 0,
            message: '登录成功',
            data: {
                userInfo,
                token
            }
        });
    } catch (error) {
        console.error('后台登录错误:', error);
        return res.json({
            code: 1,
            message: '登录失败，请稍后重试'
        });
    }
};

exports.checkLogin = async (req, res) => {
    return res.json({
        code: 0,
        message: '验证成功',
        data: publicAdmin(req.userInfo)
    });
};
