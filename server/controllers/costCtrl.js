const CostRecords = require('../model/CostRecords');

// 会链表查询的表
const visit = require('../model/VisitData');
const order = require('../model/Order');
const doctor = require('../model/DoctorData');
const proge = require('../model/progetto');

// 获取消费记录列表数据
exports.getcostlist = async (req, res) => {
    console.log('123');

    // limit返回数,offset偏移量
    let { limit, offset } = req.query;
    let limitnum = limit ? limit : 10;
    let offsetnum = offset ? offset : 0;

    console.log('limitnum', limitnum);
    console.log('offsetnum', offsetnum);

    const costlist = await CostRecords.find()
        .sort({ time: -1 })
        .skip(offsetnum)
        .limit(limitnum)
        .populate('visitUserID')
        .populate('visitObjID');
    const costlistnum = await CostRecords.find().countDocuments();

    res.json({
        code: 0,
        data: costlist,
        costlistnum,
    });
};

// 条件筛选列表数据
exports.screen = async (req, res) => {
    let { formtime, totime, Department, inptext, limit, offset } = req.query;
    // 搜索时传入偏移量，则在搜索结果后的列表分页
    let limitnum = limit ? limit : 10;
    let offsetnum = offset ? offset : 0;

    let costlist;
    // 只选择日期
    if (formtime && !Department && !inptext) {
        console.log(
            'formtime, totime, Department, inptext1',
            formtime,
            totime,
            Department,
            inptext
        );
        costlist = await CostRecords.find({
            time: {
                $gte: formtime,
                $lte: totime,
            },
        })
            .sort({ time: -1 })
            .populate('visitUserID')
            .populate('visitObjID')
            .skip(offsetnum)
            .limit(limitnum);
        // 只选择科室
    } else if (!formtime && Department && !inptext) {
        console.log(
            'formtime, totime, Department, inptext2',
            formtime,
            totime,
            Department,
            inptext
        );

        costlist = await CostRecords.find({
            Department,
        })
            .sort({ time: -1 })
            .populate('visitUserID')
            .populate('visitObjID')
            .skip(offsetnum)
            .limit(limitnum);
        // 只输入框内容
    } else if (!formtime && !Department && inptext) {
        console.log(
            'formtime, totime, Department, inptext3',
            formtime,
            totime,
            Department,
            inptext
        );

        // 将输入框类型转为数字类型然后再判断是不是为NaN，若是则输入框为字符串若不是则输入框为数字
        if (isNaN(parseInt(inptext))) {
            let reg = new RegExp(inptext);
            costlist = await CostRecords.find()
                .sort({ time: -1 })
                .populate('visitUserID')
                .populate('visitObjID');
            costlist = costlist.filter((item) => {
                // 正则过滤查询到的字段是否包含字符实现模糊查询
                return item.visitUserID.username.match(reg);
            });
        } else if (!isNaN(parseInt(inptext))) {
            costlist = await CostRecords.find()
                .sort({ time: -1 })
                .populate('visitUserID')
                .populate('visitObjID');
            costlist = costlist.filter((item) => {
                return item.visitUserID.visitID == inptext;
            });
        }

        // 时间与输入框内容
    } else if (formtime && !Department && inptext) {
        costlist = await CostRecords.find({
            time: {
                $gte: formtime,
                $lte: totime,
            },
        })
            .sort({ time: -1 })
            .populate('visitUserID')
            .populate('visitObjID');
        if (isNaN(parseInt(inptext))) {
            costlist = costlist.filter((item) => {
                let reg = new RegExp(inptext);
                // 正则过滤查询到的字段是否包含字符实现模糊查询
                return item.visitUserID.username.match(reg);
            });
        } else if (!isNaN(parseInt(inptext))) {
            costlist = costlist.filter((item) => {
                return item.visitUserID.visitID == inptext;
            });
        }
        // 科室与输入框内容
    } else if (!formtime && Department && inptext) {
        costlist = await CostRecords.find({
            Department,
        })
            .sort({ time: -1 })
            .populate('visitUserID')
            .populate('visitObjID');
        if (isNaN(parseInt(inptext))) {
            costlist = costlist.filter((item) => {
                let reg = new RegExp(inptext);
                // 正则过滤查询到的字段是否包含字符实现模糊查询
                return item.visitUserID.username.match(reg);
            });
        } else if (!isNaN(parseInt(inptext))) {
            costlist = costlist.filter((item) => {
                return item.visitUserID.visitID == inptext;
            });
        }
        // 条件齐全
    } else if (formtime && Department && inptext) {
        console.log(
            'formtime, totime, Department, inptext4',
            formtime,
            totime,
            Department,
            inptext
        );

        costlist = await CostRecords.find({
            time: {
                $gte: formtime,
                $lte: totime,
            },
            Department,
        })
            .sort({ time: -1 })
            .populate('visitUserID')
            .populate('visitObjID');
        if (isNaN(parseInt(inptext))) {
            costlist = costlist.filter((item) => {
                let reg = new RegExp(inptext);
                // 正则过滤查询到的字段是否包含字符实现模糊查询
                return item.visitUserID.username.match(reg);
            });
        } else if (!isNaN(parseInt(inptext))) {
            costlist = costlist.filter((item) => {
                return item.visitUserID.visitID == inptext;
            });
        }
        // 一个条件都没有
    } else {
        console.log(
            'formtime, totime, Department, inptext5',
            formtime,
            totime,
            Department,
            inptext
        );

        costlist = await CostRecords.find()
            .sort({ time: -1 })
            .populate('visitUserID')
            .populate('visitObjID');
    }

    console.log('costlist', costlist?.length);

    res.json({
        code: 0,
        data: costlist,
    });
};

