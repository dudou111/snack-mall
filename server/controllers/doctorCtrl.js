const DoctorData = require('../model/DoctorData');

// ===== 医生管理 CRUD 操作 =====

// 获取医生列表
exports.getDoctors = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, Department, Courtyardarea, keyword } = req.query;
        const skip = (page - 1) * limit;
        
        let query = {};
        if (status) query.status = status;
        if (Department) query.Department = Department;
        if (Courtyardarea) query.Courtyardarea = Courtyardarea;
        if (keyword) {
            query.$or = [
                { Doctorname: { $regex: keyword, $options: 'i' } },
                { Doctorcontent: { $regex: keyword, $options: 'i' } },
                { specialties: { $in: [new RegExp(keyword, 'i')] } }
            ];
        }

        const doctors = await DoctorData.find(query)
            .sort({ time: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await DoctorData.countDocuments(query);

        res.json({
            code: 0,
            message: '获取医生列表成功',
            data: {
                list: doctors,
                total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('获取医生列表错误:', error);
        res.json({
            code: 1,
            message: '获取医生列表失败'
        });
    }
};

// 获取医生详情
exports.getDoctorDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const doctor = await DoctorData.findById(id);
        if (!doctor) {
            return res.json({
                code: 1,
                message: '医生不存在'
            });
        }

        res.json({
            code: 0,
            message: '获取医生详情成功',
            data: doctor
        });
    } catch (error) {
        console.error('获取医生详情错误:', error);
        res.json({
            code: 1,
            message: '获取医生详情失败'
        });
    }
};

// 创建医生
exports.createDoctor = async (req, res) => {
    try {
        const doctorData = req.body;
        
        // 处理标签和擅长领域
        if (typeof doctorData.Tags === 'string') {
            doctorData.Tags = doctorData.Tags.split(',').map(tag => tag.trim()).filter(Boolean);
        }
        if (typeof doctorData.specialties === 'string') {
            doctorData.specialties = doctorData.specialties.split(',').map(spec => spec.trim()).filter(Boolean);
        }

        // 处理排班信息
        if (typeof doctorData.schedule === 'string') {
            try {
                doctorData.schedule = JSON.parse(doctorData.schedule);
            } catch (e) {
                console.warn('排班信息解析失败，使用默认值');
                doctorData.schedule = {
                    monday: false,
                    tuesday: false,
                    wednesday: false,
                    thursday: false,
                    friday: false,
                    saturday: false,
                    sunday: false
                };
            }
        }

        // 确保排班信息有正确的结构
        if (doctorData.schedule && typeof doctorData.schedule === 'object') {
            const defaultSchedule = {
                monday: false,
                tuesday: false,
                wednesday: false,
                thursday: false,
                friday: false,
                saturday: false,
                sunday: false
            };
            doctorData.schedule = { ...defaultSchedule, ...doctorData.schedule };
        }

        // 处理avatar字段：确保只接受字符串或删除非字符串值
        if (doctorData.avatar !== undefined) {
            if (typeof doctorData.avatar !== 'string') {
                console.warn('检测到非字符串avatar值，已删除:', doctorData.avatar);
                delete doctorData.avatar; // 删除非字符串的avatar值，让Schema使用默认值
            }
        }

        // 如果有上传的头像文件
        if (req.file) {
            doctorData.avatar = `http://127.0.0.1:8088/${req.file.filename}`;
        }

        const doctor = await DoctorData.create(doctorData);

        res.json({
            code: 0,
            message: '创建医生成功',
            data: doctor
        });
    } catch (error) {
        console.error('创建医生错误:', error);
        
        // 处理验证错误
        if (error.name === 'ValidationError') {
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.json({
                code: 1,
                message: '医生数据验证失败',
                errors: errors
            });
        }
        
        res.json({
            code: 1,
            message: error.message || '创建医生失败'
        });
    }
};

// 更新医生
exports.updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // 处理标签和擅长领域
        if (typeof updateData.Tags === 'string') {
            updateData.Tags = updateData.Tags.split(',').map(tag => tag.trim()).filter(Boolean);
        }
        if (typeof updateData.specialties === 'string') {
            updateData.specialties = updateData.specialties.split(',').map(spec => spec.trim()).filter(Boolean);
        }

        // 处理排班信息
        if (typeof updateData.schedule === 'string') {
            try {
                updateData.schedule = JSON.parse(updateData.schedule);
            } catch (e) {
                console.warn('排班信息解析失败，跳过更新排班信息');
                delete updateData.schedule; // 如果解析失败，不更新排班信息
            }
        }

        // 确保排班信息有正确的结构
        if (updateData.schedule && typeof updateData.schedule === 'object') {
            const defaultSchedule = {
                monday: false,
                tuesday: false,
                wednesday: false,
                thursday: false,
                friday: false,
                saturday: false,
                sunday: false
            };
            updateData.schedule = { ...defaultSchedule, ...updateData.schedule };
        }

        // 处理avatar字段：确保只接受字符串或删除非字符串值
        if (updateData.avatar !== undefined) {
            if (typeof updateData.avatar !== 'string') {
                console.warn('检测到非字符串avatar值，已删除:', updateData.avatar);
                delete updateData.avatar; // 删除非字符串的avatar值，保持原有值不变
            }
        }

        // 如果有上传的头像文件
        if (req.file) {
            updateData.avatar = `http://127.0.0.1:8088/${req.file.filename}`;
        }

        updateData.updateTime = new Date();

        const doctor = await DoctorData.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!doctor) {
            return res.json({
                code: 1,
                message: '医生不存在'
            });
        }

        res.json({
            code: 0,
            message: '更新医生成功',
            data: doctor
        });
    } catch (error) {
        console.error('更新医生错误:', error);
        
        // 处理验证错误
        if (error.name === 'ValidationError') {
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.json({
                code: 1,
                message: '医生数据验证失败',
                errors: errors
            });
        }
        
        res.json({
            code: 1,
            message: '更新医生失败'
        });
    }
};

