const mongoose = require('mongoose');
const MD5 = require('md5');
const User = require('./model/user');
const Product = require('./model/Product');
const Order = require('./model/Order');
const Category = require('./model/Category');
const Brand = require('./model/Brand');

// 连接数据库
async function connectDB() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/snack-mall');
        console.log('✅ 数据库连接成功');
    } catch (error) {
        console.error('❌ 数据库连接失败:', error);
        process.exit(1);
    }
}

// 创建假用户数据
async function createUsers() {
    console.log('🔄 创建用户数据...');
    
    const users = [
        {
            username: 'user001',
            password: MD5('123456'),
            plainPassword: '123456',
            email: 'user001@example.com',
            tel: '13800138001',
            isAdmin: false,
            status: '启用',
            avatar: 'http://127.0.0.1:8088/default-avatar.jpg'
        },
        {
            username: 'user002',
            password: MD5('123456'),
            plainPassword: '123456',
            email: 'user002@example.com',
            tel: '13800138002',
            isAdmin: false,
            status: '启用',
            avatar: 'http://127.0.0.1:8088/default-avatar2.jpg'
        },
        {
            username: 'user003',
            password: MD5('123456'),
            plainPassword: '123456',
            email: 'user003@example.com',
            tel: '13800138003',
            isAdmin: false,
            status: '禁用',
            avatar: 'http://127.0.0.1:8088/default-avatar3.png'
        },
        {
            username: 'manager',
            password: MD5('123456'),
            plainPassword: '123456',
            email: 'manager@example.com',
            tel: '13800138004',
            isAdmin: true,
            status: '启用',
            avatar: 'http://127.0.0.1:8088/default-avatar.jpg'
        },
        {
            username: '张三',
            password: MD5('123456'),
            plainPassword: '123456',
            email: 'zhangsan@example.com',
            tel: '13811112222',
            isAdmin: false,
            status: '启用',
            avatar: 'http://127.0.0.1:8088/default-avatar.jpg'
        },
        {
            username: '李四',
            password: MD5('123456'),
            plainPassword: '123456',
            email: 'lisi@example.com',
            tel: '13822223333',
            isAdmin: false,
            status: '启用',
            avatar: 'http://127.0.0.1:8088/default-avatar2.jpg'
        },
        {
            username: '王五',
            password: MD5('123456'),
            plainPassword: '123456',
            email: 'wangwu@example.com',
            tel: '13833334444',
            isAdmin: false,
            status: '封禁',
            avatar: 'http://127.0.0.1:8088/default-avatar3.png'
        },
        // 添加更多用户数据
        {
            username: '赵六',
            password: MD5('123456'),
            plainPassword: '123456',
            email: 'zhaoliu@example.com',
            tel: '13844445555',
            isAdmin: false,
            status: '启用',
            avatar: 'http://127.0.0.1:8088/default-avatar.jpg'
        },
        {
            username: '钱七',
            password: MD5('123456'),
            plainPassword: '123456',
            email: 'qianqi@example.com',
            tel: '13855556666',
            isAdmin: false,
            status: '启用',
            avatar: 'http://127.0.0.1:8088/default-avatar2.jpg'
        },
        {
            username: '孙八',
            password: MD5('123456'),
            plainPassword: '123456',
            email: 'sunba@example.com',
            tel: '13866667777',
            isAdmin: false,
            status: '禁用',
            avatar: 'http://127.0.0.1:8088/default-avatar3.png'
        },
        {
            username: '周九',
            password: MD5('123456'),
            plainPassword: '123456',
            email: 'zhoujiu@example.com',
            tel: '13877778888',
            isAdmin: false,
            status: '启用',
            avatar: 'http://127.0.0.1:8088/default-avatar.jpg'
        },
        {
            username: '吴十',
            password: MD5('123456'),
            plainPassword: '123456',
            email: 'wushi@example.com',
            tel: '13888889999',
            isAdmin: false,
            status: '封禁',
            avatar: 'http://127.0.0.1:8088/default-avatar2.jpg'
        },
        {
            username: 'admin',
            password: MD5('admin123'),
            plainPassword: 'admin123',
            email: 'admin@example.com',
            tel: '13899990000',
            isAdmin: true,
            status: '启用',
            avatar: 'http://127.0.0.1:8088/default-avatar.jpg'
        },
        {
            username: 'superadmin',
            password: MD5('super123'),
            plainPassword: 'super123',
            email: 'super@example.com',
            tel: '13900001111',
            isAdmin: true,
            status: '启用',
            avatar: 'http://127.0.0.1:8088/default-avatar3.png'
        },
        {
            username: '刘经理',
            password: MD5('123456'),
            plainPassword: '123456',
            email: 'liujingli@example.com',
            tel: '13911112222',
            isAdmin: true,
            status: '启用',
            avatar: 'http://127.0.0.1:8088/default-avatar.jpg'
        }
    ];

    // 检查用户是否已存在，不存在则创建
    for (const userData of users) {
        const existingUser = await User.findOne({ username: userData.username });
        if (!existingUser) {
            await User.create(userData);
            console.log(`✅ 创建用户: ${userData.username}`);
        } else {
            console.log(`ℹ️  用户已存在: ${userData.username}`);
        }
    }
}

