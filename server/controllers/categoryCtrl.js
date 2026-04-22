const Category = require('../model/Category');
const Product = require('../model/Product');

// 获取分类列表
const getCategories = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 10,
            keyword = '',
            status = '',
            parentId = '',
            level = ''
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
        
        if (parentId) {
            query.parentId = parentId === 'null' ? null : parentId;
        }
        
        if (level) {
            query.level = parseInt(level);
        }

        // 分页
        const skip = (page - 1) * pageSize;
        const limit = parseInt(pageSize);

        // 查询数据
        const categories = await Category.find(query)
            .sort({ sort: 1, createTime: -1 })
            .skip(skip)
            .limit(limit)
            .populate('parentId', 'name');

        // 获取总数
        const total = await Category.countDocuments(query);

        res.json({
            code: 0,
            message: '获取分类列表成功',
            data: {
                list: categories,
                total,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        console.error('获取分类列表失败:', error);
        res.json({
            code: 1,
            message: '获取分类列表失败'
        });
    }
};

// 获取所有分类（树形结构）
const getCategoryTree = async (req, res) => {
    try {
        const categories = await Category.find({ status: '启用' })
            .sort({ sort: 1, createTime: -1 });

        // 构建树形结构
        const tree = buildCategoryTree(categories);

        res.json({
            code: 0,
            message: '获取分类树成功',
            data: tree
        });
    } catch (error) {
        console.error('获取分类树失败:', error);
        res.json({
            code: 1,
            message: '获取分类树失败'
        });
    }
};

// 获取分类详情
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id).populate('parentId', 'name');
        
        if (!category) {
            return res.json({
                code: 1,
                message: '分类不存在'
            });
        }

        res.json({
            code: 0,
            message: '获取分类详情成功',
            data: category
        });
    } catch (error) {
        console.error('获取分类详情失败:', error);
        res.json({
            code: 1,
            message: '获取分类详情失败'
        });
    }
};

// 创建分类
const createCategory = async (req, res) => {
    try {
        const categoryData = req.body;
        
        // 验证必填字段
        if (!categoryData.name) {
            return res.json({
                code: 1,
                message: '分类名称为必填项'
            });
        }

        // 检查分类名称是否已存在
        const existingCategory = await Category.findOne({ name: categoryData.name });
        if (existingCategory) {
            return res.json({
                code: 1,
                message: '分类名称已存在'
            });
        }

        // 如果有父分类，验证父分类是否存在并设置级别
        if (categoryData.parentId) {
            const parentCategory = await Category.findById(categoryData.parentId);
            if (!parentCategory) {
                return res.json({
                    code: 1,
                    message: '父分类不存在'
                });
            }
            categoryData.level = parentCategory.level + 1;
        } else {
            categoryData.level = 1;
            categoryData.parentId = null;
        }

        // 创建分类
        const category = new Category(categoryData);
        await category.save();

        res.json({
            code: 0,
            message: '创建分类成功',
            data: category
        });
    } catch (error) {
        console.error('创建分类失败:', error);
        res.json({
            code: 1,
            message: '创建分类失败'
        });
    }
};

// 更新分类
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // 检查分类是否存在
        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
            return res.json({
                code: 1,
                message: '分类不存在'
            });
        }

        // 如果修改了分类名称，检查是否重复
        if (updateData.name && updateData.name !== existingCategory.name) {
            const duplicateCategory = await Category.findOne({ 
                name: updateData.name,
                _id: { $ne: id }
            });
            if (duplicateCategory) {
                return res.json({
                    code: 1,
                    message: '分类名称已存在'
                });
            }
        }

        // 如果修改了父分类
        if (updateData.parentId !== undefined) {
            if (updateData.parentId) {
                // 检查父分类是否存在
                const parentCategory = await Category.findById(updateData.parentId);
                if (!parentCategory) {
                    return res.json({
                        code: 1,
                        message: '父分类不存在'
                    });
                }
                
                // 检查是否会形成循环引用
                if (await isCircularReference(id, updateData.parentId)) {
                    return res.json({
                        code: 1,
                        message: '不能将分类设置为自己的子分类'
                    });
                }
                
                updateData.level = parentCategory.level + 1;
            } else {
                updateData.level = 1;
                updateData.parentId = null;
            }
        }

        // 更新分类
        const category = await Category.findByIdAndUpdate(
            id,
            { ...updateData, updateTime: new Date() },
            { new: true }
        );

        res.json({
            code: 0,
            message: '更新分类成功',
            data: category
        });
    } catch (error) {
        console.error('更新分类失败:', error);
        res.json({
            code: 1,
            message: '更新分类失败'
        });
    }
};

// 删除分类
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // 检查分类是否存在
        const category = await Category.findById(id);
        if (!category) {
            return res.json({
                code: 1,
                message: '分类不存在'
            });
        }

        // 检查是否有子分类
        const childCategories = await Category.find({ parentId: id });
        if (childCategories.length > 0) {
            return res.json({
                code: 1,
                message: '该分类下还有子分类，无法删除'
            });
        }

        // 检查是否有商品使用该分类
        const productsCount = await Product.countDocuments({ category: category.name });
        if (productsCount > 0) {
            return res.json({
                code: 1,
                message: `该分类下还有 ${productsCount} 个商品，无法删除`
            });
        }

        // 删除分类
        await Category.findByIdAndDelete(id);

        res.json({
            code: 0,
            message: '删除分类成功'
        });
    } catch (error) {
        console.error('删除分类失败:', error);
        res.json({
            code: 1,
            message: '删除分类失败'
        });
    }
};

// 更新分类状态
const updateCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['启用', '禁用'].includes(status)) {
            return res.json({
                code: 1,
                message: '无效的分类状态'
            });
        }

        const category = await Category.findByIdAndUpdate(
            id,
            { status, updateTime: new Date() },
            { new: true }
        );

        if (!category) {
            return res.json({
                code: 1,
                message: '分类不存在'
            });
        }

        res.json({
            code: 0,
            message: '更新分类状态成功',
            data: category
        });
    } catch (error) {
        console.error('更新分类状态失败:', error);
        res.json({
            code: 1,
            message: '更新分类状态失败'
        });
    }
};

// 构建分类树
const buildCategoryTree = (categories, parentId = null) => {
    const tree = [];
    
    categories.forEach(category => {
        if (String(category.parentId) === String(parentId)) {
            const children = buildCategoryTree(categories, category._id);
            const categoryObj = category.toObject();
            if (children.length > 0) {
                categoryObj.children = children;
            }
            tree.push(categoryObj);
        }
    });
    
    return tree;
};

// 检查是否会形成循环引用
const isCircularReference = async (categoryId, parentId) => {
    if (categoryId === parentId) {
        return true;
    }
    
    const parent = await Category.findById(parentId);
    if (!parent || !parent.parentId) {
        return false;
    }
    
    return await isCircularReference(categoryId, parent.parentId);
};

module.exports = {
    getCategories,
    getCategoryTree,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    updateCategoryStatus
}; 