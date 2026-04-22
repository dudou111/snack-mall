import request from "./request";

// 根据任何选中条件筛选
export const requestByChioce = async (data: any) => await request.post("/api/booking/reservation/chioce", data)

// 删除数据(一条)
export const requestDeleteoneApi = async (id: any) => await request.post("/api/booking/reservation/deleteone", id)
// 删除数据(多条)
export const requestDeletemanyApi = async (id: any) => await request.post("/api/booking/reservation/deletemany", id)

// 保存挂号备注
export const requestTipsApi = async (data: any) => await request.post("/api/booking/reservation/tips", data)


