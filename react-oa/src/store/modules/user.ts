import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
// 封装的请求方法
import request from '../../api/request'

// 登录
export const toLoginAction: any = createAsyncThunk(
    'user/toLoginAction', 
    async (payload, { rejectWithValue }) => {
        try {
            const result = await request.post('/api/admin-auth/login', payload)
            // 只返回需要的数据，避免传递不可序列化的axios对象
            return {
                data: result.data,
                status: result.status
            }
        } catch (error: any) {
            return rejectWithValue({
                message: error.response?.data?.message || error.message || '登录请求失败'
            })
        }
    }
)

// 注册
export const toRegisterAction: any = createAsyncThunk(
    'user/toRegisterAction', 
    async (_payload, { rejectWithValue }) => {
        try {
            return {
                data: {
                    code: 1,
                    message: '后台管理端不开放注册，请使用管理员账号登录'
                },
                status: 200
            }
        } catch (error: any) {
            // 返回错误信息
            return rejectWithValue({
                message: error.response?.data?.message || error.message || '注册请求失败'
            })
        }
    }
)

// 验证登录
export const isLoginAction = createAsyncThunk(
    'user/isLoginAction', 
    async (_, { rejectWithValue }) => {
        try {
            const result = await request.get('/api/admin-auth/check_login')
            return {
                data: result.data,
                status: result.status
            }
        } catch (error: any) {
            return rejectWithValue({
                message: error.response?.data?.message || error.message || '验证登录失败'
            })
        }
    }
)

// 更改头像
export const changedata: any = createAsyncThunk(
    'user/changedata',
    async (payload, { rejectWithValue }) => {
        try {
            console.log('开始修改用户数据');
            const result = await request.post('/api/auth/changedata', payload)
            return {
                data: result.data,
                status: result.status
            }
        } catch (error: any) {
            return rejectWithValue({
                message: error.response?.data?.message || error.message || '修改用户数据失败'
            })
        }
    }
)

interface userInfo {
    isAdmin: boolean;
    tel: number;
    username: string;
    avatar: string;
    __v: number;
    _id: string;
    email?: string;
    status?: string;
    createTime?: string;
    lastLoginTime?: string;
}

const userSlice = createSlice({
    name: 'user',
    initialState: {
        userInfo: {} as userInfo | null,
        isLogin: !!localStorage.getItem('token'),
        loading: false,
        error: null as string | null
    },
    reducers: {
        // 清除错误
        clearError: (state) => {
            state.error = null;
        },
        // 登出
        logout: (state) => {
            state.userInfo = null;
            state.isLogin = false;
            localStorage.removeItem('token');
        }
    },
    extraReducers(build) {
        // 登录相关
        build.addCase(toLoginAction.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        build.addCase(toLoginAction.fulfilled, (state, action) => {
            state.loading = false;
            const code = action.payload.data?.code;

            if (code === 0) {
                const { data: { data: { userInfo, token } } } = action.payload;
                state.userInfo = userInfo;
                state.isLogin = true;
                localStorage.setItem('token', JSON.stringify(token));
            } else {
                state.userInfo = null;
                state.isLogin = false;
                state.error = action.payload.data?.message || '登录失败';
            }
        })
        build.addCase(toLoginAction.rejected, (state, action) => {
            state.loading = false;
            state.userInfo = null;
            state.isLogin = false;
            state.error = action.payload?.message || '登录请求失败';
        })

        // 注册相关
        build.addCase(toRegisterAction.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        build.addCase(toRegisterAction.fulfilled, (state, action) => {
            state.loading = false;
            const code = action.payload.data?.code;
            
            if (code === 0) {
                console.log('注册成功');
                state.error = null;
            } else {
                state.error = action.payload.data?.message || '注册失败';
                console.log('注册失败:', state.error);
            }
        })
        build.addCase(toRegisterAction.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || '注册请求失败';
            console.log('注册请求失败:', action.payload);
        })

        // 验证登录相关
        build.addCase(isLoginAction.fulfilled, (state, action) => {
            const code = action.payload.data?.code;

            if (code === 0) {
                const userInfo = action.payload.data.data;
                state.userInfo = userInfo;
                state.isLogin = true;
            } else {
                state.userInfo = null;
                state.isLogin = false;
                localStorage.removeItem('token');
            }
        })
        build.addCase(isLoginAction.rejected, (state) => {
            state.userInfo = null;
            state.isLogin = false;
            localStorage.removeItem('token');
        })

        // 修改用户数据相关
        build.addCase(changedata.fulfilled, (state, action) => {
            const code = action.payload.data?.code;
            if (code === 0) {
                console.log('修改成功', action.payload.data?.changedata);
                state.userInfo = action.payload.data?.changedata;
            }
        })
    }
})

export const { clearError, logout } = userSlice.actions;
export default userSlice.reducer;

