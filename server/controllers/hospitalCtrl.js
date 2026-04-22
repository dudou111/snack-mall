const Department = require('../model/Department');
const Notice = require('../model/Notice');
const HospitalInfo = require('../model/HospitalInfo');
const Feedback = require('../model/Feedback');

// ===== 科室管理 =====

// 获取科室列表
exports.getDepartments = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type, keyword } = req.query;
        const skip = (page - 1) * limit;
        
        let query = {};
        if (status) query.status = status;
        if (type) query.type = type;
        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { code: { $regex: keyword, $options: 'i' } },
                { director: { $regex: keyword, $options: 'i' } }
            ];
        }

        const departments = await Department.find(query)
            .sort({ sort: -1, createTime: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await Department.countDocuments(query);

        res.json({
            code: 0,
            message: '获取科室列表成功',
            data: {
                list: departments,
                total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('获取科室列表错误:', error);
        res.json({
            code: 1,
            message: '获取科室列表失败'
        });
    }
};

// 创建科室
exports.createDepartment = async (req, res) => {
    try {
        const { name, code, description, type, location, phone, director, status, sort } = req.body;
        
        // 检查科室代码是否已存在
        const existingDept = await Department.findOne({ code });
        if (existingDept) {
            return res.json({
                code: 1,
                message: '科室代码已存在'
            });
        }

        const department = await Department.create({
            name,
            code,
            description,
            type,
            location,
            phone,
            director,
            status,
            sort
        });

        res.json({
            code: 0,
            message: '创建科室成功',
            data: department
        });
    } catch (error) {
        console.error('创建科室错误:', error);
        res.json({
            code: 1,
            message: error.message || '创建科室失败'
        });
    }
};

// 更新科室
exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const department = await Department.findByIdAndUpdate(
            id,
            { ...updateData, updateTime: new Date() },
            { new: true }
        );

        if (!department) {
            return res.json({
                code: 1,
                message: '科室不存在'
            });
        }

        res.json({
            code: 0,
            message: '更新科室成功',
            data: department
        });
    } catch (error) {
        console.error('更新科室错误:', error);
        res.json({
            code: 1,
            message: '更新科室失败'
        });
    }
};

// 删除科室
exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const department = await Department.findByIdAndDelete(id);
        if (!department) {
            return res.json({
                code: 1,
                message: '科室不存在'
            });
        }

        res.json({
            code: 0,
            message: '删除科室成功'
        });
    } catch (error) {
        console.error('删除科室错误:', error);
        res.json({
            code: 1,
            message: '删除科室失败'
        });
    }
};

// 批量删除科室
exports.batchDeleteDepartments = async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.json({
                code: 1,
                message: '请选择要删除的科室'
            });
        }

        await Department.deleteMany({ _id: { $in: ids } });

        res.json({
            code: 0,
            message: `成功删除 ${ids.length} 个科室`
        });
    } catch (error) {
        console.error('批量删除科室错误:', error);
        res.json({
            code: 1,
            message: '批量删除科室失败'
        });
    }
};

// ===== 通知管理 =====

