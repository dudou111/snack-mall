const Product = require('../model/Product');
const Category = require('../model/Category');
const Brand = require('../model/Brand');

const isAdminUser = (user) => Boolean(user && (user.isAdmin || user.role === 'admin'));
const isMerchantUser = (user) => Boolean(user && user.role === 'merchant');

// 获取商品列表
const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 10,
            keyword = '',
            category = '',
            brand = '',
            status = '',
            minPrice = '',
            maxPrice = '',
            sortBy = 'createTime',
            sortOrder = 'desc'
        } = req.query;

        // 构建查询条件
        const query = {};
        
        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { tags: { $in: [new RegExp(keyword, 'i')] } }
            ];
        }
        
        if (category) {
            query.category = category;
        }
        
        if (brand) {
            query.brand = brand;
        }
        
        if (status) {
            query.status = status;
        }
        
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // 排序
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // 分页
        const skip = (page - 1) * pageSize;
        const limit = parseInt(pageSize);

        // 查询数据
        const products = await Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        // 获取总数
        const total = await Product.countDocuments(query);

        res.json({
            code: 0,
            message: '获取商品列表成功',
            data: {
                list: products,
                total,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        console.error('获取商品列表失败:', error);
        res.json({
            code: 1,
            message: '获取商品列表失败'
        });
    }
};

// 获取商品详情
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        
        if (!product) {
            return res.json({
                code: 1,
                message: '商品不存在'
            });
        }

        res.json({
            code: 0,
            message: '获取商品详情成功',
            data: product
        });
    } catch (error) {
        console.error('获取商品详情失败:', error);
        res.json({
            code: 1,
            message: '获取商品详情失败'
        });
    }
};

// 创建商品
const createProduct = async (req, res) => {
    try {
        const productData = { ...req.body };
        const operator = req.userInfo;
        const role = operator?.role || (operator?.isAdmin ? 'admin' : 'system');

        if (!operator) {
            return res.json({
                code: 1,
                message: '请先登录后再上传商品'
            });
        }

        if (!isAdminUser(operator) && !isMerchantUser(operator)) {
            return res.json({
                code: 1,
                message: '当前角色无权上传商品'
            });
        }
        
        // 验证必填字段
        if (!productData.name || !productData.category || !productData.brand || !productData.price) {
            return res.json({
                code: 1,
                message: '商品名称、分类、品牌和价格为必填项'
            });
        }

        // 检查商品名称是否已存在
        const duplicateFilter = { name: productData.name };
        if (isMerchantUser(operator)) {
            duplicateFilter.merchantId = operator._id;
        }
        const existingProduct = await Product.findOne(duplicateFilter);
        if (existingProduct) {
            return res.json({
                code: 1,
                message: '商品名称已存在'
            });
        }

        productData.merchantId = req.userInfo?._id || null;

        productData.createdByRole = role;
        productData.uploadTime = new Date();
        productData.lastModifiedBy = operator._id;
        productData.lastModifiedTime = new Date();

        // 创建商品
        const product = new Product(productData);
        await product.save();

        // 更新分类商品数量
        await updateCategoryProductCount(productData.category);
        
        // 更新品牌商品数量
        await updateBrandProductCount(productData.brand);

        res.json({
            code: 0,
            message: '创建商品成功',
            data: product
        });
    } catch (error) {
        console.error('创建商品失败:', error);
        res.json({
            code: 1,
            message: '创建商品失败'
        });
    }
};

