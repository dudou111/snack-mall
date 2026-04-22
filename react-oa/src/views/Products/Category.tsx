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
  TreeSelect
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  getCategories,
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
  type Category,
  type CategoryListParams
} from '../../api/product';

const { Option } = Select;
const { TextArea } = Input;

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchParams, setSearchParams] = useState<CategoryListParams>({
    page: 1,
    pageSize: 10,
    keyword: '',
    status: ''
  });

  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCategories({
        ...searchParams,
        page: currentPage,
        pageSize
      });
      
      if (response.code === 0) {
        setCategories(response.data.list);
        setTotal(response.data.total);
      } else {
        message.error(response.message || '获取分类列表失败');
      }
    } catch (error) {
      console.error('获取分类列表失败:', error);
      message.error('获取分类列表失败');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchParams]);

  // 获取分类树
  const fetchCategoryTree = useCallback(async () => {
    try {
      const response = await getCategoryTree();
      if (response.code === 0) {
        setCategoryTree(response.data);
      }
    } catch (error) {
      console.error('获取分类树失败:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchCategoryTree();
  }, [fetchCategoryTree]);

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
  const showModal = (category?: Category) => {
    setEditingCategory(category || null);
    setIsModalVisible(true);
    
    if (category) {
      form.setFieldsValue({
        ...category,
        parentId: category.parentId || undefined
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: '启用',
        level: 1,
        sort: 0,
        showOnHome: false
      });
    }
  };

  // 处理保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      let response;
      if (editingCategory) {
        response = await updateCategory(editingCategory._id, values);
      } else {
        response = await createCategory(values);
      }

      if (response.code === 0) {
        message.success(editingCategory ? '更新分类成功' : '创建分类成功');
        setIsModalVisible(false);
        fetchCategories();
        fetchCategoryTree();
      } else {
        message.error(response.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  // 删除分类
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteCategory(id);
      if (response.code === 0) {
        message.success('删除成功');
        fetchCategories();
        fetchCategoryTree();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 更新分类状态
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await updateCategoryStatus(id, status);
      if (response.code === 0) {
        message.success('状态更新成功');
        fetchCategories();
        fetchCategoryTree();
      } else {
        message.error(response.message || '状态更新失败');
      }
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 构建树形选择器数据
  const buildTreeSelectData = (categories: Category[]): any[] => {
    return categories.map(category => ({
      title: category.name,
      value: category._id,
      key: category._id,
      children: category.children ? buildTreeSelectData(category.children) : undefined
    }));
  };

  const columns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: Category) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{name}</div>
          {record.level > 1 && (
            <div style={{ fontSize: 12, color: '#999' }}>
              级别：{record.level}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '商品数量',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 120,
      render: (count: number) => (
        <Tag color="blue">{count} 个商品</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: Category) => (
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
      title: '首页显示',
      dataIndex: 'showOnHome',
      key: 'showOnHome',
      width: 100,
      render: (showOnHome: boolean) => (
        <Tag color={showOnHome ? 'green' : 'default'}>
          {showOnHome ? '是' : '否'}
        </Tag>
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
      render: (record: Category) => (
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
            title="确定删除这个分类吗？"
            description="删除后无法恢复，且该分类下不能有商品"
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
              placeholder="搜索分类名称、描述"
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
                新增分类
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchCategories();
                  fetchCategoryTree();
                }}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1000 }}
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
        title={editingCategory ? '编辑分类' : '新增分类'}
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
            level: 1,
            sort: 0,
            showOnHome: false
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="分类名称"
                name="name"
                rules={[{ required: true, message: '请输入分类名称' }]}
              >
                <Input placeholder="请输入分类名称" />
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
                label="父分类"
                name="parentId"
                help="不选择则为顶级分类"
              >
                <TreeSelect
                  placeholder="请选择父分类"
                  allowClear
                  treeData={buildTreeSelectData(categoryTree)}
                  treeDefaultExpandAll
                />
              </Form.Item>
            </Col>
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
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="首页显示"
                name="showOnHome"
                valuePropName="checked"
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="分类描述" name="description">
            <TextArea rows={3} placeholder="请输入分类描述" />
          </Form.Item>

          <Form.Item label="分类图标" name="icon">
            <Input placeholder="请输入图标URL或图标类名" />
          </Form.Item>

          <Form.Item label="分类图片" name="image">
            <Input placeholder="请输入图片URL" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement; 