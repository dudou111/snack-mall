// 开发专用：密码查看工具
// ⚠️ 警告：此工具仅用于开发调试，绝不应在生产环境中使用！

const mongoose = require('mongoose');
const User = require('./model/user');

// 常见的测试密码MD5映射
const commonPasswords = {
    'e10adc3949ba59abbe56e057f20f883e': '123456',
    '25d55ad283aa400af464c76d713c07ad': 'hello',
    '5d41402abc4b2a76b9719d911017c592': 'hello', 
    '098f6bcd4621d373cade4e832627b4f6': 'test',
    'c4ca4238a0b923820dcc509a6f75849b': '1',
    'c81e728d9d4c2f636f067f89cc14862c': '2',
    'eccbc87e4b5ce2fe28308fd9f2a7baf3': '3',
    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8': 'password',
    '8bb0cf6eb9b17d0f7d22b456f121257dc1254e1f01665370476383ea776df414': 'secret'
};

async function viewPasswords() {
    try {
        console.log('🔍 开发专用密码查看工具');
        console.log('⚠️  警告：此工具仅用于开发调试！\n');

        // 连接数据库
        await mongoose.connect('mongodb://127.0.0.1:27017/snack-mall');
        console.log('✅ 数据库连接成功\n');

        // 查询所有用户
        const users = await User.find({}, '+plainPassword').select('username password plainPassword tel email isAdmin status createTime');

        console.log('📋 用户密码信息：');
        console.log('='.repeat(80));

        users.forEach((user, index) => {
            console.log(`${index + 1}. 用户名: ${user.username}`);
            console.log(`   加密密码: ${user.password}`);
            
            // 显示明文密码
            if (user.plainPassword) {
                console.log(`   明文密码: ${user.plainPassword} ✅ (来自plainPassword字段)`);
            } else if (commonPasswords[user.password]) {
                console.log(`   明文密码: ${commonPasswords[user.password]} ✅ (MD5解密)`);
            } else {
                console.log(`   明文密码: 无法解密 ❌`);
            }
            
            console.log(`   手机号: ${user.tel || '未设置'}`);
            console.log(`   邮箱: ${user.email || '未设置'}`);
            console.log(`   管理员: ${user.isAdmin ? '是' : '否'}`);
            console.log(`   状态: ${user.status}`);
            console.log(`   创建时间: ${user.createTime}`);
            console.log('-'.repeat(50));
        });

        console.log('\n📝 已知密码映射：');
        Object.entries(commonPasswords).forEach(([hash, password]) => {
            console.log(`   ${password} -> ${hash}`);
        });

        console.log('\n💡 提示：');
        console.log('   1. 如果看到"无法解密"，说明密码不在常见密码列表中');
        console.log('   2. 新注册的用户会自动保存明文密码到plainPassword字段');
        console.log('   3. 生产环境中应该移除plainPassword字段以确保安全');

    } catch (error) {
        console.error('❌ 查看密码失败:', error);
    } finally {
        // 关闭数据库连接
        await mongoose.disconnect();
        console.log('\n✅ 数据库连接已关闭');
    }
}

// 运行工具
if (require.main === module) {
    viewPasswords();
}

module.exports = { viewPasswords, commonPasswords }; 