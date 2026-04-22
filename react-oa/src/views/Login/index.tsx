import './login.scss';

import { useEffect, useState } from 'react';
import { Button, Checkbox, Form, Input, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// 组件
import PasswordStrength from '../../components/PasswordStrength';

// 仓库
import { useDispatch, useSelector } from 'react-redux';
import type { StoreDispatch, StoreState } from '../../store';
// 仓库内异步任务
import { toLoginAction, clearError } from '../../store/modules/user';

const styles = {
    login: {
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};

interface loginData {
    username: string;
    password: string;
    remember?: boolean;
}

interface registerData {
    username: string;
    password: string;
    confirmPassword: string;
    tel?: string;
    email?: string;
}

const Login: React.FC = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [registerPassword, setRegisterPassword] = useState('');
    
    useEffect(() => {
        // 清除之前的登录状态
        localStorage.removeItem('token');
        // 清除Redux错误状态
        dispatch(clearError());
    }, []);

    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    // 仓库状态
    const { loading, error } = useSelector((state: StoreState) => state.user);

    // 仓库任务
    const dispatch: StoreDispatch = useDispatch();

    // 显示错误消息
    useEffect(() => {
        if (error) {
            messageApi.error(error);
            dispatch(clearError());
        }
    }, [error, messageApi, dispatch]);

    // 登录表单提交
    const onLoginFinish = async (values: loginData) => {
        try {
            const result = await dispatch(
                        toLoginAction({
                            username: values.username,
                            password: values.password,
                        })
            );

            // 检查登录结果
            if (result.payload?.data?.code === 0) {
                messageApi.success('登录成功！');
        setTimeout(() => {
                        navigate('/home');
                }, 1000);
            }
            // 错误信息已经通过Redux状态处理
        } catch (error) {
            console.error('登录错误:', error);
            messageApi.error('登录请求失败，请稍后重试');
        }
    };

    // 注册表单提交
    const onRegisterFinish = async (values: registerData) => {
        if (values.password !== values.confirmPassword) {
            messageApi.error('两次输入的密码不一致');
                return;
        }

        messageApi.warning('后台管理端不开放注册，请使用管理员账号登录');
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('表单验证失败:', errorInfo);
    };

    const [loginForm] = Form.useForm();
    const [registerForm] = Form.useForm();

    // 处理tab切换
    const handleTabChange = (key: string) => {
        setActiveTab(key);
        // 清空所有表单和状态
        loginForm.resetFields();
        registerForm.resetFields();
        setRegisterPassword('');
        // 清除错误状态
        dispatch(clearError());
    };

    const tabItems = [
        {
            key: 'login',
            label: '登录',
            children: (
                <Form
                    form={loginForm}
                    name="login"
                    labelCol={{ span: 0 }}
                    wrapperCol={{ span: 24 }}
                    style={{ maxWidth: 400 }}
                    initialValues={{ remember: true }}
                    onFinish={onLoginFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        name="username"
                        rules={[
                            { required: true, message: '请输入用户名!' },
                            { min: 2, message: '用户名至少2个字符' },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="用户名"
                            autoComplete="off"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: '请输入密码!' },
                            { min: 6, message: '密码至少6个字符' },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="密码"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        wrapperCol={{ span: 24 }}
                        name="remember"
                        valuePropName="checked"
                    >
                        <Checkbox>记住密码</Checkbox>
                        <Button
                            type="link"
                            htmlType="button"
                            style={{ float: 'right', padding: 0 }}
                        >
                            忘记密码？
                        </Button>
                    </Form.Item>

                    <Form.Item wrapperCol={{ span: 24 }}>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            block 
                            size="large"
                            loading={loading}
                        >
                            {loading ? '登录中...' : '登录'}
                        </Button>
                    </Form.Item>
                </Form>
            ),
        },
        {
            key: 'register',
            label: '注册',
            children: (
                <Form
                    form={registerForm}
                    name="register"
                    labelCol={{ span: 0 }}
                    wrapperCol={{ span: 24 }}
                    style={{ maxWidth: 400 }}
                    onFinish={onRegisterFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    {/* 注册提示信息 */}
                    <div style={{ 
                        marginBottom: 20, 
                        padding: 12, 
                        backgroundColor: '#e6f7ff', 
                        borderRadius: 8, 
                        fontSize: 13, 
                        color: '#1890ff',
                        border: '1px solid #91d5ff'
                    }}>
                        后台管理端不开放注册，请使用管理员账号登录。
                    </div>

                    <Form.Item
                        name="username"
                        rules={[
                            { required: true, message: '请输入用户名!' },
                            { min: 2, message: '用户名至少2个字符' },
                            { max: 20, message: '用户名最多20个字符' },
                            { 
                                pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, 
                                message: '用户名只能包含字母、数字、下划线和中文' 
                            },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="用户名"
                            autoComplete="off"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: '请输入密码!' },
                            { min: 6, message: '密码至少6个字符' },
                            { max: 20, message: '密码最多20个字符' },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="密码"
                            size="large"
                            onChange={(e) => setRegisterPassword(e.target.value)}
                        />
                    </Form.Item>
                    
                    {/* 密码强度显示 - 移到Form.Item外部 */}
                    <div style={{ marginBottom: 16, marginTop: -8 }}>
                        <PasswordStrength password={registerPassword} />
                    </div>

                    <Form.Item
                        name="confirmPassword"
                        rules={[
                            { required: true, message: '请确认密码!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次输入的密码不一致!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="确认密码"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="tel"
                        rules={[
                            {
                                pattern: /^1[3-9]\d{9}$/,
                                message: '请输入正确的手机号码',
                            },
                        ]}
                    >
                        <Input
                            prefix={<PhoneOutlined />}
                            placeholder="手机号码（可选）"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            {
                                type: 'email',
                                message: '请输入正确的邮箱地址',
                            },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="邮箱地址（可选）"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item wrapperCol={{ span: 24 }}>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            block 
                            size="large"
                            loading={loading}
                        >
                            {loading ? '注册中...' : '注册'}
                        </Button>
                    </Form.Item>
                </Form>
            ),
        },
    ];

    return (
        <div className="login_container" style={styles.login}>
            {contextHolder}
            <div className="login_panel">
                <div className="title_big">零食商城管理系统</div>
                <div className="title_sub">Snack Mall Management System</div>
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    centered
                    items={tabItems}
                    className="login_tabs"
                />
            </div>
        </div>
    );
};

export default Login;
