import axios from "axios";

const isDev = process.env.NODE_ENV === "development";
const baseUrl = isDev ? "/api" : "/";
const axiosRequest = axios.create({
  baseURL: baseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

type RequestClient = {
  request<T = any>(config: any): Promise<T>;
  get<T = any>(url: string, config?: any): Promise<T>;
  post<T = any>(url: string, data?: any, config?: any): Promise<T>;
  put<T = any>(url: string, data?: any, config?: any): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: any): Promise<T>;
  delete<T = any>(url: string, config?: any): Promise<T>;
  interceptors: typeof axiosRequest.interceptors;
};

export const request = axiosRequest as unknown as RequestClient;

request.interceptors.request.use(
  (req) => {
    req.headers.authorization =
      "Bearer " + localStorage.getItem("ACCESS_TOKEN");
    return req;
  },
  (err) => {
    // err.message
    throw err;
  }
);

request.interceptors.response.use(
  (res) => {
    const { code } = res.data;
    if (code === 401) {
      // window.location.replace("/");
    }
    if (code !== 0) {
      // Message.error(res.data.message)
      throw new HttpError(
        res.data?.message || "网络错误！",
        Number(res.data.status)
      );
    }
    return res.data;
  },
  (err) => {
    const { response } = err;
    if (response && response.data) {
      const { code } = response.data;
      if (code === 401) {
        // window.location.replace("/");
      }
    }
    // err.message
    throw err;
  }
);

export const http = {
  post<T>(url: string, data?: any, config?: any) {
    return request.post(url, data, config) as Promise<T>; //使用范型,代码提示更简便
  },
  get<T>(url: string, config?: any) {
    return request.get(url, config) as Promise<T>; //使用范型,代码提示更简便
  },
};

class HttpError extends Error {
    code: number;
    constructor(message: string, code: number) {
        super(message);
        this.code = code;
    }
}
