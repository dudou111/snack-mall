const Brand = require('../model/Brand');
const Product = require('../model/Product');

// 获取品牌列表
const getBrands = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 10,
            keyword = '',
            status = ''
        } = req.query;

        // 构建查询条件
        const query = {};
        
        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }
        
        if (status) {
            query.status = status;
        }

        // 分页
        const skip = (page - 1) * pageSize;
        const limit = parseInt(pageSize);

        // 查询数据
        const brands = await Brand.find(query)
            .sort({ sort: 1, createTime: -1 })
            .skip(skip)
            .limit(limit);

        // 获取总数
        const total = await Brand.countDocuments(query);

        res.json({
            code: 0,
            message: '获取品牌列表成功',
            data: {
                list: brands,
                total,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        console.error('获取品牌列表失败:', error);
        res.json({
            code: 1,
            message: '获取品牌列表失败'
        });
    }
};

// 获取所有启用的品牌
const getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find({ status: '启用' })
            .sort({ sort: 1, createTime: -1 })
            .select('name logo');

        res.json({
            code: 0,
            message: '获取品牌列表成功',
            data: brands
        });
    } catch (error) {
        console.error('获取品牌列表失败:', error);
        res.json({
            code: 1,
            message: '获取品牌列表失败'
        });
    }
};

// 获取品牌详情
const getBrandById = async (req, res) => {
    try {
        const { id } = req.params;
        const brand = await Brand.findById(id);
        
        if (!brand) {
            return res.json({
                code: 1,
                message: '品牌不存在'
            });
        }

        res.json({
            code: 0,
            message: '获取品牌详情成功',
            data: brand
        });
    } catch (error) {
        console.error('获取品牌详情失败:', error);
        res.json({
            code: 1,
            message: '获取品牌详情失败'
        });
    }
};

// 创建品牌
const createBrand = async (req, res) => {
    try {
        const brandData = req.body;
        
        // 验证必填字段
        if (!brandData.name) {
            return res.json({
                code: 1,
                message: '品牌名称为必填项'
            });
        }

        // 检查品牌名称是否已存在
        const existingBrand = await Brand.findOne({ name: brandData.name });
        if (existingBrand) {
            return res.json({
                code: 1,
                message: '品牌名称已存在'
            });
        }

        // 创建品牌
        const brand = new Brand(brandData);
        await brand.save();

        res.json({
            code: 0,
            message: '创建品牌成功',
            data: brand
        });
    } catch (error) {
        console.error('创建品牌失败:', error);
        res.json({
            code: 1,
            message: '创建品牌失败'
        });
    }
};

// 更新品牌
const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // 检查品牌是否存在
        const existingBrand = await Brand.findById(id);
        if (!existingBrand) {
            return res.json({
                code: 1,
                message: '品牌不存在'
            });
        }

        // 如果修改了品牌名称，检查是否重复
        if (updateData.name && updateData.name !== existingBrand.name) {
            const duplicateBrand = await Brand.findOne({ 
                name: updateData.name,
                _id: { $ne: id }
            });
            if (duplicateBrand) {
                return res.json({
                    code: 1,
                    message: '品牌名称已存在'
                });
            }
        }

        // 更新品牌
        const brand = await Brand.findByIdAndUpdate(
            id,
            { ...updateData, updateTime: new Date() },
            { new: true }
        );

        // 如果品牌名称发生变化，需要更新相关商品的品牌信息
        if (updateData.name && updateData.name !== existingBrand.name) {
            await Product.updateMany(
                { brand: existingBrand.name },
                { brand: updateData.name }
            );
        }

        res.json({
            code: 0,
            message: '更新品牌成功',
            data: brand
        });
    } catch (error) {
        console.error('更新品牌失败:', error);
        res.json({
            code: 1,
            message: '更新品牌失败'
        });
    }
};

// 删除品牌
const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        // 检查品牌是否存在
        const brand = await Brand.findById(id);
        if (!brand) {
            return res.json({
                code: 1,
                message: '品牌不存在'
            });
        }

        // 检查是否有商品使用该品牌
        const productsCount = await Product.countDocuments({ brand: brand.name });
        if (productsCount > 0) {
            return res.json({
                code: 1,
                message: `该品牌下还有 ${productsCount} 个商品，无法删除`
            });
        }

        // 删除品牌
        await Brand.findByIdAndDelete(id);

        res.json({
            code: 0,
            message: '删除品牌成功'
        });
    } catch (error) {
        console.error('删除品牌失败:', error);
        res.json({
            code: 1,
            message: '删除品牌失败'
        });
    }
};

// 批量删除品牌
const batchDeleteBrands = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.json({
                code: 1,
                message: '请选择要删除的品牌'
            });
        }

        // 获取要删除的品牌信息
        const brands = await Brand.find({ _id: { $in: ids } });
        
        // 检查是否有商品使用这些品牌
        const brandNames = brands.map(b => b.name);
        const productsCount = await Product.countDocuments({ brand: { $in: brandNames } });
        
        if (productsCount > 0) {
            return res.json({
                code: 1,
                message: `选中的品牌下还有 ${productsCount} 个商品，无法删除`
            });
        }

        // 删除品牌
        await Brand.deleteMany({ _id: { $in: ids } });

        res.json({
            code: 0,
            message: `成功删除 ${brands.length} 个品牌`
        });
    } catch (error) {
        console.error('批量删除品牌失败:', error);
        res.json({
            code: 1,
            message: '批量删除品牌失败'
        });
    }
};

// 更新品牌状态
const updateBrandStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['启用', '禁用'].includes(status)) {
            return res.json({
                code: 1,
                message: '无效的品牌状态'
            });
        }

        const brand = await Brand.findByIdAndUpdate(
            id,
            { status, updateTime: new Date() },
            { new: true }
        );

        if (!brand) {
            return res.json({
                code: 1,
                message: '品牌不存在'
            });
        }

        res.json({
            code: 0,
            message: '更新品牌状态成功',
            data: brand
        });
    } catch (error) {
        console.error('更新品牌状态失败:', error);
        res.json({
            code: 1,
            message: '更新品牌状态失败'
        });
    }
};

// 获取品牌统计信息
const getBrandStats = async (req, res) => {
    try {
        const totalBrands = await Brand.countDocuments();
        const activeBrands = await Brand.countDocuments({ status: '启用' });
        const inactiveBrands = await Brand.countDocuments({ status: '禁用' });
        const recommendedBrands = await Brand.countDocuments({ isRecommended: true });

        res.json({
            code: 0,
            message: '获取品牌统计成功',
            data: {
                totalBrands,
                activeBrands,
                inactiveBrands,
                recommendedBrands
            }
        });
    } catch (error) {
        console.error('获取品牌统计失败:', error);
        res.json({
            code: 1,
            message: '获取品牌统计失败'
        });
    }
};

module.exports = {
    getBrands,
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
    batchDeleteBrands,
    updateBrandStatus,
    getBrandStats
}; 