// 更新商品
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        const operator = req.userInfo;

        if (!operator) {
            return res.json({
                code: 1,
                message: '请先登录后再编辑商品'
            });
        }

        // 检查商品是否存在
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.json({
                code: 1,
                message: '商品不存在'
            });
        }

        if (isMerchantUser(operator) && String(existingProduct.merchantId) !== String(operator._id)) {
            return res.json({
                code: 1,
                message: '无权修改其他商家的商品'
            });
        }

        if (isMerchantUser(operator)) {
            delete updateData.merchantId;
            delete updateData.createdByRole;
        }

        // 如果修改了商品名称，检查是否重复
        if (updateData.name && updateData.name !== existingProduct.name) {
            const duplicateProduct = await Product.findOne({ 
                name: updateData.name,
                _id: { $ne: id }
            });
            if (duplicateProduct) {
                return res.json({
                    code: 1,
                    message: '商品名称已存在'
                });
            }
        }

        // 记录原分类和品牌
        const oldCategory = existingProduct.category;
        const oldBrand = existingProduct.brand;

        // 更新商品
        const product = await Product.findByIdAndUpdate(
            id,
            {
                ...updateData,
                updateTime: new Date(),
                lastModifiedBy: operator._id,
                lastModifiedTime: new Date()
            },
            { new: true }
        );

        // 如果分类发生变化，更新相关分类的商品数量
        if (updateData.category && updateData.category !== oldCategory) {
            await updateCategoryProductCount(oldCategory);
            await updateCategoryProductCount(updateData.category);
        }

        // 如果品牌发生变化，更新相关品牌的商品数量
        if (updateData.brand && updateData.brand !== oldBrand) {
            await updateBrandProductCount(oldBrand);
            await updateBrandProductCount(updateData.brand);
        }

        res.json({
            code: 0,
            message: '更新商品成功',
            data: product
        });
    } catch (error) {
        console.error('更新商品失败:', error);
        res.json({
            code: 1,
            message: '更新商品失败'
        });
    }
};

// 删除商品
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const operator = req.userInfo;

        if (!operator) {
            return res.json({
                code: 1,
                message: '请先登录后再删除商品'
            });
        }

        // 检查商品是否存在
        const product = await Product.findById(id);
        if (!product) {
            return res.json({
                code: 1,
                message: '商品不存在'
            });
        }

        if (isMerchantUser(operator) && String(product.merchantId) !== String(operator._id)) {
            return res.json({
                code: 1,
                message: '无权删除其他商家的商品'
            });
        }

        // 删除商品
        await Product.findByIdAndDelete(id);

        // 更新分类商品数量
        await updateCategoryProductCount(product.category);
        
        // 更新品牌商品数量
        await updateBrandProductCount(product.brand);

        res.json({
            code: 0,
            message: '删除商品成功'
        });
    } catch (error) {
        console.error('删除商品失败:', error);
        res.json({
            code: 1,
            message: '删除商品失败'
        });
    }
};

// 批量删除商品
const batchDeleteProducts = async (req, res) => {
    try {
        const { ids } = req.body;
        const operator = req.userInfo;

        if (!operator) {
            return res.json({
                code: 1,
                message: '请先登录后再删除商品'
            });
        }

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.json({
                code: 1,
                message: '请选择要删除的商品'
            });
        }

        // 获取要删除的商品信息
        const products = await Product.find({ _id: { $in: ids } });

        if (isMerchantUser(operator)) {
            const hasForbiddenProduct = products.some(product => String(product.merchantId) !== String(operator._id));
            if (hasForbiddenProduct) {
                return res.json({
                    code: 1,
                    message: '批量删除中包含非本商家商品，操作已拒绝'
                });
            }
        }
        
        // 删除商品
        await Product.deleteMany({ _id: { $in: ids } });

        // 更新相关分类和品牌的商品数量
        const categories = [...new Set(products.map(p => p.category))];
        const brands = [...new Set(products.map(p => p.brand))];

        for (const category of categories) {
            await updateCategoryProductCount(category);
        }

        for (const brand of brands) {
            await updateBrandProductCount(brand);
        }

        res.json({
            code: 0,
            message: `成功删除 ${products.length} 个商品`
        });
    } catch (error) {
        console.error('批量删除商品失败:', error);
        res.json({
            code: 1,
            message: '批量删除商品失败'
        });
    }
};

