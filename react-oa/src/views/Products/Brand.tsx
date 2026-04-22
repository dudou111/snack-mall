import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Row,
  Col,
  InputNumber,
  Switch,
  Image,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  LinkOutlined
} from '@ant-design/icons';
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  batchDeleteBrands,
  updateBrandStatus,
  type Brand,
  type BrandListParams
} from '../../api/product';

const { Option } = Select;
const { TextArea } = Input;

const BrandManagement: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [searchParams, setSearchParams] = useState<BrandListParams>({
    page: 1,
    pageSize: 10,
    keyword: '',
    status: ''
  });

  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  // 获取品牌列表
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBrands({
        ...searchParams,
        page: currentPage,
        pageSize
      });
      
      if (response.code === 0) {
        setBrands(response.data.list);
        setTotal(response.data.total);
      } else {
        message.error(response.message || '获取品牌列表失败');
      }
    } catch (error) {
      console.error('获取品牌列表失败:', error);
      message.error('获取品牌列表失败');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchParams]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // 处理搜索
  const handleSearch = (values: any) => {
    const newSearchParams = {
      ...searchParams,
      ...values,
      page: 1
    };
    setSearchParams(newSearchParams);
    setCurrentPage(1);
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    const newSearchParams = {
      page: 1,
      pageSize: 10,
      keyword: '',
      status: ''
    };
    setSearchParams(newSearchParams);
    setCurrentPage(1);
  };

  // 显示添加/编辑模态框
  const showModal = (brand?: Brand) => {
    setEditingBrand(brand || null);
    setIsModalVisible(true);
    
    if (brand) {
      form.setFieldsValue(brand);
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: '启用',
        sort: 0,
        isRecommended: false
      });
    }
  };

  // 处理保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      let response;
      if (editingBrand) {
        response = await updateBrand(editingBrand._id, values);
      } else {
        response = await createBrand(values);
      }

      if (response.code === 0) {
        message.success(editingBrand ? '更新品牌成功' : '创建品牌成功');
        setIsModalVisible(false);
        fetchBrands();
      } else {
        message.error(response.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  // 删除品牌
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteBrand(id);
      if (response.code === 0) {
        message.success('删除成功');
        fetchBrands();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的品牌');
      return;
    }

    try {
      const response = await batchDeleteBrands(selectedRowKeys as string[]);
      if (response.code === 0) {
        message.success('批量删除成功');
        setSelectedRowKeys([]);
        fetchBrands();
      } else {
        message.error(response.message || '批量删除失败');
      }
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  // 更新品牌状态
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await updateBrandStatus(id, status);
      if (response.code === 0) {
        message.success('状态更新成功');
        fetchBrands();
      } else {
        message.error(response.message || '状态更新失败');
      }
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const columns = [
    {
      title: '品牌LOGO',
      dataIndex: 'logo',
      key: 'logo',
      width: 100,
      render: (logo: string, record: Brand) => (
        <Image 
          width={60} 
          height={60} 
          src={logo || 'https://via.placeholder.com/60'} 
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8O+L0=="
          style={{ borderRadius: 8 }}
          placeholder={
            <div style={{ 
              width: 60, 
              height: 60, 
              backgroundColor: '#f5f5f5', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: 8,
              fontSize: 12,
              color: '#999'
            }}>
              {record.name.charAt(0)}
            </div>
          }
        />
      ),
    },
    {
      title: '品牌信息',
      key: 'brandInfo',
      width: 200,
      render: (record: Brand) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            {record.name}
            {record.isRecommended && (
              <Tag color="gold" style={{ marginLeft: 8 }}>推荐</Tag>
            )}
          </div>
          {record.website && (
            <div style={{ fontSize: 12, color: '#1890ff', marginBottom: 2 }}>
              <LinkOutlined style={{ marginRight: 4 }} />
              <a href={record.website} target="_blank" rel="noopener noreferrer">
                官网
              </a>
            </div>
          )}
          <div style={{ fontSize: 12, color: '#999' }}>
            商品数量：{record.productCount}
          </div>
        </div>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => (
        <Tooltip title={description}>
          <span>{description || '暂无描述'}</span>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: Brand) => (
        <Select
          value={status}
          size="small"
          style={{ width: 80 }}
          onChange={(value) => handleStatusChange(record._id, value)}
        >
          <Option value="启用">
            <Tag color="green">启用</Tag>
          </Option>
          <Option value="禁用">
            <Tag color="red">禁用</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (record: Brand) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个品牌吗？"
            description="删除后无法恢复，且该品牌下不能有商品"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              icon={<DeleteOutlined />}
              size="small"
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        {/* 搜索区域 */}
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input
              placeholder="搜索品牌名称、描述"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              placeholder="选择状态"
              style={{ width: 120 }}
              allowClear
            >
              <Option value="启用">启用</Option>
              <Option value="禁用">禁用</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 操作按钮区域 */}
        <Row style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
              >
                新增品牌
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
                disabled={selectedRowKeys.length === 0}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchBrands()}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={brands}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1000 }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            },
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 添加/编辑模态框 */}
      <Modal
        title={editingBrand ? '编辑品牌' : '新增品牌'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: '启用',
            sort: 0,
            isRecommended: false
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="品牌名称"
                name="name"
                rules={[{ required: true, message: '请输入品牌名称' }]}
              >
                <Input placeholder="请输入品牌名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select>
                  <Option value="启用">启用</Option>
                  <Option value="禁用">禁用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="排序"
                name="sort"
                help="数字越小排序越靠前"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="请输入排序值"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="推荐品牌"
                name="isRecommended"
                valuePropName="checked"
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="品牌描述" name="description">
            <TextArea rows={3} placeholder="请输入品牌描述" />
          </Form.Item>

          <Form.Item label="品牌LOGO" name="logo">
            <Input placeholder="请输入LOGO图片URL" />
          </Form.Item>

          <Form.Item label="品牌图片" name="image">
            <Input placeholder="请输入品牌图片URL" />
          </Form.Item>

          <Form.Item label="官方网站" name="website">
            <Input placeholder="请输入官方网站URL" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BrandManagement; 