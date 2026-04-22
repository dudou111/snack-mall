const mongoose = require('mongoose');
const Product = require('./model/Product');

// 连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/snack-mall')
  .then(() => {
    console.log('✅ 数据库连接成功');
    initProducts();
  })
  .catch(error => {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  });

async function initProducts() {
  try {
    const productCount = await Product.countDocuments();
    console.log(`当前商品数量: ${productCount}`);

    console.log('📦 开始添加商品数据...');

    const products = [
      // 薯片类 (15个)
      { name: '乐事原味薯片', category: '薯片', brand: '乐事', price: 8.5, stock: 200, status: '上架', description: '经典原味，香脆可口', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400' },
      { name: '乐事黄瓜味薯片', category: '薯片', brand: '乐事', price: 8.5, stock: 180, status: '上架', description: '清新黄瓜味', image: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400' },
      { name: '乐事番茄味薯片', category: '薯片', brand: '乐事', price: 8.5, stock: 150, status: '上架', description: '酸甜番茄味', image: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400' },
      { name: '乐事烧烤味薯片', category: '薯片', brand: '乐事', price: 9.0, stock: 160, status: '上架', description: '浓郁烧烤风味', image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400' },
      { name: '乐事海苔味薯片', category: '薯片', brand: '乐事', price: 9.5, stock: 140, status: '上架', description: '海洋风味', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400' },
      { name: '品客原味薯片', category: '薯片', brand: '品客', price: 12.0, stock: 100, status: '上架', description: '罐装薯片，方便携带', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400' },
      { name: '品客酸奶油洋葱味', category: '薯片', brand: '品客', price: 12.0, stock: 90, status: '上架', description: '独特风味组合', image: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400' },
      { name: '上好佳洋葱圈', category: '薯片', brand: '上好佳', price: 5.5, stock: 220, status: '上架', description: '香脆洋葱圈', image: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400' },
      { name: '上好佳鲜虾条', category: '薯片', brand: '上好佳', price: 5.0, stock: 250, status: '上架', description: '鲜虾风味', image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400' },
      { name: '可比克薯片原味', category: '薯片', brand: '可比克', price: 7.5, stock: 170, status: '上架', description: '薄脆口感', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400' },
      { name: '可比克薯片烧烤味', category: '薯片', brand: '可比克', price: 7.5, stock: 160, status: '上架', description: '烧烤风味', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400' },
      { name: '好丽友薯愿', category: '薯片', brand: '好丽友', price: 10.0, stock: 130, status: '上架', description: '厚切薯片', image: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400' },
      { name: '卡乐比薯条三兄弟', category: '薯片', brand: '卡乐比', price: 18.0, stock: 80, status: '上架', description: '日本进口薯条', image: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400' },
      { name: '卡乐比虾条', category: '薯片', brand: '卡乐比', price: 15.0, stock: 90, status: '上架', description: '浓郁虾味', image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400' },
      { name: '好丽友呀土豆', category: '薯片', brand: '好丽友', price: 6.5, stock: 200, status: '上架', description: '波浪薯片', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400' },

      // 巧克力类 (12个)
      { name: '德芙丝滑牛奶巧克力', category: '巧克力', brand: '德芙', price: 15.0, stock: 150, status: '上架', description: '丝滑口感', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400' },
      { name: '德芙榛仁巧克力', category: '巧克力', brand: '德芙', price: 18.0, stock: 120, status: '上架', description: '香脆榛仁', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400' },
      { name: '德芙黑巧克力', category: '巧克力', brand: '德芙', price: 16.0, stock: 110, status: '上架', description: '浓郁可可', image: 'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=400' },
      { name: '费列罗巧克力', category: '巧克力', brand: '费列罗', price: 35.0, stock: 80, status: '上架', description: '金色包装，送礼佳品', image: 'https://images.unsplash.com/photo-1548848979-47519fe7d1c6?w=400' },
      { name: '好时巧克力', category: '巧克力', brand: '好时', price: 12.0, stock: 140, status: '上架', description: '美国经典巧克力', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400' },
      { name: '士力架巧克力', category: '巧克力', brand: '士力架', price: 5.0, stock: 300, status: '上架', description: '横扫饥饿', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400' },
      { name: '德芙麦芽脆心巧克力', category: '巧克力', brand: '德芙', price: 17.0, stock: 100, status: '上架', description: '脆心口感', image: 'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=400' },
      { name: '瑞士莲软心巧克力', category: '巧克力', brand: '瑞士莲', price: 28.0, stock: 70, status: '上架', description: '软心流心', image: 'https://images.unsplash.com/photo-1548848979-47519fe7d1c6?w=400' },
      { name: 'M&M巧克力豆', category: '巧克力', brand: 'M&M', price: 10.0, stock: 180, status: '上架', description: '彩色巧克力豆', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400' },
      { name: '奇巧威化巧克力', category: '巧克力', brand: '奇巧', price: 8.0, stock: 200, status: '上架', description: '威化夹心', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400' },
      { name: '阿尔卑斯棒棒糖巧克力味', category: '巧克力', brand: '阿尔卑斯', price: 3.5, stock: 400, status: '上架', description: '棒棒糖', image: 'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=400' },
      { name: '金丝猴巧克力', category: '巧克力', brand: '金丝猴', price: 6.0, stock: 220, status: '上架', description: '国产经典', image: 'https://images.unsplash.com/photo-1548848979-47519fe7d1c6?w=400' },

      // 饼干类 (10个)
      { name: '奥利奥原味夹心饼干', category: '饼干', brand: '奥利奥', price: 9.5, stock: 200, status: '上架', description: '经典黑白配', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400' },
      { name: '奥利奥金装夹心饼干', category: '饼干', brand: '奥利奥', price: 12.0, stock: 150, status: '上架', description: '金色包装', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400' },
      { name: '趣多多巧克力曲奇', category: '饼干', brand: '趣多多', price: 11.0, stock: 160, status: '上架', description: '巧克力豆曲奇', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400' },
      { name: '好丽友巧克力派', category: '饼干', brand: '好丽友', price: 7.5, stock: 250, status: '上架', description: '软心巧克力派', image: 'https://images.unsplash.com/photo-1590080876876-5d3e2d4c1c8e?w=400' },
      { name: '好丽友蘑古力', category: '饼干', brand: '好丽友', price: 6.5, stock: 280, status: '上架', description: '蘑菇形饼干', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400' },
      { name: '达能王子饼干', category: '饼干', brand: '达能', price: 8.0, stock: 190, status: '上架', description: '儿童饼干', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400' },
      { name: '康师傅妙芙蛋糕', category: '饼干', brand: '康师傅', price: 5.5, stock: 300, status: '上架', description: '欧式蛋糕', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400' },
      { name: '徐福记蛋卷', category: '饼干', brand: '徐福记', price: 13.0, stock: 120, status: '上架', description: '香脆蛋卷', image: 'https://images.unsplash.com/photo-1590080876876-5d3e2d4c1c8e?w=400' },
      { name: '嘉顿威化饼干', category: '饼干', brand: '嘉顿', price: 10.0, stock: 170, status: '上架', description: '多层威化', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400' },
      { name: '格力高百奇', category: '饼干', brand: '格力高', price: 9.0, stock: 180, status: '上架', description: '巧克力棒', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400' },

      // 坚果类 (8个)
      { name: '三只松鼠每日坚果', category: '坚果', brand: '三只松鼠', price: 25.0, stock: 100, status: '上架', description: '混合坚果', image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400' },
      { name: '三只松鼠碧根果', category: '坚果', brand: '三只松鼠', price: 28.0, stock: 90, status: '上架', description: '奶油味碧根果', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400' },
      { name: '三只松鼠夏威夷果', category: '坚果', brand: '三只松鼠', price: 32.0, stock: 80, status: '上架', description: '奶油味夏威夷果', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400' },
      { name: '百草味开心果', category: '坚果', brand: '百草味', price: 30.0, stock: 85, status: '上架', description: '原味开心果', image: 'https://images.unsplash.com/photo-1619546952812-520e98064a52?w=400' },
      { name: '百草味腰果', category: '坚果', brand: '百草味', price: 26.0, stock: 95, status: '上架', description: '盐焗腰果', image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400' },
      { name: '良品铺子混合坚果', category: '坚果', brand: '良品铺子', price: 35.0, stock: 70, status: '上架', description: '高端坚果礼盒', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400' },
      { name: '洽洽瓜子', category: '坚果', brand: '洽洽', price: 8.0, stock: 250, status: '上架', description: '香瓜子', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400' },
      { name: '洽洽小黄袋每日坚果', category: '坚果', brand: '洽洽', price: 22.0, stock: 110, status: '上架', description: '每日坚果', image: 'https://images.unsplash.com/photo-1619546952812-520e98064a52?w=400' },

      // 糖果类 (8个)
      { name: '大白兔奶糖', category: '糖果', brand: '大白兔', price: 12.0, stock: 200, status: '上架', description: '经典奶糖', image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400' },
      { name: '徐福记酥心糖', category: '糖果', brand: '徐福记', price: 15.0, stock: 150, status: '上架', description: '酥心糖果', image: 'https://images.unsplash.com/photo-1499195333224-3ce974eecb47?w=400' },
      { name: '徐福记沙琪玛', category: '糖果', brand: '徐福记', price: 10.0, stock: 180, status: '上架', description: '传统糕点', image: 'https://images.unsplash.com/photo-1587241321921-91a834d82ffc?w=400' },
      { name: '阿尔卑斯棒棒糖', category: '糖果', brand: '阿尔卑斯', price: 3.0, stock: 500, status: '上架', description: '多种口味', image: 'https://images.unsplash.com/photo-1514517521153-1be72277b32f?w=400' },
      { name: '旺仔QQ糖', category: '糖果', brand: '旺旺', price: 4.5, stock: 300, status: '上架', description: 'Q弹软糖', image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400' },
      { name: '金丝猴奶糖', category: '糖果', brand: '金丝猴', price: 8.0, stock: 220, status: '上架', description: '奶香浓郁', image: 'https://images.unsplash.com/photo-1499195333224-3ce974eecb47?w=400' },
      { name: '喔喔奶糖', category: '糖果', brand: '喔喔', price: 6.5, stock: 250, status: '上架', description: '童年回忆', image: 'https://images.unsplash.com/photo-1587241321921-91a834d82ffc?w=400' },
      { name: '不二家棒棒糖', category: '糖果', brand: '不二家', price: 3.5, stock: 400, status: '上架', description: '水果味棒棒糖', image: 'https://images.unsplash.com/photo-1514517521153-1be72277b32f?w=400' },

      // 膨化食品类 (5个)
      { name: '旺旺雪饼', category: '膨化食品', brand: '旺旺', price: 6.0, stock: 280, status: '上架', description: '经典雪饼', image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400' },
      { name: '旺旺仙贝', category: '膨化食品', brand: '旺旺', price: 6.5, stock: 260, status: '上架', description: '香脆仙贝', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400' },
      { name: '旺旺小馒头', category: '膨化食品', brand: '旺旺', price: 5.0, stock: 300, status: '上架', description: '奶香小馒头', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400' },
      { name: '卫龙辣条', category: '膨化食品', brand: '卫龙', price: 3.5, stock: 500, status: '上架', description: '经典辣条', image: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400' },
      { name: '亲嘴烧', category: '膨化食品', brand: '亲嘴烧', price: 4.0, stock: 350, status: '上架', description: '烧烤味', image: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400' },

      // 果脯类 (4个)
      { name: '溜溜梅', category: '果脯', brand: '溜溜梅', price: 8.0, stock: 200, status: '上架', description: '话梅', image: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=400' },
      { name: '百草味芒果干', category: '果脯', brand: '百草味', price: 18.0, stock: 120, status: '上架', description: '芒果干', image: 'https://images.unsplash.com/photo-1587132117816-5c3e8dd2c47a?w=400' },
      { name: '良品铺子猕猴桃干', category: '果脯', brand: '良品铺子', price: 20.0, stock: 100, status: '上架', description: '猕猴桃干', image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=400' },
      { name: '三只松鼠草莓干', category: '果脯', brand: '三只松鼠', price: 16.0, stock: 130, status: '上架', description: '草莓干', image: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=400' }
    ];

    await Product.insertMany(products);
    console.log(`✅ 成功添加 ${products.length} 个商品`);

    const finalCount = await Product.countDocuments();
    console.log(`📊 当前商品总数: ${finalCount}`);
    console.log('🎉 商品数据初始化完成！');

  } catch (error) {
    console.error('❌ 初始化失败:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 数据库连接已关闭');
  }
}
