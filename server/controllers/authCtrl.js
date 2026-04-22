const JWT = require("jsonwebtoken");
const User = require("../model/user");
const MD5 = require("md5");

const config = 'QW';

// 注册
exports.register = async (req, res) => {
    try {
        const { username, password, tel, email, role } = req.body;
        const safeRole = role === 'merchant' ? 'merchant' : 'user';

        // 检查用户名是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.json({
                code: 1,
                message: "用户名已存在，请选择其他用户名"
            });
        }

        // 检查手机号是否已存在（如果提供了手机号）
        if (tel) {
            const existingTel = await User.findOne({ tel });
            if (existingTel) {
                return res.json({
                    code: 1,
                    message: "手机号已被注册"
                });
            }
        }

        // 检查邮箱是否已存在（如果提供了邮箱）
        if (email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.json({
                    code: 1,
                    message: "邮箱已被注册"
                });
            }
        }

        // 密码强度验证
        if (password.length < 6) {
            return res.json({
                code: 1,
                message: "密码长度至少6位"
            });
        }

        // 创建新用户
        const newUser = await User.create({
            username: username.trim(),
            password: MD5(password),
            // 开发环境下保存明文密码（仅用于调试）
            plainPassword: process.env.NODE_ENV !== 'production' ? password : undefined,
            tel: tel || undefined,
            email: email || undefined,
            role: safeRole,
            isAdmin: false,
            createTime: new Date()
        });

        // 返回成功消息（不返回密码）
        const userInfo = await User.findById(newUser._id, { password: 0 });

        res.json({
            code: 0,
            data: {
                userInfo
            },
            message: "注册成功"
        });

    } catch (error) {
        console.error('注册错误:', error);
        
        // 处理MongoDB唯一性约束错误
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            let message = "注册失败";
            if (field === 'username') {
                message = "用户名已存在";
            } else if (field === 'tel') {
                message = "手机号已被注册";
            } else if (field === 'email') {
                message = "邮箱已被注册";
            }
            return res.json({
                code: 1,
                message
            });
        }

        // 处理验证错误
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.json({
                code: 1,
                message: messages.join(', ')
            });
        }

        res.json({
            code: 1,
            message: "注册失败，请稍后重试"
        });
    }
};

// 登录
exports.login = async (req, res) => {
    try {
        //获取参数
        const { username, password } = req.body;
        
        //查询是否存在这个用户
        const user = await User.findOne({ 
            username, 
            password: MD5(password),
            status: '启用' // 只允许启用状态的用户登录
        }, { password: 0 });

        if (user != null) {
            // 更新最后登录时间
            await User.findByIdAndUpdate(user._id, { 
                lastLoginTime: new Date() 
            });

            //存在，可以登录，加密生成token
            const jsonuser = JSON.parse(JSON.stringify(user));
            const token = JWT.sign(jsonuser, config, { expiresIn: "7d" });

            res.json({
                code: 0,
                data: {
                    userInfo: user,
                    token
                },
                message: "登录成功",
            });

        } else {
            // 检查是否是用户不存在还是密码错误
            const userExists = await User.findOne({ username });
            if (!userExists) {
                res.json({ 
                    code: 1,
                    message: "用户不存在" 
                });
            } else if (userExists.status !== '启用') {
                res.json({ 
                    code: 1,
                    message: "账户已被禁用，请联系管理员" 
                });
            } else {
                res.json({ 
                    code: 1,
                    message: "密码不正确" 
                });
            }
        }
    } catch (error) {
        console.error('登录错误:', error);
        res.json({
            code: 1,
            message: "登录失败，请稍后重试"
        });
    }
};

// 验证登录
exports.checkLogin = async (req, res) => {
    try {
        // 检查用户状态
        if (req.userInfo.status !== '启用') {
            return res.json({
                code: 1,
                message: '账户已被禁用'
            });
        }

        res.json({
            code: 0,
            message: '验证成功',
            data: req.userInfo
        });
    } catch (error) {
        console.error('验证登录错误:', error);
        res.json({
            code: 1,
            message: '验证失败'
        });
    }
};

// 修改个人信息
exports.changedata = async (req, res) => {
    try {
        // ?timestamp=${Date.now()}拼接时间戳解决因为文件名一样每次请求浏览器缓存问题
        let avatarurl = req.file?.filename ? 'http://localhost:8088/' + req.file.filename + `?timestamp=${Date.now()}` : req.userInfo.avatar;

        let id = req.userInfo._id;

        // 第一个参数表示根据id修改内容，第二个参数表示修改的内容
        await User.findByIdAndUpdate({ _id: id }, { avatar: avatarurl });
        const changedata = await User.findById(id, { password: 0 });

        console.log('changedata', changedata);

        res.json({
            code: 0,
            message: "修改成功",
            changedata
        });
    } catch (error) {
        console.error('修改个人信息错误:', error);
        res.json({
            code: 1,
            message: "修改失败，请稍后重试"
        });
    }
};

// 获取用户统计信息
exports.getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: '启用' });
        
        // 获取今日注册用户数
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayRegistered = await User.countDocuments({
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        });

        res.json({
            code: 0,
            message: '获取统计信息成功',
            data: {
                totalUsers,
                activeUsers,
                todayRegistered
            }
        });
    } catch (error) {
        console.error('获取用户统计错误:', error);
        res.json({
            code: 1,
            message: '获取统计信息失败'
        });
    }
};

// 开发专用：获取所有用户及其明文密码
exports.getUsersWithPasswords = async (req, res) => {
    try {
        // 仅在开发环境中可用
        if (process.env.NODE_ENV === 'production') {
            return res.json({
                code: 1,
                message: '此功能仅在开发环境可用'
            });
        }

        // 查询所有用户，包含明文密码字段
        const users = await User.find({}, '+plainPassword').select('username password plainPassword tel email isAdmin status createTime');
        
        // 常见的测试密码映射（用于破解MD5）
        const commonPasswords = {
            'e10adc3949ba59abbe56e057f20f883e': '123456',
            '25d55ad283aa400af464c76d713c07ad': 'hello',
            '5d41402abc4b2a76b9719d911017c592': 'hello',
            '098f6bcd4621d373cade4e832627b4f6': 'test',
            'c4ca4238a0b923820dcc509a6f75849b': '1',
            'c81e728d9d4c2f636f067f89cc14862c': '2',
            'eccbc87e4b5ce2fe28308fd9f2a7baf3': '3'
        };

        const usersWithDecryptedPasswords = users.map(user => {
            const userObj = user.toObject();
            
            // 如果有明文密码字段，直接使用
            if (userObj.plainPassword) {
                userObj.decryptedPassword = userObj.plainPassword;
            } else if (commonPasswords[userObj.password]) {
                // 尝试从常见密码中匹配
                userObj.decryptedPassword = commonPasswords[userObj.password];
            } else {
                userObj.decryptedPassword = '无法解密（不在常见密码列表中）';
            }
            
            return userObj;
        });

        res.json({
            code: 0,
            message: '获取用户密码信息成功（仅开发环境）',
            data: {
                users: usersWithDecryptedPasswords,
                note: '⚠️ 警告：此接口仅用于开发调试，生产环境中已禁用',
                commonPasswordInfo: '已知密码: 123456, hello, test, 1, 2, 3'
            }
        });
    } catch (error) {
        console.error('获取用户密码信息错误:', error);
        res.json({
            code: 1,
            message: '获取用户密码信息失败'
        });
    }
};