// 获取通知列表
exports.getNotices = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type, keyword } = req.query;
        const skip = (page - 1) * limit;
        
        let query = {};
        if (status) query.status = status;
        if (type) query.type = type;
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { content: { $regex: keyword, $options: 'i' } }
            ];
        }

        const notices = await Notice.find(query)
            .sort({ isPinned: -1, sort: -1, createTime: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await Notice.countDocuments(query);

        res.json({
            code: 0,
            message: '获取通知列表成功',
            data: {
                list: notices,
                total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('获取通知列表错误:', error);
        res.json({
            code: 1,
            message: '获取通知列表失败'
        });
    }
};

// 创建通知
exports.createNotice = async (req, res) => {
    try {
        const noticeData = req.body;
        
        // 如果状态是已发布，设置发布时间
        if (noticeData.status === 'published' && !noticeData.publishTime) {
            noticeData.publishTime = new Date();
        }

        const notice = await Notice.create(noticeData);

        res.json({
            code: 0,
            message: '创建通知成功',
            data: notice
        });
    } catch (error) {
        console.error('创建通知错误:', error);
        res.json({
            code: 1,
            message: error.message || '创建通知失败'
        });
    }
};

// 更新通知
exports.updateNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const notice = await Notice.findByIdAndUpdate(
            id,
            { ...updateData, updateTime: new Date() },
            { new: true }
        );

        if (!notice) {
            return res.json({
                code: 1,
                message: '通知不存在'
            });
        }

        res.json({
            code: 0,
            message: '更新通知成功',
            data: notice
        });
    } catch (error) {
        console.error('更新通知错误:', error);
        res.json({
            code: 1,
            message: '更新通知失败'
        });
    }
};

// 删除通知
exports.deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;
        
        const notice = await Notice.findByIdAndDelete(id);
        if (!notice) {
            return res.json({
                code: 1,
                message: '通知不存在'
            });
        }

        res.json({
            code: 0,
            message: '删除通知成功'
        });
    } catch (error) {
        console.error('删除通知错误:', error);
        res.json({
            code: 1,
            message: '删除通知失败'
        });
    }
};

// 批量删除通知
exports.batchDeleteNotices = async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.json({
                code: 1,
                message: '请选择要删除的通知'
            });
        }

        await Notice.deleteMany({ _id: { $in: ids } });

        res.json({
            code: 0,
            message: `成功删除 ${ids.length} 个通知`
        });
    } catch (error) {
        console.error('批量删除通知错误:', error);
        res.json({
            code: 1,
            message: '批量删除通知失败'
        });
    }
};

// 获取通知详情（增加阅读次数）
exports.getNoticeDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const notice = await Notice.findByIdAndUpdate(
            id,
            { $inc: { readCount: 1 } },
            { new: true }
        );

        if (!notice) {
            return res.json({
                code: 1,
                message: '通知不存在'
            });
        }

        res.json({
            code: 0,
            message: '获取通知详情成功',
            data: notice
        });
    } catch (error) {
        console.error('获取通知详情错误:', error);
        res.json({
            code: 1,
            message: '获取通知详情失败'
        });
    }
};

// ===== 医院信息管理 =====

// 获取医院信息列表
exports.getHospitalInfos = async (req, res) => {
    try {
        const { page = 1, limit = 10, type, status, keyword } = req.query;
        const skip = (page - 1) * limit;
        
        let query = {};
        if (type) query.type = type;
        if (status) query.status = status;
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { content: { $regex: keyword, $options: 'i' } }
            ];
        }

        const infos = await HospitalInfo.find(query)
            .sort({ isRecommended: -1, sort: -1, createTime: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await HospitalInfo.countDocuments(query);

        res.json({
            code: 0,
            message: '获取医院信息列表成功',
            data: {
                list: infos,
                total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('获取医院信息列表错误:', error);
        res.json({
            code: 1,
            message: '获取医院信息列表失败'
        });
    }
};

// 创建医院信息
exports.createHospitalInfo = async (req, res) => {
    try {
        const info = await HospitalInfo.create(req.body);

        res.json({
            code: 0,
            message: '创建医院信息成功',
            data: info
        });
    } catch (error) {
        console.error('创建医院信息错误:', error);
        res.json({
            code: 1,
            message: error.message || '创建医院信息失败'
        });
    }
};

// 更新医院信息
exports.updateHospitalInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const info = await HospitalInfo.findByIdAndUpdate(
            id,
            { ...updateData, updateTime: new Date() },
            { new: true }
        );

        if (!info) {
            return res.json({
                code: 1,
                message: '医院信息不存在'
            });
        }

        res.json({
            code: 0,
            message: '更新医院信息成功',
            data: info
        });
    } catch (error) {
        console.error('更新医院信息错误:', error);
        res.json({
            code: 1,
            message: '更新医院信息失败'
        });
    }
};

// 删除医院信息
exports.deleteHospitalInfo = async (req, res) => {
    try {
        const { id } = req.params;
        
        const info = await HospitalInfo.findByIdAndDelete(id);
        if (!info) {
            return res.json({
                code: 1,
                message: '医院信息不存在'
            });
        }

        res.json({
            code: 0,
            message: '删除医院信息成功'
        });
    } catch (error) {
        console.error('删除医院信息错误:', error);
        res.json({
            code: 1,
            message: '删除医院信息失败'
        });
    }
};

// 获取医院信息详情
exports.getHospitalInfoDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const info = await HospitalInfo.findByIdAndUpdate(
            id,
            { $inc: { viewCount: 1 } },
            { new: true }
        );

        if (!info) {
            return res.json({
                code: 1,
                message: '医院信息不存在'
            });
        }

        res.json({
            code: 0,
            message: '获取医院信息详情成功',
            data: info
        });
    } catch (error) {
        console.error('获取医院信息详情错误:', error);
        res.json({
            code: 1,
            message: '获取医院信息详情失败'
        });
    }
};

