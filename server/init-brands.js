const mongoose = require('mongoose');
const Brand = require('./model/Brand');
const Category = require('./model/Category');

// 连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/snack-mall')
  .then(() => {
    console.log('✅ 数据库连接成功');
    initBrandsAndCategories();
  })
  .catch(error => {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  });

async function initBrandsAndCategories() {
  try {
    // 检查品牌数据
    const brandCount = await Brand.countDocuments();
    console.log(`当前品牌数量: ${brandCount}`);

    if (brandCount === 0) {
      console.log('📦 开始初始化品牌数据...');
      
      const brands = [
        { name: '旺旺', description: '知名食品品牌', status: '启用', sort: 1, isRecommended: true },
        { name: '乐事', description: '薯片知名品牌', status: '启用', sort: 2, isRecommended: true },
        { name: '德芙', description: '巧克力知名品牌', status: '启用', sort: 3, isRecommended: true },
        { name: '好丽友', description: '韩国食品品牌', status: '启用', sort: 4, isRecommended: false },
        { name: '奥利奥', description: '饼干知名品牌', status: '启用', sort: 5, isRecommended: true },
        { name: '康师傅', description: '方便食品品牌', status: '启用', sort: 6, isRecommended: false },
        { name: '三只松鼠', description: '坚果零食品牌', status: '启用', sort: 7, isRecommended: true },
        { name: '百草味', description: '休闲零食品牌', status: '启用', sort: 8, isRecommended: false },
        { name: '良品铺子', description: '高端零食品牌', status: '启用', sort: 9, isRecommended: true },
        { name: '徐福记', description: '传统糖果品牌', status: '启用', sort: 10, isRecommended: false }
      ];

      await Brand.insertMany(brands);
      console.log('🏷️ 品牌数据初始化成功');
    } else {
      console.log('✓ 品牌数据已存在，跳过初始化');
    }

    // 检查分类数据
    const categoryCount = await Category.countDocuments();
    console.log(`当前分类数量: ${categoryCount}`);

    if (categoryCount === 0) {
      console.log('📦 开始初始化分类数据...');
      
      const categories = [
        { name: '膨化食品', description: '各种膨化零食', status: '启用', sort: 1, showOnHome: true, level: 1 },
        { name: '薯片', description: '薯片类产品', status: '启用', sort: 2, showOnHome: true, level: 1 },
        { name: '巧克力', description: '巧克力制品', status: '启用', sort: 3, showOnHome: true, level: 1 },
        { name: '糖果', description: '各类糖果', status: '启用', sort: 4, showOnHome: true, level: 1 },
        { name: '坚果', description: '坚果类零食', status: '启用', sort: 5, showOnHome: true, level: 1 },
        { name: '饼干', description: '各种饼干类产品', status: '启用', sort: 6, showOnHome: false, level: 1 },
        { name: '果脯', description: '果脯蜜饯类', status: '启用', sort: 7, showOnHome: false, level: 1 },
        { name: '饮品', description: '各类饮料', status: '启用', sort: 8, showOnHome: false, level: 1 },
        { name: '健康零食', description: '健康营养零食', status: '启用', sort: 9, showOnHome: true, level: 1 }
      ];

      await Category.insertMany(categories);
      console.log('📁 分类数据初始化成功');
    } else {
      console.log('✓ 分类数据已存在，跳过初始化');
    }

    // 输出最终统计
    const finalBrandCount = await Brand.countDocuments();
    const finalCategoryCount = await Category.countDocuments();
    
    console.log('\n📊 最终统计:');
    console.log(`   - 品牌总数: ${finalBrandCount}`);
    console.log(`   - 分类总数: ${finalCategoryCount}`);
    console.log('\n🎉 初始化完成！');

  } catch (error) {
    console.error('❌ 初始化失败:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 数据库连接已关闭');
  }
}
