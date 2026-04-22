import axios from "axios";

// 配置基础URL
const BASE_URL = 'http://127.0.0.1:8088';

// 创建axios实例
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10秒超时
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: false // 不带凭证，解决CORS问题
});

// 请求拦截器
axiosInstance.interceptors.request.use(
    (config) => {
        // 在发送请求之前做些什么
        console.log('📤 发送请求:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        // 对请求错误做些什么
        console.error('❌ 请求错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
    (response) => {
        // 对响应数据做点什么
        console.log('📥 收到响应:', response.status, response.data);
        return response;
    },
    (error) => {
        // 对响应错误做点什么
        console.error('❌ 响应错误:', error.response?.status, error.response?.data || error.message);
        
        // 处理常见错误
        if (error.response?.status === 401) {
            // 未授权，清除token并跳转到登录页
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        
        return Promise.reject(error);
    }
);

class Request {
    // 获取认证头
    private getAuthHeaders(uptoken: boolean = true) {
        return uptoken ? {
            'authorization': 'Bearer ' + JSON.parse(localStorage.getItem('token') || '""'),
        } : {};
    }

    async get(url: string, data: any = {}, config: any = {}) {
        const uptoken = (config.uptoken == undefined) ? true : config.uptoken

        // 调用axios的get请求
        const resdata = await axiosInstance.get(url, {
            params: data,
            headers: this.getAuthHeaders(uptoken),
            ...config
        });
        return resdata
    }

    async post(url: string, data: any = {}, config: any = {}) {
        const uptoken = (config.uptoken == undefined) ? true : config.uptoken
        
        // 检查是否需要使用其他HTTP方法
        const method = config.method || 'POST';
        delete config.method; // 移除method属性，避免传递给axios
        
        let headers = this.getAuthHeaders(uptoken);
        
        // 如果数据是FormData，不要设置Content-Type，让浏览器自动设置
        if (data instanceof FormData) {
            // 移除Content-Type，让浏览器自动设置multipart/form-data
            headers = { ...headers };
        }
        
        let resdata;
        switch (method.toUpperCase()) {
            case 'PUT':
                resdata = await axiosInstance.put(url, data, {
                    headers,
                    ...config
                });
                break;
            case 'DELETE':
                resdata = await axiosInstance.delete(url, {
                    data, // DELETE请求的数据放在data字段
                    headers,
                    ...config
                });
                break;
            case 'PATCH':
                resdata = await axiosInstance.patch(url, data, {
                    headers,
                    ...config
                });
                break;
            default: // POST
                resdata = await axiosInstance.post(url, data, {
                    headers,
                    ...config
                });
                break;
        }
        
        return resdata;
    }

    // 新增PUT方法
    async put(url: string, data: any = {}, config: any = {}) {
        const uptoken = (config.uptoken == undefined) ? true : config.uptoken
        
        let headers = this.getAuthHeaders(uptoken);
        
        // 如果数据是FormData，不要设置Content-Type
        if (data instanceof FormData) {
            headers = { ...headers };
        }
        
        const resdata = await axiosInstance.put(url, data, {
            headers,
            ...config
        });
        return resdata;
    }

    // 新增DELETE方法
    async delete(url: string, data: any = {}, config: any = {}) {
        const uptoken = (config.uptoken == undefined) ? true : config.uptoken
        
        const resdata = await axiosInstance.delete(url, {
            data,
            headers: this.getAuthHeaders(uptoken),
            ...config
        });
        return resdata;
    }

    // 新增PATCH方法
    async patch(url: string, data: any = {}, config: any = {}) {
        const uptoken = (config.uptoken == undefined) ? true : config.uptoken
        
        let headers = this.getAuthHeaders(uptoken);
        
        // 如果数据是FormData，不要设置Content-Type
        if (data instanceof FormData) {
            headers = { ...headers };
        }
        
        const resdata = await axiosInstance.patch(url, data, {
            headers,
            ...config
        });
        return resdata;
    }
}

const request = new Request();

export default request;
