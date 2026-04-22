import ReactDOM from 'react-dom/client';
// 样式初始化
import 'reset-css';

// UI框架的样式

// 全局样式
import '@/assets/styles/global.scss';

// 组件的样式
import App from './App.tsx';
// 路由
import { BrowserRouter as Router } from 'react-router-dom';

// 状态管理仓库
import { Provider } from 'react-redux';
import store from './store';

// 把antd配置成中文
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <Router>
            <ConfigProvider locale={zhCN}>
                <App />
            </ConfigProvider>
        </Router>
    </Provider>
);
