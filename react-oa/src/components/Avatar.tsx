import { UserOutlined } from '@ant-design/icons';
import { Avatar, Space, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { Link } from 'react-router-dom';


import {useSelector } from 'react-redux'
import type { StoreState } from '../store'


const items: MenuProps['items'] = [
    {
        key: '/Config/Administrators',
        label: <Link to="/Config/Administrators">管理设置</Link>,
    },
    {
        key: '/Config/Changepassword',
        label: <Link to="/Config/Changepassword">个人信息</Link>,
    },
    {
        key: '/login',
        label: (
            <Link to="/login">
                <span>退出登录</span>
            </Link>
        ),
    },
];



const Avatars: React.FC = () => {

    const userInfo = useSelector((state: StoreState) => state.user.userInfo)
    const avatar = useSelector((state: StoreState) => state.user.userInfo?.avatar)
    console.log('userInfo',userInfo);


    return (
        <Dropdown menu={{ items }}>
            <Space
                direction="vertical"
                size={16}
                style={{ margin: '0 16px', float: 'right' }}
            >
                <Space wrap size={16}>
                    <Avatar size="large" src={avatar} icon={<UserOutlined />} />
                </Space>
            </Space>
        </Dropdown>
    );
}




export default Avatars;