// 更新商品状态
const updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const operator = req.userInfo;

        if (!operator) {
            return res.json({
                code: 1,
                message: '请先登录后再更新商品状态'
            });
        }

        if (!['上架', '下架', '缺货'].includes(status)) {
            return res.json({
                code: 1,
                message: '无效的商品状态'
            });
        }

        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.json({
                code: 1,
                message: '商品不存在'
            });
        }

        if (isMerchantUser(operator) && String(existingProduct.merchantId) !== String(operator._id)) {
            return res.json({
                code: 1,
                message: '无权修改其他商家的商品状态'
            });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            {
                status,
                updateTime: new Date(),
                lastModifiedBy: operator._id,
                lastModifiedTime: new Date()
            },
            { new: true }
        );

        res.json({
            code: 0,
            message: '更新商品状态成功',
            data: product
        });
    } catch (error) {
        console.error('更新商品状态失败:', error);
        res.json({
            code: 1,
            message: '更新商品状态失败'
        });
    }
};

// 获取商家上传记录
const getUploadRecords = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 10,
            merchantId,
            status,
            keyword,
            startDate,
            endDate
        } = req.query;

        const operator = req.userInfo;
        if (!operator) {
            return res.json({
                code: 1,
                message: '请先登录后再查询上传记录'
            });
        }

        const filter = {};

        if (isMerchantUser(operator)) {
            filter.merchantId = operator._id;
        } else if (merchantId) {
            filter.merchantId = merchantId;
        }

        if (status) {
            filter.status = status;
        }

        if (keyword) {
            filter.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { sku: { $regex: keyword, $options: 'i' } },
                { brand: { $regex: keyword, $options: 'i' } },
                { category: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (startDate || endDate) {
            filter.uploadTime = {};
            if (startDate) filter.uploadTime.$gte = new Date(startDate);
            if (endDate) filter.uploadTime.$lte = new Date(endDate + ' 23:59:59');
        }

        const skip = (Number(page) - 1) * Number(pageSize);
        const limit = Number(pageSize);

        const list = await Product.find(filter)
            .sort({ uploadTime: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(filter);

        res.json({
            code: 0,
            message: '获取商家上传记录成功',
            data: {
                list,
                pagination: {
                    current: Number(page),
                    pageSize: Number(pageSize),
                    total,
                    pages: Math.ceil(total / Number(pageSize))
                }
            }
        });
    } catch (error) {
        console.error('获取商家上传记录失败:', error);
        res.json({
            code: 1,
            message: '获取商家上传记录失败'
        });
    }
};

// 获取商品统计信息
const getProductStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const onShelfProducts = await Product.countDocuments({ status: '上架' });
        const offShelfProducts = await Product.countDocuments({ status: '下架' });
        const outOfStockProducts = await Product.countDocuments({ status: '缺货' });
        const lowStockProducts = await Product.countDocuments({
            $expr: { $lte: ['$stock', '$minStock'] }
        });

        res.json({
            code: 0,
            message: '获取商品统计成功',
            data: {
                totalProducts,
                onShelfProducts,
                offShelfProducts,
                outOfStockProducts,
                lowStockProducts
            }
        });
    } catch (error) {
        console.error('获取商品统计失败:', error);
        res.json({
            code: 1,
            message: '获取商品统计失败'
        });
    }
};

// 更新分类商品数量
const updateCategoryProductCount = async (categoryName) => {
    try {
        const count = await Product.countDocuments({ category: categoryName });
        await Category.findOneAndUpdate(
            { name: categoryName },
            { productCount: count },
            { upsert: true }
        );
    } catch (error) {
        console.error('更新分类商品数量失败:', error);
    }
};

// 更新品牌商品数量
const updateBrandProductCount = async (brandName) => {
    try {
        const count = await Product.countDocuments({ brand: brandName });
        await Brand.findOneAndUpdate(
            { name: brandName },
            { productCount: count },
            { upsert: true }
        );
    } catch (error) {
        console.error('更新品牌商品数量失败:', error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    batchDeleteProducts,
    updateProductStatus,
    getProductStats,
    getUploadRecords
}; 
