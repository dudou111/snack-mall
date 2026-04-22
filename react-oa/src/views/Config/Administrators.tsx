import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Modal,
  Form,
  Popconfirm,
  Avatar,
  Switch,
  DatePicker,
  Divider,
  Badge
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  KeyOutlined,
  UserOutlined,
  CrownOutlined,
  FilterOutlined,
  ClearOutlined
} from '@ant-design/icons';
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  batchDeleteUsers,
  resetUserPassword,
  updateUserRole,
  type User,
  type UserListParams,
  type CreateUserData,
  type UpdateUserData
} from '../../api/user';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function Administrators() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState<UserListParams>({});
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 高级搜索状态
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // 模态框状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'resetPassword'>('create');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  
  // 角色切换模态框
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);

  // 获取用户列表
  const fetchUsers = useCallback(async (params: UserListParams = {}) => {
    setLoading(true);
    try {
      // 处理日期范围
      let queryParams = { ...params };
      if (dateRange && dateRange[0] && dateRange[1]) {
        queryParams.startDate = dateRange[0].format('YYYY-MM-DD');
        queryParams.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      const response = await getUserList({
        page: pagination.current,
        limit: pagination.pageSize,
        ...searchParams,
        ...queryParams
      });
      
      if (response.data.code === 0) {
        setUsers(response.data.data.users);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination.total
        }));
      } else {
        message.error(response.data.message || '获取用户列表失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
      console.error('获取用户列表错误:', error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchParams, dateRange]);

  // 防抖处理函数，延迟执行搜索
  const debouncedSearch = useCallback((params: UserListParams = {}) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    
    searchTimerRef.current = setTimeout(() => {
      setPagination(prev => ({ ...prev, current: 1 }));
      fetchUsers({ page: 1, ...params });
      setSearchLoading(false);
    }, 500); // 500ms延迟
    
    setSearchLoading(true);
  }, [fetchUsers]);
  
  // 处理关键词搜索变化
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    setSearchParams(prev => ({ ...prev, keyword }));
    debouncedSearch({ ...searchParams, keyword });
  };
  
  // 处理用户状态变化
  const handleStatusChange = (status: string | undefined) => {
    setSearchParams(prev => ({ ...prev, status }));
    debouncedSearch({ ...searchParams, status });
  };
  
  // 处理用户角色变化
  const handleRoleChange = (isAdmin: boolean | undefined) => {
    setSearchParams(prev => ({ ...prev, isAdmin }));
    debouncedSearch({ ...searchParams, isAdmin });
  };

  // 搜索处理 - 保留用于高级搜索
  const handleSearch = () => {
    setSearchLoading(true);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchUsers({ page: 1 });
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({});
    setDateRange(null);
    setShowAdvancedSearch(false);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchUsers({ page: 1 });
    message.success('已重置所有搜索条件');
  };

  // 打开创建用户模态框
  const handleCreate = () => {
    setModalType('create');
    setCurrentUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑用户模态框
  const handleEdit = (record: User) => {
    setModalType('edit');
    setCurrentUser(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      tel: record.tel,
      isAdmin: record.isAdmin,
      status: record.status
    });
    setModalVisible(true);
  };

  // 打开重置密码模态框
  const handleResetPassword = (record: User) => {
    setModalType('resetPassword');
    setCurrentUser(record);
    form.resetFields();
    setModalVisible(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (modalType === 'create') {
        const response = await createUser(values as CreateUserData);
        if (response.data.code === 0) {
          message.success('创建用户成功');
          setModalVisible(false);
          fetchUsers();
        } else {
          message.error(response.data.message || '创建用户失败');
        }
      } else if (modalType === 'edit' && currentUser) {
        const response = await updateUser(currentUser._id, values as UpdateUserData);
        if (response.data.code === 0) {
          message.success('更新用户成功');
          setModalVisible(false);
          fetchUsers();
        } else {
          message.error(response.data.message || '更新用户失败');
        }
      } else if (modalType === 'resetPassword' && currentUser) {
        const response = await resetUserPassword(currentUser._id, values.newPassword);
        if (response.data.code === 0) {
          message.success('重置密码成功');
          setModalVisible(false);
          fetchUsers();
        } else {
          message.error(response.data.message || '重置密码失败');
        }
      }
    } catch (error) {
      message.error('操作失败，请稍后重试');
    }
  };

  // 删除用户
  const handleDelete = async (id: string) => {
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
  
  // 批量删除用户
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的用户');
      return;
    }
    
    Modal.confirm({
      title: '批量删除用户',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个用户吗？此操作不可恢复！`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await batchDeleteUsers(selectedRowKeys);
          if (response.data.code === 0) {
            message.success(`成功删除 ${selectedRowKeys.length} 个用户`);
            setSelectedRowKeys([]);
            fetchUsers();
          } else {
            message.error(response.data.message || '批量删除失败');
          }
        } catch (error) {
          message.error('网络错误，请稍后重试');
        }
      }
    });
  };
  
  // 打开角色切换模态框
  const handleOpenRoleModal = (record: User) => {
    setSelectedUser(record);
    setRoleModalVisible(true);
  };
  
  // 切换用户角色
  const handleRoleChangeModal = async () => {
    if (!selectedUser) return;
    
    setIsChangingRole(true);
    try {
      const newIsAdmin = !selectedUser.isAdmin;
      const response = await updateUserRole(selectedUser._id, newIsAdmin);
      
      if (response.data.code === 0) {
        message.success(`用户 ${selectedUser.username} 已${newIsAdmin ? '设为管理员' : '取消管理员权限'}`);
        setRoleModalVisible(false);
        fetchUsers();
      } else {
        message.error(response.data.message || '修改角色失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setIsChangingRole(false);
    }
  };

  // 页面初始化
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // 处理行选择
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys as string[]);
    },
    getCheckboxProps: (record: User) => ({
      disabled: record.isAdmin, // 禁止选择管理员用户
      name: record.username,
    }),
  };

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
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      render: (email: string) => email || '-',
    },
    {
      title: '手机号',
      dataIndex: 'tel',
      key: 'tel',
      width: 120,
      render: (tel: string) => tel || '-',
    },
    {
      title: '角色',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      width: 100,
      render: (isAdmin: boolean) => (
        <Tag 
          color={isAdmin ? 'red' : 'blue'} 
          icon={isAdmin ? <CrownOutlined /> : null}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            // 如果当前已经选中了相同的角色，则清除筛选
            if (searchParams.isAdmin === isAdmin) {
              handleRoleChange(undefined);
            } else {
              handleRoleChange(isAdmin);
            }
          }}
        >
          {isAdmin ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          '启用': { color: 'green', text: '启用' },
          '禁用': { color: 'orange', text: '禁用' },
          '封禁': { color: 'red', text: '封禁' }
        };
        const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
        return (
          <Tag 
            color={statusInfo.color}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              // 如果当前已经选中了相同的状态，则清除筛选
              if (searchParams.status === status) {
                handleStatusChange(undefined);
              } else {
                handleStatusChange(status);
              }
            }}
          >
            {statusInfo.text}
          </Tag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
      sorter: (a: User, b: User) => 
        new Date(a.createTime).getTime() - new Date(b.createTime).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (record: User) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<KeyOutlined />}
            size="small"
            onClick={() => handleResetPassword(record)}
          >
            重置密码
          </Button>
          <Button
            type="link"
            icon={<CrownOutlined />}
            size="small"
            onClick={() => handleOpenRoleModal(record)}
          >
            {record.isAdmin ? '取消管理员' : '设为管理员'}
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

  // 搜索条件的数量
  const activeSearchCount = Object.values(searchParams).filter(val => val !== undefined && val !== null && val !== '').length 
    + (dateRange && dateRange[0] && dateRange[1] ? 1 : 0);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  return (
    <Card>
      {/* 搜索栏 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="搜索用户名、邮箱、手机号"
            prefix={<SearchOutlined />}
            value={searchParams.keyword}
            onChange={handleKeywordChange}
            allowClear
          />
        </Col>
        <Col span={4}>
          <Select
            placeholder="用户状态"
            style={{ width: '100%' }}
            allowClear
            value={searchParams.status}
            onChange={handleStatusChange}
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
            onChange={handleRoleChange}
          >
            <Option value={true}>管理员</Option>
            <Option value={false}>普通用户</Option>
          </Select>
        </Col>
        <Col span={10}>
          <Space>
            <Button 
              type="primary" 
              onClick={handleSearch} 
              loading={searchLoading}
              icon={<SearchOutlined />}
            >
              搜索
            </Button>
            <Button 
              onClick={handleReset} 
              icon={<ClearOutlined />}
              disabled={activeSearchCount === 0}
            >
              重置
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchUsers()} 
              title="刷新数据"
            />
            <Button 
              type={showAdvancedSearch ? "primary" : "default"}
              icon={<FilterOutlined />} 
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            >
              高级搜索
              {activeSearchCount > 0 && (
                <Badge count={activeSearchCount} offset={[5, -5]} size="small" />
              )}
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 高级搜索栏 */}
      {showAdvancedSearch && (
        <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ marginBottom: 8 }}>创建时间范围:</div>
              <RangePicker 
                style={{ width: '100%' }} 
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
              />
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 8 }}>排序方式:</div>
              <Select
                placeholder="排序方式"
                style={{ width: '100%' }}
                allowClear
                value={searchParams.sort}
                onChange={(value) => setSearchParams(prev => ({ ...prev, sort: value }))}
              >
                <Option value="createTime_desc">创建时间 (新→旧)</Option>
                <Option value="createTime_asc">创建时间 (旧→新)</Option>
                <Option value="username_asc">用户名 (A→Z)</Option>
                <Option value="username_desc">用户名 (Z→A)</Option>
              </Select>
            </Col>
          </Row>
          <Divider style={{ margin: '16px 0 8px' }} />
          <Space>
            <Button type="primary" onClick={handleSearch} loading={searchLoading}>
              应用筛选
            </Button>
            <Button onClick={() => {
              setDateRange(null);
              setSearchParams(prev => ({ ...prev, sort: undefined }));
            }}>
              清除高级筛选
            </Button>
          </Space>
        </div>
      )}

      {/* 操作按钮栏 */}
      <Row style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新增用户
            </Button>
            {selectedRowKeys.length > 0 && (
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={handleBatchDelete}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* 用户表格 */}
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        rowSelection={rowSelection}
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

      {/* 用户操作模态框 */}
      <Modal
        title={
          modalType === 'create' ? '新增用户' : 
          modalType === 'edit' ? '编辑用户' : 
          '重置密码'
        }
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          {modalType !== 'resetPassword' && (
            <>
              <Form.Item
                label="用户名"
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 2, max: 20, message: '用户名长度在2-20个字符' }
                ]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>

              {modalType === 'create' && (
                <Form.Item
                  label="密码"
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码长度不能少于6位' }
                  ]}
                >
                  <Input.Password placeholder="请输入密码" />
                </Form.Item>
              )}

              <Form.Item
                label="邮箱"
                name="email"
                rules={[
                  { type: 'email', message: '请输入正确的邮箱格式' }
                ]}
              >
                <Input placeholder="请输入邮箱（可选）" />
              </Form.Item>

              <Form.Item
                label="手机号"
                name="tel"
                rules={[
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' }
                ]}
              >
                <Input placeholder="请输入手机号（可选）" />
              </Form.Item>

              <Form.Item
                label="用户角色"
                name="isAdmin"
                valuePropName="checked"
              >
                <Switch checkedChildren="管理员" unCheckedChildren="普通用户" />
              </Form.Item>

              {modalType === 'edit' && (
                <Form.Item
                  label="用户状态"
                  name="status"
                  rules={[{ required: true, message: '请选择用户状态' }]}
                >
                  <Select placeholder="请选择用户状态">
                    <Option value="启用">启用</Option>
                    <Option value="禁用">禁用</Option>
                    <Option value="封禁">封禁</Option>
                  </Select>
                </Form.Item>
              )}
            </>
          )}

          {modalType === 'resetPassword' && (
            <Form.Item
              label="新密码"
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码长度不能少于6位' }
              ]}
            >
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
          )}
        </Form>
      </Modal>
      
      {/* 角色切换确认模态框 */}
      <Modal
        title="修改用户角色"
        open={roleModalVisible}
        onOk={handleRoleChangeModal}
        onCancel={() => setRoleModalVisible(false)}
        confirmLoading={isChangingRole}
      >
        {selectedUser && (
          <p>
            确定要将用户 <b>{selectedUser.username}</b> 的角色从
            <Tag color={selectedUser.isAdmin ? 'red' : 'blue'} style={{ margin: '0 5px' }}>
              {selectedUser.isAdmin ? '管理员' : '普通用户'}
            </Tag>
            修改为
            <Tag color={!selectedUser.isAdmin ? 'red' : 'blue'} style={{ margin: '0 5px' }}>
              {!selectedUser.isAdmin ? '管理员' : '普通用户'}
            </Tag>
            吗？
          </p>
        )}
        <div style={{ marginTop: 16 }}>
          <p>
            <b>说明：</b>
          </p>
          <ul>
            <li>管理员可以登录系统并拥有所有权限</li>
            <li>普通用户可以登录系统但权限受限</li>
            <li>只有管理员才能对用户进行角色修改</li>
          </ul>
        </div>
      </Modal>
    </Card>
  );
}