// 创建分类数据
async function createCategories() {
    console.log('🔄 创建分类数据...');
    
    const categories = [
        {
            name: '零食',
            description: '各种美味零食',
            status: '启用',
            parentId: null,
            level: 1,
            sort: 1
        },
        {
            name: '饮料',
            description: '各种饮品',
            status: '启用',
            parentId: null,
            level: 1,
            sort: 2
        },
        {
            name: '日用品',
            description: '日常用品',
            status: '启用',
            parentId: null,
            level: 1,
            sort: 3
        }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
        const existingCategory = await Category.findOne({ name: categoryData.name });
        if (!existingCategory) {
            const category = await Category.create(categoryData);
            createdCategories.push(category);
            console.log(`✅ 创建分类: ${categoryData.name}`);
        } else {
            createdCategories.push(existingCategory);
            console.log(`ℹ️  分类已存在: ${categoryData.name}`);
        }
    }
    
    return createdCategories;
}

// 创建品牌数据
async function createBrands() {
    console.log('🔄 创建品牌数据...');
    
    const brands = [
        {
            name: '旺旺',
            description: '旺旺集团品牌',
            status: '启用',
            logo: 'http://127.0.0.1:8088/brand-logo1.jpg'
        },
        {
            name: '乐事',
            description: '百事集团薯片品牌',
            status: '启用',
            logo: 'http://127.0.0.1:8088/brand-logo2.jpg'
        },
        {
            name: '可口可乐',
            description: '可口可乐公司',
            status: '启用',
            logo: 'http://127.0.0.1:8088/brand-logo3.jpg'
        },
        {
            name: '康师傅',
            description: '康师傅控股有限公司',
            status: '启用',
            logo: 'http://127.0.0.1:8088/brand-logo4.jpg'
        },
        {
            name: '三只松鼠',
            description: '三只松鼠股份有限公司',
            status: '启用',
            logo: 'http://127.0.0.1:8088/brand-logo5.jpg'
        }
    ];

    const createdBrands = [];
    for (const brandData of brands) {
        const existingBrand = await Brand.findOne({ name: brandData.name });
        if (!existingBrand) {
            const brand = await Brand.create(brandData);
            createdBrands.push(brand);
            console.log(`✅ 创建品牌: ${brandData.name}`);
        } else {
            createdBrands.push(existingBrand);
            console.log(`ℹ️  品牌已存在: ${brandData.name}`);
        }
    }
    
    return createdBrands;
}