// 删除医生
exports.deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        
        const doctor = await DoctorData.findByIdAndDelete(id);
        if (!doctor) {
            return res.json({
                code: 1,
                message: '医生不存在'
            });
        }

        res.json({
            code: 0,
            message: '删除医生成功'
        });
    } catch (error) {
        console.error('删除医生错误:', error);
        res.json({
            code: 1,
            message: '删除医生失败'
        });
    }
};

// 批量删除医生
exports.batchDeleteDoctors = async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.json({
                code: 1,
                message: '请选择要删除的医生'
            });
        }

        await DoctorData.deleteMany({ _id: { $in: ids } });

        res.json({
            code: 0,
            message: `成功删除 ${ids.length} 位医生`
        });
    } catch (error) {
        console.error('批量删除医生错误:', error);
        res.json({
            code: 1,
            message: '批量删除医生失败'
        });
    }
};

// ===== 兼容性支持：保留原有接口 =====

// 获取所有医生信息 (兼容旧版本)
exports.getdoctorlist = async (req, res) => {
    let { limit, offset } = req.query;
    let limitnum = limit ? parseInt(limit) : 10;
    let offsetnum = offset ? parseInt(offset) : 0;
    let page = Math.floor(offsetnum / limitnum) + 1;

    // 重定向到新的接口
    req.query = { page, limit: limitnum };
    return exports.getDoctors(req, res);
};

// 筛选数据 (兼容旧版本)
exports.getscreen = async (req, res) => {
    let { Department, Doctorname, limit, offset } = req.body;
    let limitnum = limit ? parseInt(limit) : 10;
    let offsetnum = offset ? parseInt(offset) : 0;
    let page = Math.floor(offsetnum / limitnum) + 1;

    // 重定向到新的接口
    req.query = { 
        page, 
        limit: limitnum, 
        Department, 
        keyword: Doctorname 
    };
    return exports.getDoctors(req, res);
};

// 根据id数组删除 (兼容旧版本)
exports.delarr = async (req, res) => {
    let { id } = req.body;
    req.body = { ids: id };
    return exports.batchDeleteDoctors(req, res);
};

// 根据id编辑详情 (兼容旧版本)
exports.edit = async (req, res) => {
    let { id } = req.query;
    req.params = { id };
    return exports.getDoctorDetail(req, res);
};

// 新增 (兼容旧版本)
exports.add = async (req, res) => {
    let {
        name,
        adress,
        department,
        doctor,
        registrationfee,
        examinationfee,
        introduction,
        status,
        tags,
    } = req.body;

    // 转换为新格式
    req.body = {
        Doctorname: name,
        Courtyardarea: adress || '总院',
        Department: department?.replace(/[',]/g, '-') || '',
        Doctorjob: doctor || '医师',
        registrationFee: registrationfee || 0,
        Doctorcontent: introduction || '暂无简介',
        status: status || '在职',
        Tags: tags || ''
    };

    return exports.createDoctor(req, res);
};

// 修改 (兼容旧版本)
exports.change = async (req, res) => {
    let { changedata } = req.body;
    if (changedata && changedata._id) {
        req.params = { id: changedata._id };
        req.body = changedata;
        delete req.body._id;
        return exports.updateDoctor(req, res);
    } else {
        res.json({
            code: 1,
            message: '缺少必要参数'
        });
    }
};
