const ShopUser = require('../model/shopUser');
const MD5 = require('md5');
const { signAuthToken } = require('../utils/authToken');

function publicUser(user) {
    const data = user.toObject ? user.toObject() : { ...user };
    delete data.password;
    delete data.plainPassword;
    data.authScope = 'shop';
    data.isAdmin = false;
    return data;
}

exports.register = async (req, res) => {
    try {
        const { username, password, tel, email, role } = req.body;
        const safeRole = role === 'merchant' ? 'merchant' : 'user';
        const normalizedUsername = username.trim();

        const existingUser = await ShopUser.findOne({ username: normalizedUsername });
        if (existingUser) {
            return res.json({
                code: 1,
                message: '用户名已存在，请选择其他用户名'
            });
        }

        if (tel && await ShopUser.findOne({ tel })) {
            return res.json({
                code: 1,
                message: '手机号已被注册'
            });
        }

        if (email && await ShopUser.findOne({ email })) {
            return res.json({
                code: 1,
                message: '邮箱已被注册'
            });
        }

        const newUser = await ShopUser.create({
            username: normalizedUsername,
            password: MD5(password),
            plainPassword: process.env.NODE_ENV !== 'production' ? password : undefined,
            tel: tel || undefined,
            email: email || undefined,
            role: safeRole
        });

        return res.json({
            code: 0,
            message: '注册成功',
            data: {
                userInfo: publicUser(newUser)
            }
        });
    } catch (error) {
        console.error('前台注册错误:', error);

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const message = field === 'tel' ? '手机号已被注册' : field === 'email' ? '邮箱已被注册' : '用户名已存在';
            return res.json({ code: 1, message });
        }

        if (error.name === 'ValidationError') {
            return res.json({
                code: 1,
                message: Object.values(error.errors).map((err) => err.message).join(', ')
            });
        }

        return res.json({
            code: 1,
            message: '注册失败，请稍后重试'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await ShopUser.findOne({
            username,
            password: MD5(password),
            status: '启用'
        });

        if (!user) {
            const existingUser = await ShopUser.findOne({ username });
            if (!existingUser) return res.json({ code: 1, message: '用户不存在' });
            if (existingUser.status !== '启用') return res.json({ code: 1, message: '账户已被禁用，请联系管理员' });
            return res.json({ code: 1, message: '密码不正确' });
        }

        await ShopUser.findByIdAndUpdate(user._id, { lastLoginTime: new Date() });
        const userInfo = publicUser(user);
        const token = signAuthToken({ ...userInfo, authScope: 'shop' });

        return res.json({
            code: 0,
            message: '登录成功',
            data: {
                userInfo,
                token
            }
        });
    } catch (error) {
        console.error('前台登录错误:', error);
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
        data: publicUser(req.userInfo)
    });
};
