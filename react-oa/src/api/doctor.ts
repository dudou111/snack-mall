import request from "./request";

// ===== 现代化医生管理 API =====

// 获取医生列表
export const getDoctors = (params: any) => {
    return request.get('/api/doctor/list', params);
};

// 获取医生详情
export const getDoctorDetail = (id: string) => {
    return request.get(`/api/doctor/${id}`);
};

// 创建医生
export const createDoctor = (data: any) => {
    return request.post('/api/doctor', data);
};

// 更新医生
export const updateDoctor = (id: string, data: any) => {
    return request.put(`/api/doctor/${id}`, data);
};

// 删除医生
export const deleteDoctor = (id: string) => {
    return request.delete(`/api/doctor/${id}`);
};

// 批量删除医生
export const batchDeleteDoctors = (ids: string[]) => {
    return request.delete('/api/doctor/batch', { ids });
};

// ===== 兼容性支持：保留原有API =====

// 获取数据 (兼容旧版本)
export const requestByDoctor = async (data: any) => await request.get("/api/doctor/getdoctorlist", data);

// 查询数据 (兼容旧版本)
export const requestSearch = async (data: any) => await request.post("/api/doctor/screen", data);

// 删除数据 (兼容旧版本)
export const requestDel = async (id: any) => await request.post("/api/doctor/del", id);

// 获取编辑数据 (兼容旧版本)
export const requestEdit = async (id: any) => await request.get("/api/doctor/edit", id);


