import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import request from '../../../api/request'

// 获取数据(包括分页获取)
export const getcostlist: any = createAsyncThunk('cost/getcostlist', async (payload) => {
    const result = await request.get('/api/cost/getcostlist', payload)

    return result
})

// 条件筛选查询
export const screenlist: any = createAsyncThunk('cost/getscreenlist', async (payload) => {
    const result = await request.get('/api/cost/screen', payload)
    return result
})


// 传入id数组删除数据
export const deldata: any = createAsyncThunk('cost/deldata', async (payload, Slice) => {
    const result = await request.post('/api/cost/del', payload)
    const { data: { code } } = result
    const { dispatch } = Slice
    // 删除成功再次派发请求数据任务重新渲染
    if (code == 0) {
        dispatch(getcostlist())
    }
    return result
})

// 传入id查询详情
export const details: any = createAsyncThunk('cost/details', async (payload) => {
    const result = await request.get('/api/cost/details', payload)
    return result
})

// 传入id修改状态
export const change: any = createAsyncThunk('cost/change', async (payload) => {
    console.log('payload', payload);

    const result = await request.post('/api/cost/change', payload)
    return result
})




const costSlice = createSlice({
    name: 'cost',
    initialState: {
        costlist: [],
        costlistnum: 10,
        isdel: false,
        costdetails: {},
        ischange: false
    },
    reducers: {
        changeisdel(state) {
            state.isdel = false
        },
        changetest(state) {

            state.ischange = false
            console.log('xiugai', state.ischange);
        }
    },
    extraReducers(build) {
        // 列表数据
        build.addCase(getcostlist.fulfilled, (state, action) => {

            const code = action.payload.data?.code
            if (code == 0) {
                console.log('123', action.payload.data?.data);

                state.costlist = action.payload.data?.data.map((item: any) => {

                    let allprice: any = 0
                    item.visitObjID.address?.forEach((element: any) => {
                        allprice = allprice + element.total
                    });

                    return {
                        key: item._id,
                        id: item._id,
                        time: item.time,
                        orderId: item.orderId,
                        username: item.visitUserID.username,
                        visitID: item.visitUserID.visitID,
                        from: item.from,
                        Business: item.visitObjID.Business,
                        Costtype: item.visitObjID.Costtype,
                        uocost: item.uocost,
                        addresscost: allprice,
                        Paymentstatus: item.Paymentstatus,
                    }
                })
                state.costlistnum = action.payload.data?.costlistnum
                console.log('state.costlistnum', state.costlistnum);

            }

        })
        // 条件筛选
        build.addCase(screenlist.fulfilled, (state, action) => {
            const code = action.payload.data?.code
            if (code == 0) {
                console.log('screenlist123', action.payload.data?.data);

                state.costlist = action.payload.data?.data.map((item: any) => {

                    let allprice: any = 0
                    item.visitObjID.address?.forEach((element: any) => {
                        allprice = allprice + element.total
                    });

                    return {
                        key: item._id,
                        id: item._id,
                        time: item.time,
                        orderId: item.orderId,
                        username: item.visitUserID.username,
                        visitID: item.visitUserID.visitID,
                        from: item.from,
                        Business: item.visitObjID.Business,
                        Costtype: item.visitObjID.Costtype,
                        uocost: item.uocost,
                        addresscost: allprice,
                        Paymentstatus: item.Paymentstatus,
                    }
                })
                state.costlistnum = state.costlist.length

            }

        })
        // 删除单个
        build.addCase(deldata.fulfilled, (state, action) => {
            const code = action.payload.data?.code
            if (code == 0) {
                state.isdel = true
                console.log('仓库中切换', state.isdel);
            }
        })
        // 查询详情
        build.addCase(details.fulfilled, (state, action) => {
            const code = action.payload.data?.code
            // 查询到并存储到仓库
            if (code == 0) {
                state.costdetails = action.payload.data?.data
                // console.log('state.costdetails',state.costdetails);
            }
        })
        // 修改状态
        build.addCase(change.fulfilled, (state, action) => {
            const code = action.payload.data?.code
            if (code == 0) {
                // console.log('action.payload.data?.data ',action.payload.data?.changedata);
                state.costdetails = action.payload.data?.changedata
                state.ischange = true
            }
        })
    }
})

// 同步任务导出
export const { changeisdel, changetest } = costSlice.actions;



export default costSlice.reducer
