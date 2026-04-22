import axios, { type AxiosRequestConfig } from "axios";
import { clearAuth, getToken } from "../auth/authStore";
import type { ApiResponse } from "../types";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8088";

const service = axios.create({
  baseURL,
  timeout: 12000
});

service.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

service.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error?.message || "网络请求失败";
    return Promise.reject(new Error(message));
  }
);

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await service.request<ApiResponse<T>>(config);
  const payload = response.data;

  if (payload.code !== 0) {
    if (payload.message.includes("重新登录") || payload.message.includes("认证")) {
      clearAuth();
    }
    throw new Error(payload.message || "请求失败");
  }

  return payload.data;
}