// ===== 反馈管理 =====

// 获取反馈列表
exports.getFeedbacks = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type, priority, keyword } = req.query;
        const skip = (page - 1) * limit;
        
        let query = {};
        if (status) query.status = status;
        if (type) query.type = type;
        if (priority) query.priority = priority;
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { content: { $regex: keyword, $options: 'i' } },
                { userName: { $regex: keyword, $options: 'i' } }
            ];
        }

        const feedbacks = await Feedback.find(query)
            .sort({ priority: -1, createTime: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await Feedback.countDocuments(query);

        res.json({
            code: 0,
            message: '获取反馈列表成功',
            data: {
                list: feedbacks,
                total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('获取反馈列表错误:', error);
        res.json({
            code: 1,
            message: '获取反馈列表失败'
        });
    }
};

// 创建反馈
exports.createFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.create(req.body);

        res.json({
            code: 0,
            message: '提交反馈成功',
            data: feedback
        });
    } catch (error) {
        console.error('创建反馈错误:', error);
        res.json({
            code: 1,
            message: error.message || '提交反馈失败'
        });
    }
};

// 更新反馈
exports.updateFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // 如果更新状态为已处理，设置处理时间
        if (updateData.status === 'resolved' && !updateData.handleTime) {
            updateData.handleTime = new Date();
        }
        
        const feedback = await Feedback.findByIdAndUpdate(
            id,
            { ...updateData, updateTime: new Date() },
            { new: true }
        );

        if (!feedback) {
            return res.json({
                code: 1,
                message: '反馈不存在'
            });
        }

        res.json({
            code: 0,
            message: '更新反馈成功',
            data: feedback
        });
    } catch (error) {
        console.error('更新反馈错误:', error);
        res.json({
            code: 1,
            message: '更新反馈失败'
        });
    }
};

// 删除反馈
exports.deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        
        const feedback = await Feedback.findByIdAndDelete(id);
        if (!feedback) {
            return res.json({
                code: 1,
                message: '反馈不存在'
            });
        }

        res.json({
            code: 0,
            message: '删除反馈成功'
        });
    } catch (error) {
        console.error('删除反馈错误:', error);
        res.json({
            code: 1,
            message: '删除反馈失败'
        });
    }
};

// 获取反馈详情
exports.getFeedbackDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.json({
                code: 1,
                message: '反馈不存在'
            });
        }

        res.json({
            code: 0,
            message: '获取反馈详情成功',
            data: feedback
        });
    } catch (error) {
        console.error('获取反馈详情错误:', error);
        res.json({
            code: 1,
            message: '获取反馈详情失败'
        });
    }
}; 