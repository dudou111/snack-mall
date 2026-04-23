import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Row,
  Col,
  message,
  Avatar,
  Tooltip,
  Popconfirm,
  Alert,
  Dropdown,
  Menu
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  DownOutlined,
  CrownOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { getUserList, deleteUser, updateUserStatus, updateUserRole, type User, type UserListParams } from '../../api/user';
import dayjs from 'dayjs';

const { Option } = Select;

// 假数据作为后备方案
const mockUsers: User[] = [
  {
    _id: 'mock1',
    username: 'user001',
    email: 'user001@example.com',
    tel: '13800138001',
    avatar: 'http://127.0.0.1:8088/default-avatar.jpg',
    isAdmin: false,
    status: '启用',
    createTime: '2024-01-15T08:30:00.000Z',
    lastLoginTime: '2024-05-26T14:20:00.000Z',
    createdAt: '2024-01-15T08:30:00.000Z',
    updatedAt: '2024-05-26T14:20:00.000Z'
  },
  {
    _id: 'mock2',
    username: '张三',
    email: 'zhangsan@example.com',
    tel: '13811112222',
    avatar: 'http://127.0.0.1:8088/default-avatar.jpg',
    isAdmin: false,
    status: '启用',
    createTime: '2024-02-10T10:15:00.000Z',
    lastLoginTime: '2024-05-25T16:45:00.000Z',
    createdAt: '2024-02-10T10:15:00.000Z',
    updatedAt: '2024-05-25T16:45:00.000Z'
  },
  {
    _id: 'mock3',
    username: '李四',
    email: 'lisi@example.com',
    tel: '13822223333',
    avatar: 'http://127.0.0.1:8088/default-avatar2.jpg',
    isAdmin: false,
    status: '启用',
    createTime: '2024-03-05T14:22:00.000Z',
    lastLoginTime: '2024-05-24T09:30:00.000Z',
    createdAt: '2024-03-05T14:22:00.000Z',
    updatedAt: '2024-05-24T09:30:00.000Z'
  },
  {
    _id: 'mock4',
    username: '王五',
    email: 'wangwu@example.com',
    tel: '13833334444',
    avatar: 'http://127.0.0.1:8088/default-avatar3.png',
    isAdmin: false,
    status: '封禁',
    createTime: '2024-04-12T11:40:00.000Z',
    lastLoginTime: undefined,
    createdAt: '2024-04-12T11:40:00.000Z',
    updatedAt: '2024-04-12T11:40:00.000Z'
  },
  {
    _id: 'mock5',
    username: 'admin',
    email: 'admin@example.com',
    tel: '13899990000',
    avatar: 'http://127.0.0.1:8088/default-avatar.jpg',
    isAdmin: true,
    status: '启用',
    createTime: '2024-01-01T00:00:00.000Z',
    lastLoginTime: '2024-05-26T18:10:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-05-26T18:10:00.000Z'
  },
  {
    _id: 'mock6',
    username: '赵六',
    email: 'zhaoliu@example.com',
    tel: '13844445555',
    avatar: 'http://127.0.0.1:8088/default-avatar.jpg',
    isAdmin: false,
    status: '启用',
    createTime: '2024-03-20T16:25:00.000Z',
    lastLoginTime: '2024-05-23T12:15:00.000Z',
    createdAt: '2024-03-20T16:25:00.000Z',
    updatedAt: '2024-05-23T12:15:00.000Z'
  },
  {
    _id: 'mock7',
    username: '钱七',
    email: 'qianqi@example.com',
    tel: '13855556666',
    avatar: 'http://127.0.0.1:8088/default-avatar2.jpg',
    isAdmin: false,
    status: '启用',
    createTime: '2024-04-08T13:10:00.000Z',
    lastLoginTime: '2024-05-22T08:45:00.000Z',
    createdAt: '2024-04-08T13:10:00.000Z',
    updatedAt: '2024-05-22T08:45:00.000Z'
  },
  {
    _id: 'mock8',
    username: '孙八',
    email: 'sunba@example.com',
    tel: '13866667777',
    avatar: 'http://127.0.0.1:8088/default-avatar3.png',
    isAdmin: false,
    status: '禁用',
    createTime: '2024-05-01T09:30:00.000Z',
    lastLoginTime: undefined,
    createdAt: '2024-05-01T09:30:00.000Z',
    updatedAt: '2024-05-01T09:30:00.000Z'
  }
];

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<{ [key: string]: boolean }>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchParams, setSearchParams] = useState<UserListParams>({});

  // 获取用户列表
  const fetchUsers = async (params: UserListParams = {}) => {
    setLoading(true);
    try {
      console.log('正在获取用户列表...', { ...searchParams, ...params });
      
      const response = await getUserList({
        page: pagination.current,
        limit: pagination.pageSize,
        ...searchParams,
        ...params
      });
      
      console.log('API响应:', response);
      
      if (response.data.code === 0) {
        setUsers(response.data.data.users);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination.total
        }));
        setUsingMockData(false);
        console.log('成功获取用户数据:', response.data.data.users);
      } else {
        console.warn('API返回错误:', response.data.message);
        message.error(response.data.message || '获取用户列表失败');
        // 使用假数据作为后备
        setUsers(mockUsers);
        setPagination(prev => ({ ...prev, total: mockUsers.length }));
        setUsingMockData(true);
      }
    } catch (error) {
      console.error('获取用户列表网络错误:', error);
      message.warning('网络连接失败，正在使用演示数据');
      // 使用假数据作为后备
      setUsers(mockUsers);
      setPagination(prev => ({ ...prev, total: mockUsers.length }));
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  // 搜索处理
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    if (usingMockData) {
      // 在假数据中搜索
      let filteredUsers = mockUsers;
      if (searchParams.keyword) {
        filteredUsers = filteredUsers.filter(user => 
          user.username.includes(searchParams.keyword!) ||
          (user.email && user.email.includes(searchParams.keyword!)) ||
          (user.tel && user.tel.includes(searchParams.keyword!))
        );
      }
      if (searchParams.status) {
        filteredUsers = filteredUsers.filter(user => user.status === searchParams.status);
      }
      if (searchParams.isAdmin !== undefined) {
        filteredUsers = filteredUsers.filter(user => user.isAdmin === searchParams.isAdmin);
      }
      setUsers(filteredUsers);
      setPagination(prev => ({ ...prev, total: filteredUsers.length }));
    } else {
      fetchUsers({ page: 1 });
    }
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({});
    setPagination(prev => ({ ...prev, current: 1 }));
    if (usingMockData) {
      setUsers(mockUsers);
      setPagination(prev => ({ ...prev, total: mockUsers.length }));
    } else {
      fetchUsers({ page: 1 });
    }
  };

  // 删除用户
  const handleDelete = async (id: string) => {
    if (usingMockData) {
      const filteredUsers = users.filter(user => user._id !== id);
      setUsers(filteredUsers);
      setPagination(prev => ({ ...prev, total: filteredUsers.length }));
      message.success('删除成功（演示模式）');
      return;
    }

    try {
      const response = await deleteUser(id);
      if (response.data.code === 0) {
        message.success('删除成功');
        fetchUsers();
      } else {
        message.error(response.data.message || '删除失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    }
  };

  // 更新用户身份
  const handleUpdateRole = async (userId: string, isAdmin: boolean) => {
    if (usingMockData) {
      const updatedUsers = users.map(user => 
        user._id === userId ? { ...user, isAdmin } : user
      );
      setUsers(updatedUsers);
      message.success(`已将用户身份更新为${isAdmin ? 'VIP会员' : '普通用户'}（演示模式）`);
      return;
    }

    setUpdatingStatus(prev => ({ ...prev, [`role_${userId}`]: true }));
    try {
      const response = await updateUserRole(userId, isAdmin);
      if (response.data.code === 0) {
        message.success(response.data.message);
        fetchUsers();
      } else {
        message.error(response.data.message || '更新失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [`role_${userId}`]: false }));
    }
  };

  // 更新用户状态
  const handleUpdateStatus = async (userId: string, status: string) => {
    if (usingMockData) {
      const updatedUsers = users.map(user => 
        user._id === userId ? { ...user, status: status as '启用' | '禁用' | '封禁' } : user
      );
      setUsers(updatedUsers);
      message.success(`已将用户状态更新为${status}（演示模式）`);
      return;
    }

    setUpdatingStatus(prev => ({ ...prev, [`status_${userId}`]: true }));
    try {
      const response = await updateUserStatus(userId, status);
      if (response.data.code === 0) {
        message.success(`用户状态已更新为${status}`);
        fetchUsers();
      } else {
        message.error(response.data.message || '更新失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [`status_${userId}`]: false }));
    }
  };

  // 页面初始化
  useEffect(() => {
    console.log('用户列表组件初始化');
    fetchUsers();
  }, [pagination.current, pagination.pageSize]);

  const columns = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (avatar: string) => (
        <Avatar src={avatar} icon={<UserOutlined />} />
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 220,
      render: (record: User) => (
        <Space>
          {record.email && (
            <Tooltip title={record.email}>
              <Button icon={<MailOutlined />} size="small" type="text" />
            </Tooltip>
          )}
          {record.tel && (
            <Tooltip title={record.tel}>
              <Button icon={<PhoneOutlined />} size="small" type="text" />
            </Tooltip>
          )}
          <span>{record.tel || '-'}</span>
        </Space>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '角色',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      width: 120,
      render: (isAdmin: boolean, record: User) => {
        const isUpdatingRole = updatingStatus[`role_${record._id}`];
        
        const roleMenu = (
          <Menu
            onClick={({ key }) => {
              const newIsAdmin = key === 'admin';
              if (newIsAdmin !== isAdmin && !isUpdatingRole) {
                handleUpdateRole(record._id, newIsAdmin);
              }
            }}
          >
            <Menu.Item key="admin" icon={<CrownOutlined />} disabled={isUpdatingRole}>
              VIP会员
            </Menu.Item>
            <Menu.Item key="user" icon={<TeamOutlined />} disabled={isUpdatingRole}>
              普通用户
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={roleMenu} trigger={['click']} disabled={isUpdatingRole}>
            <Tag 
              color={isAdmin ? 'red' : 'blue'} 
              style={{ 
                cursor: isUpdatingRole ? 'not-allowed' : 'pointer',
                opacity: isUpdatingRole ? 0.6 : 1
              }}
            >
              {isAdmin ? 'VIP会员' : '普通用户'}
              {isUpdatingRole ? (
                <span className="ant-spin-dot" style={{ marginLeft: 4, fontSize: 8 }}>
                  <i className="ant-spin-dot-item"></i>
                  <i className="ant-spin-dot-item"></i>
                  <i className="ant-spin-dot-item"></i>
                  <i className="ant-spin-dot-item"></i>
                </span>
              ) : (
                <DownOutlined style={{ marginLeft: 4 }} />
              )}
            </Tag>
          </Dropdown>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record: User) => {
        const isUpdatingStatus = updatingStatus[`status_${record._id}`];
        
        const statusMap = {
          '启用': { color: 'green', text: '启用' },
          '禁用': { color: 'orange', text: '禁用' },
          '封禁': { color: 'red', text: '封禁' }
        };
        const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
        
        const statusMenu = (
          <Menu
            onClick={({ key }) => {
              if (key !== status && !isUpdatingStatus) {
                handleUpdateStatus(record._id, key as string);
              }
            }}
          >
            <Menu.Item key="启用" disabled={isUpdatingStatus}>启用</Menu.Item>
            <Menu.Item key="禁用" disabled={isUpdatingStatus}>禁用</Menu.Item>
            <Menu.Item key="封禁" disabled={isUpdatingStatus}>封禁</Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={statusMenu} trigger={['click']} disabled={isUpdatingStatus}>
            <Tag 
              color={statusInfo.color} 
              style={{ 
                cursor: isUpdatingStatus ? 'not-allowed' : 'pointer',
                opacity: isUpdatingStatus ? 0.6 : 1
              }}
            >
              {statusInfo.text}
              {isUpdatingStatus ? (
                <span className="ant-spin-dot" style={{ marginLeft: 4, fontSize: 8 }}>
                  <i className="ant-spin-dot-item"></i>
                  <i className="ant-spin-dot-item"></i>
                  <i className="ant-spin-dot-item"></i>
                  <i className="ant-spin-dot-item"></i>
                </span>
              ) : (
                <DownOutlined style={{ marginLeft: 4 }} />
              )}
            </Tag>
          </Dropdown>
        );
      },
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 170,
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (record: User) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => message.info('编辑功能开发中')}
          >
            编辑
          </Button>
          {!record.isAdmin && (
            <Popconfirm
              title="确定要删除这个用户吗？"
              onConfirm={() => handleDelete(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card title="零售商城用户列表">
      {usingMockData && (
        <Alert
          message="演示模式"
          description="当前使用演示数据，所有操作仅在本页面生效。请检查后端服务是否正常运行。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      
      {/* 搜索栏 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="搜索用户名、邮箱、手机号"
            prefix={<SearchOutlined />}
            value={searchParams.keyword}
            onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
        </Col>
        <Col span={4}>
          <Select
            placeholder="用户状态"
            style={{ width: '100%' }}
            allowClear
            value={searchParams.status}
            onChange={(value) => setSearchParams(prev => ({ ...prev, status: value }))}
          >
            <Option value="启用">启用</Option>
            <Option value="禁用">禁用</Option>
            <Option value="封禁">封禁</Option>
          </Select>
        </Col>
        <Col span={4}>
          <Select
            placeholder="用户角色"
            style={{ width: '100%' }}
            allowClear
            value={searchParams.isAdmin}
            onChange={(value) => setSearchParams(prev => ({ ...prev, isAdmin: value }))}
          >
            <Option value={true}>VIP会员</Option>
            <Option value={false}>普通用户</Option>
          </Select>
        </Col>
        <Col span={6}>
          <Space>
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Button onClick={handleReset}>重置</Button>
            <Button icon={<ReloadOutlined />} onClick={() => fetchUsers()} />
          </Space>
        </Col>
      </Row>

      {/* 用户表格 */}
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
          }
        }}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
};

export default UserList; 