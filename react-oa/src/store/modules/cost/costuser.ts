import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import request from '../../../api/request'

// 获取所有患者数据(包括分页获取)
export const getalluser: any = createAsyncThunk('cost/getalluser', async (payload) => {
    const result = await request.get('/api/cost/getalluser', payload)
    
    return result
})

// 根据科室获取医生信息
export const getDoctor: any  = createAsyncThunk('cost/getDoctor', async (payload) => {
    const result = await request.get('/api/cost/getDoctor', payload)
    return result
    
})

// 获取所有就诊项目
export const getprogettos: any = createAsyncThunk('cost/getprogettos',async (payload)=> {
    const result = await request.get('/api/cost/progettos', payload)
    return result
})


// 添加订单信息
export const addorder: any = createAsyncThunk('cost/addorder', async (payload) => {
    const result = await request.post('/api/cost/addorder', payload)
    return result
})


const costUserSlice = createSlice({
    name: 'cost',
    initialState: {
        userlist: [],
        Doctorlist: [],
        progettos: [],
        toadd:false,
        isadd:false,
        isaddstr:'',


    },
    reducers: {
        changetoadd(state) {
            state.toadd = !state.toadd
        }
        
    },
    extraReducers(build) {
        // 列表数据
        build.addCase(getalluser.fulfilled, (state,action) => {
            
            const code = action.payload.data?.code
            if (code == 0) {
                
                state.userlist = action.payload.data?.data.map((item:any) => {
                    return {
                        key:item._id,
                        id:item._id,
                        username: item.username,
                        avatar: item.avatar,
                        wxname: item.wxname,
                        tel: item.tel,
                        IDcardtype: item.IDcardtype,
                        IDcartnumber: item.IDcartnumber,
                        visitID: item.visitID,
                        address:item.address,
                        about: item.about,
                    }
                })
                console.log('state.userlist',state.userlist);
                
            }
            
        })
        build.addCase(getDoctor.fulfilled, (state, action) => {
            const code = action.payload.data?.code
            if (code == 0) {
                state.Doctorlist = action.payload.data?.data.map((item:any) => {
                    return {
                        key:item._id,
                        Doctorname: item.Doctorname,
                        avatar: item.avatar,
                        Courtyardarea: item.Courtyardarea,
                        Doctorjob: item.Doctorjob,
                        Department: item.Department,
                    }
                })
                console.log('state.Doctorlist',state.Doctorlist);
            }
            
        })
        build.addCase(getprogettos.fulfilled, (state, action) => {
            const code = action.payload.data?.code
            if (code == 0) {
                state.progettos = action.payload.data?.data.map((item: any) => {
                    return {
                        key: item._id,
                        ...item
                    }
                })
                console.log('action.payload.data',state.progettos);
            }
        })
        build.addCase(addorder.fulfilled, (state, action) => {
            const code = action.payload.data?.code

            if (code == 0) {
                state.isadd = true
                state.isaddstr = action.payload.data?.message
                console.log('插入成功');
            } else {
                state.isadd = false
                state.isaddstr = "插入失败"
            }
        })
    }
})

// 同步任务导出
export const { changetoadd } = costUserSlice.actions;



export default costUserSlice.reducer