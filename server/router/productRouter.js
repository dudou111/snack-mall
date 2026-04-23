const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/productCtrl');
const categoryCtrl = require('../controllers/categoryCtrl');
const brandCtrl = require('../controllers/brandCtrl');
const auth = require('../middleware/auth');
const { productImageUpload } = require('../utils/productImageUpload');

// 商品管理路由
// 获取商品列表
router.get('/products', productCtrl.getProducts);
// 获取商品详情
router.get('/products/:id', productCtrl.getProductById);
// 创建商品
router.post('/products', auth, productCtrl.createProduct);
// 上传商品图片
router.post('/upload-image', auth, productImageUpload.single('image'), productCtrl.uploadProductImage);
// 更新商品
router.put('/products/:id', auth, productCtrl.updateProduct);
// 删除商品
router.delete('/products/:id', auth, productCtrl.deleteProduct);
// 批量删除商品
router.post('/products/batch-delete', auth, productCtrl.batchDeleteProducts);
// 更新商品状态
router.patch('/products/:id/status', auth, productCtrl.updateProductStatus);
// 获取商品统计
router.get('/products-stats', auth, productCtrl.getProductStats);
// 获取商家上传记录
router.get('/upload-records', auth, productCtrl.getUploadRecords);

// 分类管理路由
// 获取分类列表
router.get('/categories', categoryCtrl.getCategories);
// 获取分类树
router.get('/categories/tree', categoryCtrl.getCategoryTree);
// 获取分类详情
router.get('/categories/:id', categoryCtrl.getCategoryById);
// 创建分类
router.post('/categories', categoryCtrl.createCategory);
// 更新分类
router.put('/categories/:id', categoryCtrl.updateCategory);
// 删除分类
router.delete('/categories/:id', categoryCtrl.deleteCategory);
// 更新分类状态
router.patch('/categories/:id/status', categoryCtrl.updateCategoryStatus);

// 品牌管理路由
// 获取品牌列表
router.get('/brands', brandCtrl.getBrands);
// 获取所有启用的品牌
router.get('/brands/all', brandCtrl.getAllBrands);
// 获取品牌详情
router.get('/brands/:id', brandCtrl.getBrandById);
// 创建品牌
router.post('/brands', brandCtrl.createBrand);
// 更新品牌
router.put('/brands/:id', brandCtrl.updateBrand);
// 删除品牌
router.delete('/brands/:id', brandCtrl.deleteBrand);
// 批量删除品牌
router.post('/brands/batch-delete', brandCtrl.batchDeleteBrands);
// 更新品牌状态
router.patch('/brands/:id/status', brandCtrl.updateBrandStatus);
// 获取品牌统计
router.get('/brands-stats', brandCtrl.getBrandStats);

module.exports = router; 