// 创建商品数据
async function createProducts(categories, brands) {
    console.log('🔄 创建商品数据...');
    
    const products = [
        {
            name: '旺旺雪饼',
            price: 8.5,
            originalPrice: 10.0,
            stock: 100,
            description: '经典旺旺雪饼，香脆可口',
            status: '上架',
            category: '零食',
            brand: '旺旺',
            images: ['http://127.0.0.1:8088/product1.jpg'],
            weight: '100g',
            shelf_life: '12个月'
        },
        {
            name: '乐事薯片经典原味',
            price: 6.5,
            originalPrice: 7.5,
            stock: 80,
            description: '乐事经典原味薯片',
            status: '上架',
            category: '零食',
            brand: '乐事',
            images: ['http://127.0.0.1:8088/product2.jpg'],
            weight: '70g',
            shelf_life: '8个月'
        },
        {
            name: '可口可乐330ml',
            price: 3.0,
            originalPrice: 3.5,
            stock: 200,
            description: '经典可口可乐',
            status: '上架',
            category: '饮料',
            brand: '可口可乐',
            images: ['http://127.0.0.1:8088/product3.jpg'],
            weight: '330ml',
            shelf_life: '24个月'
        },
        {
            name: '康师傅红烧牛肉面',
            price: 4.5,
            originalPrice: 5.0,
            stock: 150,
            description: '康师傅经典红烧牛肉面',
            status: '上架',
            category: '零食',
            brand: '康师傅',
            images: ['http://127.0.0.1:8088/product4.jpg'],
            weight: '120g',
            shelf_life: '18个月'
        },
        {
            name: '三只松鼠每日坚果',
            price: 15.8,
            originalPrice: 18.0,
            stock: 60,
            description: '三只松鼠每日坚果混合装',
            status: '上架',
            category: '零食',
            brand: '三只松鼠',
            images: ['http://127.0.0.1:8088/product5.jpg'],
            weight: '25g*7包',
            shelf_life: '12个月'
        },
        {
            name: '旺旺仙贝',
            price: 12.0,
            originalPrice: 14.0,
            stock: 90,
            description: '旺旺仙贝米果',
            status: '上架',
            category: '零食',
            brand: '旺旺',
            images: ['http://127.0.0.1:8088/product6.jpg'],
            weight: '150g',
            shelf_life: '12个月'
        },
        {
            name: '乐事薯片黄瓜味',
            price: 6.5,
            originalPrice: 7.5,
            stock: 70,
            description: '乐事黄瓜味薯片',
            status: '上架',
            category: '零食',
            brand: '乐事',
            images: ['http://127.0.0.1:8088/product7.jpg'],
            weight: '70g',
            shelf_life: '8个月'
        },
        {
            name: '康师傅绿茶',
            price: 3.5,
            originalPrice: 4.0,
            stock: 120,
            description: '康师傅茉莉花茶',
            status: '上架',
            category: '饮料',
            brand: '康师傅',
            images: ['http://127.0.0.1:8088/product8.jpg'],
            weight: '500ml',
            shelf_life: '12个月'
        }
    ];

    const createdProducts = [];
    for (const productData of products) {
        const existingProduct = await Product.findOne({ name: productData.name });
        if (!existingProduct) {
            const product = await Product.create(productData);
            createdProducts.push(product);
            console.log(`✅ 创建商品: ${productData.name}`);
        } else {
            createdProducts.push(existingProduct);
            console.log(`ℹ️  商品已存在: ${productData.name}`);
        }
    }
    
    return createdProducts;
}

