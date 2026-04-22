import request from './request';

// 用户接口类型定义
export interface User {
  _id: string;
  username: string;
  email?: string;
  tel?: string;
  avatar: string;
  isAdmin: boolean;
  status: '启用' | '禁用' | '封禁';
  createTime: string;
  lastLoginTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  status?: string;
  isAdmin?: boolean;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  email?: string;
  tel?: string;
  isAdmin?: boolean;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  tel?: string;
  isAdmin?: boolean;
  status?: string;
}

// 获取用户列表
export const getUserList = (params: UserListParams) => {
  return request.get('/api/user/list', { params });
};

// 获取用户详情
export const getUserDetail = (id: string) => {
  return request.get(`/api/user/detail/${id}`);
};

// 创建用户
export const createUser = (data: CreateUserData) => {
  return request.post('/api/user/create', data);
};

// 更新用户信息
export const updateUser = (id: string, data: UpdateUserData) => {
  return request.put(`/api/user/${id}`, data);
};

// 重置用户密码
export const resetUserPassword = (id: string, newPassword: string) => {
  return request.patch(`/api/user/reset-password/${id}`, { newPassword });
};

// 更新用户状态
export const updateUserStatus = (id: string, status: string) => {
  return request.patch(`/api/user/status/${id}`, { status });
};

// 更新用户身份（VIP/普通用户）
export const updateUserRole = (id: string, isAdmin: boolean) => {
  return request.patch(`/api/user/role/${id}`, { isAdmin });
};

// 删除用户
export const deleteUser = (id: string) => {
  return request.delete(`/api/user/${id}`);
};

// 批量删除用户
export const batchDeleteUsers = (ids: string[]) => {
  return request.delete('/api/user/batch/delete', { data: { ids } });
};

// 获取用户统计
export const getUserStats = () => {
  return request.get('/api/user/stats');
}; 