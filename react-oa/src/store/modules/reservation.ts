import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { requestByChioce } from '@/api/booking'

import moment from "moment";
moment.locale("zh-cn");

type DataType = {
    key?: string
    bookingDate?: string
    waitingTime?: string
    bookingTime?: string
    [key: string]: any
}

// 根据筛选条件请求数据
export const requestBySelected: any = createAsyncThunk('reservation/requestBySelected', async (payload) => {
    const result = await requestByChioce(payload)
    return result
})


const reservationSlice = createSlice({
    name: "reservation",
    initialState: {
        dataSource: [] as DataType[],
        PersonInfo: {} as DataType
    },
    reducers: {

    },
    extraReducers(build) {
        build.addCase(requestBySelected.fulfilled, (state, action) => {
            state.dataSource = action.payload.data.data.map((item: any) => {
                return {
                    ...item,
                    key: item._id,
                    bookingDate: moment(Number(item.bookingDate)).format(
                        "YYYY年MM月DD日"
                    ),
                    waitingTime: moment(Number(item.bookingDate)).format("H:mm"),
                    bookingTime: moment(Number(item.bookingDate)).format(
                        "YYYY-MM-DD H:mm"
                    ),
                }
            })
            // console.log(state.dataSource);
        })
    },
})

export default reservationSlice.reducer