// 创建订单数据
async function createOrders(products) {
    console.log('🔄 创建订单数据...');
    
    const customers = [
        { name: '张三', phone: '13800138001', address: '北京市朝阳区某某街道123号' },
        { name: '李四', phone: '13800138002', address: '上海市浦东新区某某路456号' },
        { name: '王五', phone: '13800138003', address: '广州市天河区某某大道789号' },
        { name: '赵六', phone: '13800138004', address: '深圳市南山区某某街101号' },
        { name: '钱七', phone: '13800138005', address: '杭州市西湖区某某路202号' }
    ];

    const orderStatuses = ['待支付', '待发货', '配送中', '已完成', '已取消'];
    const paymentStatuses = ['未支付', '已支付', '已退款'];
    const deliveryStatuses = ['待发货', '配送中', '已送达', '配送失败'];
    const paymentMethods = ['微信支付', '支付宝', '现金'];

    // 创建20个订单
    for (let i = 1; i <= 20; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const itemCount = Math.floor(Math.random() * 4) + 1; // 1-4个商品
        const items = [];
        let totalAmount = 0;

        // 随机选择商品
        for (let j = 0; j < itemCount; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 3) + 1; // 1-3个数量
            const subtotal = product.price * quantity;
            
            // 检查是否已存在相同商品，如果存在则合并数量
            const existingItem = items.find(item => item.productId.toString() === product._id.toString());
            if (existingItem) {
                existingItem.quantity += quantity;
                existingItem.subtotal += subtotal;
            } else {
                items.push({
                    productId: product._id,
                    productName: product.name,
                    price: product.price,
                    quantity,
                    subtotal
                });
            }
            totalAmount += subtotal;
        }

        const deliveryFee = totalAmount > 50 ? 0 : 5; // 满50免运费
        const discountAmount = totalAmount > 100 ? Math.floor(totalAmount * 0.1) : 0; // 满100打9折
        const actualAmount = totalAmount + deliveryFee - discountAmount;

        const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
        const paymentStatus = status === '待支付' ? '未支付' : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
        const deliveryStatus = status === '待支付' || status === '已取消' ? '待发货' : deliveryStatuses[Math.floor(Math.random() * deliveryStatuses.length)];

        // 生成订单时间（最近30天内）
        const orderTime = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
        
        const orderData = {
            customer,
            items,
            totalAmount,
            deliveryFee,
            discountAmount,
            actualAmount,
            status,
            paymentStatus,
            deliveryStatus,
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            remark: Math.random() > 0.7 ? '请尽快发货' : undefined,
            orderTime,
            paymentTime: paymentStatus === '已支付' ? new Date(orderTime.getTime() + Math.floor(Math.random() * 60 * 60 * 1000)) : undefined,
            shipmentTime: deliveryStatus !== '待发货' ? new Date(orderTime.getTime() + Math.floor(Math.random() * 24 * 60 * 60 * 1000)) : undefined,
            completionTime: status === '已完成' ? new Date(orderTime.getTime() + Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)) : undefined
        };

        const existingOrder = await Order.findOne({ 'customer.phone': customer.phone, orderTime: orderData.orderTime });
        if (!existingOrder) {
            await Order.create(orderData);
            console.log(`✅ 创建订单: ${customer.name} - ¥${actualAmount.toFixed(2)}`);
        }
    }
}

// 主函数
async function initData() {
    try {
        await connectDB();
        
        console.log('🚀 开始初始化数据...\n');
        
        // 1. 创建用户数据
        await createUsers();
        console.log('');
        
        // 2. 创建分类数据
        const categories = await createCategories();
        console.log('');
        
        // 3. 创建品牌数据
        const brands = await createBrands();
        console.log('');
        
        // 4. 创建商品数据
        const products = await createProducts(categories, brands);
        console.log('');
        
        // 5. 创建订单数据
        await createOrders(products);
        console.log('');
        
        console.log('🎉 数据初始化完成！');
        console.log('📊 数据统计:');
        console.log(`   - 用户数量: ${await User.countDocuments()}`);
        console.log(`   - 分类数量: ${await Category.countDocuments()}`);
        console.log(`   - 品牌数量: ${await Brand.countDocuments()}`);
        console.log(`   - 商品数量: ${await Product.countDocuments()}`);
        console.log(`   - 订单数量: ${await Order.countDocuments()}`);
        
    } catch (error) {
        console.error('❌ 数据初始化失败:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ 数据库连接已关闭');
        process.exit(0);
    }
}

// 运行初始化
if (require.main === module) {
    initData();
}

module.exports = { initData }; 