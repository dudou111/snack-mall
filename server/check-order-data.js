const mongoose = require('mongoose');
const Order = require('./model/Order');
const User = require('./model/user');

mongoose.connect('mongodb://127.0.0.1:27017/snack-mall')
  .then(async () => {
    console.log('✅ 数据库连接成功\n');

    // 检查订单数据
    const orderCount = await Order.countDocuments();
    console.log(`📦 订单总数: ${orderCount}`);

    const orders = await Order.find().limit(3);
    console.log('\n订单示例:');
    orders.forEach(order => {
      console.log(`- 订单号: ${order.orderNumber}`);
      console.log(`  买家ID: ${order.buyerId}`);
      console.log(`  状态: ${order.status}`);
      console.log(`  支付状态: ${order.paymentStatus}`);
      console.log(`  配送状态: ${order.deliveryStatus}`);
      console.log('');
    });

    // 检查用户数据
    const adminUsers = await User.find({ $or: [{ isAdmin: true }, { role: 'admin' }] });
    console.log(`\n👤 管理员用户数: ${adminUsers.length}`);
    adminUsers.forEach(user => {
      console.log(`- ${user.username} (ID: ${user._id}, role: ${user.role}, isAdmin: ${user.isAdmin})`);
    });

    const normalUsers = await User.find({ isAdmin: false, role: 'user' });
    console.log(`\n👥 普通用户数: ${normalUsers.length}`);
    normalUsers.forEach(user => {
      console.log(`- ${user.username} (ID: ${user._id})`);
    });

    mongoose.connection.close();
    console.log('\n🔌 数据库连接已关闭');
  })
  .catch(error => {
    console.error('❌ 错误:', error);
    process.exit(1);
  });
