import request from './request';

// ===== 科室管理 API =====

// 获取科室列表
export const getDepartments = (params: any) => {
    return request.get('/api/hospital/departments', params);
};

// 创建科室
export const createDepartment = (data: any) => {
    return request.post('/api/hospital/departments', data);
};

// 更新科室
export const updateDepartment = (id: string, data: any) => {
    return request.post(`/api/hospital/departments/${id}`, data, { method: 'PUT' });
};

// 删除科室
export const deleteDepartment = (id: string) => {
    return request.post(`/api/hospital/departments/${id}`, {}, { method: 'DELETE' });
};

// 批量删除科室
export const batchDeleteDepartments = (ids: string[]) => {
    return request.post('/api/hospital/departments/batch', { ids }, { method: 'DELETE' });
};

// ===== 通知管理 API =====

// 获取通知列表
export const getNotices = (params: any) => {
    return request.get('/api/hospital/notices', params);
};

// 获取通知详情
export const getNoticeDetail = (id: string) => {
    return request.get(`/api/hospital/notices/${id}`);
};

// 创建通知
export const createNotice = (data: any) => {
    return request.post('/api/hospital/notices', data);
};

// 更新通知
export const updateNotice = (id: string, data: any) => {
    return request.post(`/api/hospital/notices/${id}`, data, { method: 'PUT' });
};

// 删除通知
export const deleteNotice = (id: string) => {
    return request.post(`/api/hospital/notices/${id}`, {}, { method: 'DELETE' });
};

// 批量删除通知
export const batchDeleteNotices = (ids: string[]) => {
    return request.post('/api/hospital/notices/batch', { ids }, { method: 'DELETE' });
};

// ===== 医院信息管理 API =====

// 获取医院信息列表
export const getHospitalInfos = (params: any) => {
    return request.get('/api/hospital/infos', params);
};

// 获取医院信息详情
export const getHospitalInfoDetail = (id: string) => {
    return request.get(`/api/hospital/infos/${id}`);
};

// 创建医院信息
export const createHospitalInfo = (data: any) => {
    return request.post('/api/hospital/infos', data);
};

// 更新医院信息
export const updateHospitalInfo = (id: string, data: any) => {
    return request.post(`/api/hospital/infos/${id}`, data, { method: 'PUT' });
};

// 删除医院信息
export const deleteHospitalInfo = (id: string) => {
    return request.post(`/api/hospital/infos/${id}`, {}, { method: 'DELETE' });
};

// ===== 反馈管理 API =====

// 获取反馈列表
export const getFeedbacks = (params: any) => {
    return request.get('/api/hospital/feedbacks', params);
};

// 获取反馈详情
export const getFeedbackDetail = (id: string) => {
    return request.get(`/api/hospital/feedbacks/${id}`);
};

// 创建反馈
export const createFeedback = (data: any) => {
    return request.post('/api/hospital/feedbacks', data, { uptoken: false });
};

// 更新反馈
export const updateFeedback = (id: string, data: any) => {
    return request.post(`/api/hospital/feedbacks/${id}`, data, { method: 'PUT' });
};

// 删除反馈
export const deleteFeedback = (id: string) => {
    return request.post(`/api/hospital/feedbacks/${id}`, {}, { method: 'DELETE' });
}; 