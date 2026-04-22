import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { requestByDoctor, requestSearch, requestDel,requestEdit } from '@/api/doctor'

type DataType = {
  key: string
  Doctorname?: string
  avatar?: string
  Courtyardarea?: string
  Department?: string
  Doctorjob?: string
  Tags?: string[]
  Doctorcontent?: string
  [key: string]: any
}

// 获取数据
export const request: any = createAsyncThunk('reservation/requestByDoctor', async (payload) => {
  const result = await requestByDoctor(payload)
  return result
})

// 查询数据
export const request2: any = createAsyncThunk('reservation/requestSearch', async (payload) => {
  const result = await requestSearch(payload)
  return result
})

// 删除数据
export const request3: any = createAsyncThunk('reservation/requestDel', async (payload) => {
  const result = await requestDel(payload)
  return result
})

// 获取编辑数据
export const request4: any = createAsyncThunk('reservation/requestEdit', async (payload) => {
  const result = await requestEdit(payload)
  return result
})



const initialState = {
  dataSource: [] as DataType[],
  doctornum: 1,
  keydata:[],
  editdata:[]
}

const doctor = createSlice({
  name: 'doctor',
  initialState,
  reducers: {},
  extraReducers(build) {
    build.addCase(request.fulfilled, (state, action) => {
      state.dataSource = action.payload.data.data.map((x: any) => {
        return {
          key: x._id,
          Doctorname: x.Doctorname,
          avatar: x.avatar,
          Courtyardarea: x.Courtyardarea,
          Department: x.Department,
          Doctorjob: x.Doctorjob,
          Tags: x.Tags,
          Doctorcontent: x.Doctorcontent
        }
      })

      state.doctornum = action.payload.data.doctornum
    }),
      build.addCase(request2.fulfilled, (state, action) => {
        state.dataSource = action.payload.data.data.map((x:any)=>{
          return {
            key: x._id,
            Doctorname: x.Doctorname,
            avatar: x.avatar,
            Courtyardarea: x.Courtyardarea,
            Department: x.Department,
            Doctorjob: x.Doctorjob,
            Tags: x.Tags,
            Doctorcontent: x.Doctorcontent
          }
        })
      })
      build.addCase(request3.fulfilled, (state, action) => {
        state.dataSource = action.payload.data.data
      })
      build.addCase(request4.fulfilled, (state, action) => {
        state.editdata = action.payload.data.data
      })
  }
});

// export const {Change} = doctor.actions

export default doctor.reducer