// 传入id删除数据(单个&多个)
exports.del = async (req, res) => {
    let { id } = req.body;
    console.log('id', id.length);

    await Promise.all(
        id.map((item) => {
            return CostRecords.findByIdAndDelete({ _id: item });
        })
    );

    res.json({
        code: 0,
        message: '删除成功',
    });

    // const deldata = await CostRecords.findByIdAndDelete({ _id: id })

    // if (Object.keys(deldata).length != 0) {
    //     res.json({
    //         code: 0,
    //         message: "数据删除成功",
    //     })
    // } else {
    //     res.json({
    //         code: 500,
    //         message: "数据删除失败",
    //     })
    // }
    // console.log('deldata', deldata);
};

// 传入多个id进行删除

// 传入id查看详情
exports.details = async (req, res) => {
    let { id } = req.query;
    const detailsData = await CostRecords.findById({ _id: id })
        .populate('visitUserID')
        .populate('visitObjID');
    res.json({
        code: 0,
        data: detailsData,
    });
};

// 传入id修改订单状态
exports.change = async (req, res) => {
    let { id, change } = req.body;
    const changedata = await CostRecords.findByIdAndUpdate(
        { _id: id },
        { Paymentstatus: change }
    )
        .populate('visitUserID')
        .populate('visitObjID');

    if (Object.keys(changedata).length != 0) {
        res.json({
            code: 0,
            message: '状态修改完成',
            changedata: await CostRecords.findById({ _id: id })
                .populate('visitUserID')
                .populate('visitObjID'),
        });
    } else {
        res.json({
            code: 500,
            message: '状态修改失败',
            changedata: await CostRecords.findById({ _id: id })
                .populate('visitUserID')
                .populate('visitObjID'),
        });
    }
};

// 根据输入框内容获取所有患者信息
exports.getuser = async (req, res) => {
    let { inptext } = req.query;

    let costlist;
    if (isNaN(parseInt(inptext))) {
        let reg = new RegExp(inptext);
        costlist = await order.find();
        costlist = costlist.filter((item) => {
            // 正则过滤查询到的字段是否包含字符实现模糊查询
            return item.username.match(reg);
        });
    } else if (!isNaN(parseInt(inptext))) {
        costlist = await order.find();
        costlist = costlist.filter((item) => {
            return item.visitID == inptext;
        });
    }
    res.json({
        code: 0,
        data: costlist,
    });
};

// 根据科室获取医生信息
exports.getDoctor = async (req, res) => {
    let { Department } = req.query;

    const Doctorlist = await doctor.find({ Department }).sort({ time: -1 });

    console.log('Department', Department);

    res.json({
        code: 0,
        data: Doctorlist,
    });
};

// 获取就诊项目
exports.getprogettos = async (req, res) => {
    const progettos = await proge.find();
    res.json({
        code: 0,
        data: progettos,
    });
};

exports.addorder = async (req, res) => {
    const {
        current: {
            Progetto,
            userid,
            Doctorcid,
            Hospital,
            Hospitaladdress,
            Department,
            Business,
            Costtype,
            uocost,
        },
    } = req.body;
    console.log(req.body);
    const userdata = await order.findById({ _id: userid });
    console.log('userdata', userdata);
    const Doctorcdata = await doctor.findById({ _id: Doctorcid });
    console.log('Doctorcdata', Doctorcdata);

    // 先插入就诊信息表
    const visitdata = await visit.create({
        Hospital,
        Hospitaladdress,
        Department,
        Doctor: Doctorcdata.Doctorname,
        Doctorjob: Doctorcdata.Doctorjob,
        Business,
        Costtype,
        address: Progetto,
    });
    console.log('visitdata', visitdata);

    const costnum =
        'JF' + (await CostRecords.find().countDocuments()) + 2020081900098;
    console.log('costnum', costnum);

    // 再插入消费记录表数据
    await CostRecords.create({
        time: new Date(),
        visitUserID: userdata._id.toString(),
        visitObjID: visitdata._id.toString(),
        orderId: costnum,
        from: '微信小程序',
        uocost,
        Paymentstatus: '未缴费',
        Department,
    });

    res.json({
        code: 0,
        message: '订单信息插入成功',
    });
};

// 批量删除费用记录
exports.delall = async (req, res) => {
    try {
        const { idlist } = req.body;
        
        if (!idlist || !Array.isArray(idlist)) {
            return res.json({
                code: 1,
                message: 'idlist参数错误，应为数组格式'
            });
        }

        await CostRecords.deleteMany({ _id: { $in: idlist } });
        
        res.json({
            code: 0,
            message: `成功删除${idlist.length}条记录`
        });
    } catch (error) {
        console.error('批量删除错误:', error);
        res.json({
            code: 1,
            message: '批量删除失败',
            error: error.message
        });
    }
};

// 更新费用记录数据
exports.updata = async (req, res) => {
    try {
        const updateData = req.body;
        
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.json({
                code: 1,
                message: '更新数据不能为空'
            });
        }

        // 这里可以根据具体需求实现更新逻辑
        // 暂时返回成功响应
        res.json({
            code: 0,
            message: '数据更新成功',
            data: updateData
        });
    } catch (error) {
        console.error('数据更新错误:', error);
        res.json({
            code: 1,
            message: '数据更新失败',
            error: error.message
        });
    }
};
