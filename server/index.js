// 启动服务模块
const express = require('express');
// 连接数据库模块
const mongoose = require('mongoose');
const cors = require('cors');

const { mock, Random } = require('mockjs');

// 各个接口文件
const authRouter = require('./router/authRouter');
const shopAuthRouter = require('./router/shopAuthRouter');
const adminAuthRouter = require('./router/adminAuthRouter');
const productRouter = require('./router/productRouter');
const orderRouter = require('./router/orderRouter');
const userRouter = require('./router/userRouter');
const dashboardRouter = require('./router/dashboardRouter');
const AdminUser = require('./model/adminUser');
const MD5 = require('md5');
const { getStartupDiagnostics } = require('./utils/startupDiagnostics');
const { attachNotificationSocket } = require('./utils/notificationHub');

// 配置mongoose连接选项
mongoose.set('strictQuery', false);

// 连接数据库
mongoose
    .connect('mongodb://127.0.0.1:27017/snack-mall', )
    .then(async () => {
        console.log('✅ 数据库连接成功 ==> MongoDB://127.0.0.1:27017/snack-mall');

        // 检查数据库连接状态
        const dbState = mongoose.connection.readyState;
        console.log('📊 数据库连接状态:', dbState === 1 ? '已连接' : '连接中');

        const rootAdmin = await AdminUser.findOne({ username: 'root' });
        if (!rootAdmin) {
            await AdminUser.create({
                username: 'root',
                password: MD5('123456'),
                plainPassword: process.env.NODE_ENV !== 'production' ? '123456' : undefined,
                tel: '13812345678',
                role: 'admin',
                isAdmin: true,
                avatar: 'http://127.0.0.1:8088/default-avatar.jpg'
            });
            console.log('✅ 初始后台管理员账号创建成功');
        }

        // 开启服务
        const app = express();

        // 解析数据格式
        app.use(express.json({ limit: '10mb' })); // 解析json数据，设置大小限制
        app.use(express.urlencoded({ extended: true, limit: '10mb' })); // 解析urlencoded数据

        // CORS配置 - 使用更全面的方法
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            
            // 预检请求处理
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        });

        // 配置静态资源文件夹
        app.use(express.static('./static'));

        // 添加请求日志中间件
        app.use((req, res, next) => {
            console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.url}`);
            next();
        });

        // 引入接口文件
        app.use('/api/auth', authRouter);
        app.use('/api/shop-auth', shopAuthRouter);
        app.use('/api/admin-auth', adminAuthRouter);
        app.use('/api/product', productRouter);
        app.use('/api/order', orderRouter);
        app.use('/api/user', userRouter);
        app.use('/api/dashboard', dashboardRouter);

        // 健康检查接口
        app.get('/health', (req, res) => {
            res.json({
                code: 0,
                message: '服务器运行正常',
                data: {
                    timestamp: new Date().toISOString(),
                    database: mongoose.connection.readyState === 1 ? '已连接' : '未连接',
                    uptime: process.uptime()
                }
            });
        });

        // 404处理
        app.use((req, res) => {
            res.status(404).json({
                code: 1,
                message: `接口不存在: ${req.method} ${req.originalUrl}`
            });
        });

        // 全局错误处理
        app.use((error, req, res, next) => {
            console.error('🚨 服务器错误:', error);
            res.status(500).json({
                code: 1,
                message: '服务器内部错误',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        });

        // 挂载端口
        const server = app.listen(8088, '127.0.0.1', (error) => {
            if (error) {
                console.error('❌ 服务器启动失败:', error);
                return;
            }
            const startupDiagnostics = getStartupDiagnostics();
            console.log('🚀 服务器启动成功: http://127.0.0.1:8088');
            console.log(`💳 Stripe测试密钥: ${startupDiagnostics.stripeSecretKeyStatus}`);
        });
        attachNotificationSocket(server);

        // 优雅关闭
        process.on('SIGTERM', () => {
            console.log('📴 收到SIGTERM信号，正在关闭服务器...');
            server.close(() => {
                console.log('✅ 服务器已关闭');
                mongoose.connection.close();
            });
        });

        // 调用方法插入假数据（根据需要取消注释）
        // doctor();
    })
    .catch((error) => {
        console.error('❌ 数据库连接失败:', error.message);
        console.log('💡 请确保MongoDB服务正在运行：');
        console.log('   - Windows: net start MongoDB');
        console.log('   - Linux/Mac: sudo systemctl start mongod');
        process.exit(1);
    });




