import { useLocation, Navigate } from 'react-router-dom';

// 仓库
import { useSelector, useDispatch } from 'react-redux';
import type { StoreState, StoreDispatch } from '../store';
// 仓库内异步任务
import { isLoginAction } from '../store/modules/user';

import { useEffect, useRef } from 'react';

function AutoRouter(props: { children: JSX.Element }) {
    const { pathname } = useLocation();
    // console.log(pathname);

    // 仓库状态
    const {
        user: { isLogin },
    } = useSelector((state: StoreState) => state);
    // 仓库任务
    const dispatch: StoreDispatch = useDispatch();

    // 获取token
    const token = localStorage.getItem('token');

    // 获取当前路径对应的路由配置
    // const route = matchRoutes(routes, location);

    //将isLogin存储在了loginRef.current中。
    const loginRef = useRef<boolean>(isLogin);
    useEffect(() => {
        loginRef.current = isLogin;
    }, [isLogin]);
    // 只有项目初始化并且第一次登录时验证token
    useEffect(() => {
        if (loginRef.current) {
            //验证token
            dispatch(isLoginAction());
        }
    }, [dispatch]);

    // 主动进入登录页面
    if (pathname === '/login') {
        return <Navigate to="/login" />;
        // 进入其他页面
    } else {
        // 有token先验证再进入
        if (token) {
            // 验证完token若token正常则进入
            if (isLogin) {
                return props.children;
                // token有问题
            } else {
                return <Navigate to="/login" />;
            }
        } else {
            // 没有token则进入登录页
            return <Navigate to="/login" />;
        }
    }
}

// }
export default AutoRouter;
