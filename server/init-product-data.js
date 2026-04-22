const mongoose = require('mongoose');
const Product = require('./model/Product');
const Category = require('./model/Category');
const Brand = require('./model/Brand');

// 连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/snack-mall')
  .then(() => {
    console.log('✅ 数据库连接成功');
    initData();
  })
  .catch(error => {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  });

async function initData() {
  try {
    // 清空现有数据
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    console.log('🗑️ 清空现有数据');

    // 初始化分类数据
    const categories = [
      { name: '膨化食品', description: '各种膨化零食', status: '启用', sort: 1, showOnHome: true },
      { name: '薯片', description: '薯片类产品', status: '启用', sort: 2, showOnHome: true },
      { name: '巧克力', description: '巧克力制品', status: '启用', sort: 3, showOnHome: true },
      { name: '糖果', description: '各类糖果', status: '启用', sort: 4, showOnHome: true },
      { name: '坚果', description: '坚果类零食', status: '启用', sort: 5, showOnHome: true },
      { name: '饼干', description: '各种饼干类产品', status: '启用', sort: 6, showOnHome: false },
      { name: '果脯', description: '果脯蜜饯类', status: '启用', sort: 7, showOnHome: false },
      { name: '饮品', description: '各类饮料', status: '启用', sort: 8, showOnHome: false }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('📁 创建分类数据成功');

    // 初始化品牌数据
    const brands = [
      { name: '旺旺', description: '知名食品品牌', status: '启用', sort: 1, isRecommended: true },
      { name: '乐事', description: '薯片知名品牌', status: '启用', sort: 2, isRecommended: true },
      { name: '德芙', description: '巧克力知名品牌', status: '启用', sort: 3, isRecommended: true },
      { name: '好丽友', description: '韩国食品品牌', status: '启用', sort: 4, isRecommended: false },
      { name: '奥利奥', description: '饼干知名品牌', status: '启用', sort: 5, isRecommended: true },
      { name: '康师傅', description: '方便食品品牌', status: '启用', sort: 6, isRecommended: false },
      { name: '三只松鼠', description: '坚果零食品牌', status: '启用', sort: 7, isRecommended: true },
      { name: '百草味', description: '休闲零食品牌', status: '启用', sort: 8, isRecommended: false }
    ];

    const createdBrands = await Brand.insertMany(brands);
    console.log('🏷️ 创建品牌数据成功');

    // 初始化商品数据
    const products = [
      {
        name: '旺旺雪饼',
        category: '膨化食品',
        brand: '旺旺',
        price: 8.5,
        originalPrice: 10.0,
        stock: 120,
        status: '上架',
        tags: ['香脆', '热销', '经典'],
        description: '经典香脆雪饼，老少皆宜的美味零食，口感酥脆，味道香甜',
        weight: '150g',
        shelf_life: '12个月',
        origin: '中国台湾',
        rating: 4.5,
        sales: 8856,
        flavor: '原味',
        minStock: 20,
        isRecommended: true,
        image: 'https://via.placeholder.com/300x300?text=旺旺雪饼'
      },
      {
        name: '乐事薯片原味',
        category: '薯片',
        brand: '乐事',
        price: 6.8,
        originalPrice: 8.0,
        stock: 85,
        status: '上架',
        tags: ['原味', '经典', '酥脆'],
        description: '经典原味薯片，酥脆可口，选用优质土豆制作',
        weight: '70g',
        shelf_life: '9个月',
        origin: '中国',
        rating: 4.3,
        sales: 12356,
        flavor: '原味',
        minStock: 15,
        isRecommended: true,
        image: 'https://via.placeholder.com/300x300?text=乐事薯片'
      },
      {
        name: '德芙巧克力',
        category: '巧克力',
        brand: '德芙',
        price: 15.8,
        originalPrice: 18.0,
        stock: 45,
        status: '上架',
        tags: ['丝滑', '高端', '浓郁'],
        description: '丝滑巧克力，享受甜蜜时光，精选可可豆制作',
        weight: '90g',
        shelf_life: '18个月',
        origin: '比利时',
        rating: 4.8,
        sales: 5623,
        flavor: '牛奶味',
        minStock: 10,
        isRecommended: true,
        image: 'https://via.placeholder.com/300x300?text=德芙巧克力'
      },
      {
        name: '好丽友派',
        category: '饼干',
        brand: '好丽友',
        price: 12.5,
        originalPrice: 15.0,
        stock: 68,
        status: '上架',
        tags: ['软糯', '夹心', '香甜'],
        description: '软糯香甜的夹心派，多种口味可选',
        weight: '180g',
        shelf_life: '10个月',
        origin: '韩国',
        rating: 4.2,
        sales: 3456,
        flavor: '巧克力味',
        minStock: 15,
        isRecommended: false,
        image: 'https://via.placeholder.com/300x300?text=好丽友派'
      },
      {
        name: '奥利奥饼干',
        category: '饼干',
        brand: '奥利奥',
        price: 9.9,
        originalPrice: 12.0,
        stock: 92,
        status: '上架',
        tags: ['经典', '夹心', '香草'],
        description: '经典黑白夹心饼干，香草奶油夹心',
        weight: '116g',
        shelf_life: '12个月',
        origin: '中国',
        rating: 4.6,
        sales: 15678,
        flavor: '香草味',
        minStock: 20,
        isRecommended: true,
        image: 'https://via.placeholder.com/300x300?text=奥利奥饼干'
      },
      {
        name: '三只松鼠坚果',
        category: '坚果',
        brand: '三只松鼠',
        price: 28.8,
        originalPrice: 35.0,
        stock: 156,
        status: '上架',
        tags: ['健康', '营养', '混合'],
        description: '精选优质坚果，营养丰富，健康美味',
        weight: '300g',
        shelf_life: '6个月',
        origin: '中国',
        rating: 4.7,
        sales: 9876,
        flavor: '原味',
        minStock: 30,
        isRecommended: true,
        image: 'https://via.placeholder.com/300x300?text=三只松鼠坚果'
      },
      {
        name: '百草味果脯',
        category: '果脯',
        brand: '百草味',
        price: 18.8,
        originalPrice: 22.0,
        stock: 73,
        status: '上架',
        tags: ['酸甜', '果香', '天然'],
        description: '精选新鲜水果制作，酸甜可口，果香浓郁',
        weight: '200g',
        shelf_life: '8个月',
        origin: '中国',
        rating: 4.1,
        sales: 2345,
        flavor: '混合果味',
        minStock: 15,
        isRecommended: false,
        image: 'https://via.placeholder.com/300x300?text=百草味果脯'
      },
      {
        name: '康师傅绿茶',
        category: '饮品',
        brand: '康师傅',
        price: 3.5,
        originalPrice: 4.0,
        stock: 200,
        status: '上架',
        tags: ['清香', '解腻', '天然'],
        description: '清香绿茶，天然茶叶萃取，清热解腻',
        weight: '500ml',
        shelf_life: '12个月',
        origin: '中国',
        rating: 4.0,
        sales: 25678,
        flavor: '绿茶味',
        minStock: 50,
        isRecommended: false,
        image: 'https://via.placeholder.com/300x300?text=康师傅绿茶'
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log('🛍️ 创建商品数据成功');

    // 更新分类和品牌的商品数量
    for (const category of createdCategories) {
      const count = await Product.countDocuments({ category: category.name });
      await Category.findByIdAndUpdate(category._id, { productCount: count });
    }

    for (const brand of createdBrands) {
      const count = await Product.countDocuments({ brand: brand.name });
      await Brand.findByIdAndUpdate(brand._id, { productCount: count });
    }

    console.log('📊 更新统计数据成功');
    console.log('🎉 初始化数据完成！');
    
    // 输出统计信息
    const categoryCount = await Category.countDocuments();
    const brandCount = await Brand.countDocuments();
    const productCount = await Product.countDocuments();
    
    console.log(`📈 数据统计:`);
    console.log(`   - 分类数量: ${categoryCount}`);
    console.log(`   - 品牌数量: ${brandCount}`);
    console.log(`   - 商品数量: ${productCount}`);

  } catch (error) {
    console.error('❌ 初始化数据失败:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 数据库连接已关闭');
  }
} 