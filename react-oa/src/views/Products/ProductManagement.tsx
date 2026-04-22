import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  InputNumber,
  Image,
  Drawer,
  Descriptions,
  Divider,
  Tooltip,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  StarOutlined,
  ExportOutlined,
  ImportOutlined
} from '@ant-design/icons';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  batchDeleteProducts,
  updateProductStatus,
  getCategoryTree,
  getAllBrands,
  type Product,
  type ProductListParams,
  type Category,
  type Brand
} from '../../api/product';

const { Option } = Select;
const { TextArea } = Input;

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [searchParams, setSearchParams] = useState<ProductListParams>({
    page: 1,
    pageSize: 10,
    keyword: '',
    status: '',
    category: '',
    brand: ''
  });

  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  // 获取商品列表
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getProducts({
        ...searchParams,
        page: currentPage,
        pageSize
      });
      
      if (response.code === 0) {
        setProducts(response.data.list);
        setTotal(response.data.total);
      } else {
        message.error(response.message || '获取商品列表失败');
      }
    } catch (error) {
      console.error('获取商品列表失败:', error);
      message.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchParams]);

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategoryTree();
      if (response.code === 0) {
        setCategories(response.data || []);
      } else {
        message.warning(response.message || '获取分类列表失败');
        setCategories([]);
      }
    } catch (error) {
      console.error('获取分类列表失败:', error);
      message.error('获取分类列表失败，请检查网络连接');
      setCategories([]);
    }
  }, []);

  // 获取品牌列表
  const fetchBrands = useCallback(async () => {
    try {
      const response = await getAllBrands();
      if (response.code === 0) {
        setBrands(response.data || []);
        if (!response.data || response.data.length === 0) {
          console.warn('品牌列表为空，请先添加品牌数据');
        }
      } else {
        message.warning(response.message || '获取品牌列表失败');
        setBrands([]);
      }
    } catch (error) {
      console.error('获取品牌列表失败:', error);
      message.error('获取品牌列表失败，请检查网络连接');
      setBrands([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, [fetchCategories, fetchBrands]);

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
      status: '',
      category: '',
      brand: ''
    };
    setSearchParams(newSearchParams);
    setCurrentPage(1);
  };

  // 显示添加/编辑模态框
  const showModal = (product?: Product) => {
    setEditingProduct(product || null);
    
    // 确保品牌和分类数据已加载
    if (brands.length === 0) {
      fetchBrands();
    }
    if (categories.length === 0) {
      fetchCategories();
    }
    
    setIsModalVisible(true);
    
    // 延迟设置表单值，确保modal完全打开
    setTimeout(() => {
      if (product) {
        form.setFieldsValue({
          name: product.name,
          brand: product.brand,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice,
          stock: product.stock,
          status: product.status,
          weight: product.weight,
          shelf_life: product.shelf_life,
          origin: product.origin,
          flavor: product.flavor,
          minStock: product.minStock || 10,
          tags: product.tags?.join(',') || '',
          description: product.description,
          image: product.image
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: '上架',
          stock: 0,
          price: undefined,
          originalPrice: undefined,
          minStock: 10
        });
      }
    }, 100);
  };

  // 显示商品详情
  const showDetail = (product: Product) => {
    setViewingProduct(product);
    setIsDetailVisible(true);
  };

  // 处理保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // 处理标签
      if (values.tags && typeof values.tags === 'string') {
        values.tags = values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
      }

      // 验证原价不能低于售价
      if (values.originalPrice && values.originalPrice < values.price) {
        message.warning('原价不能低于售价');
        return;
      }

      let response;
      if (editingProduct) {
        response = await updateProduct(editingProduct._id, values);
      } else {
        response = await createProduct(values);
      }

      if (response.code === 0) {
        message.success(editingProduct ? '更新商品成功' : '创建商品成功');
        setIsModalVisible(false);
        form.resetFields();
        fetchProducts();
      } else {
        message.error(response.message || '保存失败');
      }
    } catch (error: any) {
      console.error('保存失败:', error);
      if (error.errorFields) {
        message.error('请检查表单填写是否完整');
      } else {
        message.error(error.message || '保存失败，请稍后重试');
      }
    }
  };

  // 删除商品
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteProduct(id);
      if (response.code === 0) {
        message.success('删除成功');
        fetchProducts();
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
      message.warning('请选择要删除的商品');
      return;
    }

    try {
      const response = await batchDeleteProducts(selectedRowKeys as string[]);
      if (response.code === 0) {
        message.success('批量删除成功');
        setSelectedRowKeys([]);
        fetchProducts();
      } else {
        message.error(response.message || '批量删除失败');
      }
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  // 更新商品状态
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await updateProductStatus(id, status);
      if (response.code === 0) {
        message.success('状态更新成功');
        fetchProducts();
      } else {
        message.error(response.message || '状态更新失败');
      }
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 渲染分类选项
  const renderCategoryOptions = (categories: Category[], level = 0) => {
    return categories.map(category => (
      <Option key={category._id} value={category.name}>
        {'　'.repeat(level)}{category.name}
      </Option>
    ));
  };

  const columns = [
    {
      title: '商品图片',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image: string) => (
        <Image 
          width={60} 
          height={60} 
          src={image || 'https://via.placeholder.com/60'} 
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8O+L0=="
          style={{ borderRadius: 8 }}
        />
      ),
    },
    {
      title: '商品信息',
      key: 'productInfo',
      width: 200,
      render: (record: Product) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{record.name}</div>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>
            品牌：{record.brand}
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>
            SKU：{record.sku || '未设置'}
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: '价格',
      key: 'price',
      width: 120,
      render: (record: Product) => (
        <div>
          <div style={{ color: '#f50', fontWeight: 'bold' }}>¥{record.price}</div>
          {record.originalPrice && record.originalPrice > record.price && (
            <div style={{ 
              fontSize: 12, 
              color: '#999', 
              textDecoration: 'line-through' 
            }}>
              ¥{record.originalPrice}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      render: (stock: number, record: Product) => {
        const isLowStock = stock <= (record.minStock || 10);
        return (
          <Badge 
            status={isLowStock ? 'error' : stock > 50 ? 'success' : 'warning'} 
            text={
              <span style={{ color: isLowStock ? '#ff4d4f' : undefined }}>
                {stock}
                {isLowStock && ' (低库存)'}
              </span>
            }
          />
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: Product) => (
        <Select
          value={status}
          size="small"
          style={{ width: 80 }}
          onChange={(value) => handleStatusChange(record._id, value)}
        >
          <Option value="上架">
            <Tag color="green">上架</Tag>
          </Option>
          <Option value="下架">
            <Tag color="red">下架</Tag>
          </Option>
          <Option value="缺货">
            <Tag color="orange">缺货</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: '评分/销量',
      key: 'ratingAndSales',
      width: 120,
      render: (record: Product) => (
        <div>
          <div style={{ marginBottom: 2 }}>
            <StarOutlined style={{ color: '#fadb14', marginRight: 4 }} />
            <span>{record.rating || 0}</span>
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>
            销量：{record.sales || 0}
          </div>
        </div>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <div>
          {tags?.slice(0, 2).map((tag, index) => (
            <Tag key={index} color="cyan" style={{ marginBottom: 4 }}>
              {tag}
            </Tag>
          ))}
          {tags?.length > 2 && (
            <Tooltip title={tags.slice(2).join(', ')}>
              <Tag color="default">+{tags.length - 2}</Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (record: Product) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => showDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="link"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除这个商品吗？"
            description="删除后无法恢复，请谨慎操作"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="link"
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
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
              placeholder="搜索商品名称、描述"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item name="category">
            <Select
              placeholder="选择分类"
              style={{ width: 150 }}
              allowClear
            >
              {renderCategoryOptions(categories)}
            </Select>
          </Form.Item>
          <Form.Item name="brand">
            <Select
              placeholder="选择品牌"
              style={{ width: 150 }}
              allowClear
            >
              {brands.map(brand => (
                <Option key={brand._id} value={brand.name}>{brand.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status">
            <Select
              placeholder="选择状态"
              style={{ width: 120 }}
              allowClear
            >
              <Option value="上架">上架</Option>
              <Option value="下架">下架</Option>
              <Option value="缺货">缺货</Option>
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
                新增商品
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
                onClick={() => fetchProducts()}
              >
                刷新
              </Button>
              <Button icon={<ExportOutlined />}>
                导出
              </Button>
              <Button icon={<ImportOutlined />}>
                导入
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={products}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1200 }}
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
        title={editingProduct ? '编辑商品' : '新增商品'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingProduct(null);
        }}
        width={800}
        destroyOnClose
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: '上架',
            stock: 0,
            price: 0,
            originalPrice: 0,
            minStock: 10
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="商品名称"
                name="name"
                rules={[{ required: true, message: '请输入商品名称' }]}
              >
                <Input placeholder="请输入商品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="品牌"
                name="brand"
                rules={[{ required: true, message: '请选择品牌' }]}
              >
                <Select 
                  placeholder="请选择品牌"
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) => {
                    const label = String(option?.label ?? '')
                    return label.toLowerCase().includes(input.toLowerCase())
                  }}
                  notFoundContent={brands.length === 0 ? "暂无数据，请先添加品牌" : "未找到匹配的品牌"}
                >
                  {brands.map(brand => (
                    <Option key={brand._id} value={brand.name}>{brand.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="分类"
                name="category"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select 
                  placeholder="请选择分类"
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) => {
                    const label = String(option?.label ?? '')
                    return label.toLowerCase().includes(input.toLowerCase())
                  }}
                  notFoundContent={categories.length === 0 ? "暂无数据，请先添加分类" : "未找到匹配的分类"}
                >
                  {renderCategoryOptions(categories)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select>
                  <Option value="上架">上架</Option>
                  <Option value="下架">下架</Option>
                  <Option value="缺货">缺货</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="售价"
                name="price"
                rules={[
                  { required: true, message: '请输入售价' },
                  { type: 'number', min: 0.01, message: '售价必须大于0' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0.01}
                  precision={2}
                  placeholder="请输入售价"
                  prefix="¥"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                label="原价" 
                name="originalPrice"
                rules={[
                  { type: 'number', min: 0, message: '原价不能为负数' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="请输入原价（可选）"
                  prefix="¥"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="库存"
                name="stock"
                rules={[
                  { required: true, message: '请输入库存数量' },
                  { type: 'number', min: 0, message: '库存不能为负数' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="请输入库存数量"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="重量" name="weight">
                <Input placeholder="如：150g" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="保质期" name="shelf_life">
                <Input placeholder="如：12个月" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="产地" name="origin">
                <Input placeholder="请输入产地" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="口味" name="flavor">
                <Input placeholder="请输入口味" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="最低库存预警" 
                name="minStock"
                rules={[
                  { type: 'number', min: 0, message: '最低库存不能为负数' }
                ]}
                tooltip="当商品库存低于此值时会发出预警提示"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="库存低于此值时预警"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="标签" name="tags">
            <Input placeholder="请输入标签，用逗号分隔" />
          </Form.Item>

          <Form.Item label="商品描述" name="description">
            <TextArea rows={3} placeholder="请输入商品描述" />
          </Form.Item>

          <Form.Item label="商品图片" name="image">
            <Input placeholder="请输入图片URL" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 商品详情抽屉 */}
      <Drawer
        title="商品详情"
        placement="right"
        width={600}
        open={isDetailVisible}
        onClose={() => setIsDetailVisible(false)}
      >
        {viewingProduct && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Image
                width={200}
                height={200}
                src={viewingProduct.image || 'https://via.placeholder.com/200'}
                style={{ borderRadius: 8 }}
              />
            </div>
            
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="商品名称" span={2}>
                {viewingProduct.name}
              </Descriptions.Item>
              <Descriptions.Item label="品牌">
                {viewingProduct.brand}
              </Descriptions.Item>
              <Descriptions.Item label="分类">
                {viewingProduct.category}
              </Descriptions.Item>
              <Descriptions.Item label="SKU">
                {viewingProduct.sku || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={viewingProduct.status === '上架' ? 'green' : viewingProduct.status === '下架' ? 'red' : 'orange'}>
                  {viewingProduct.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="价格库存" bordered column={2}>
              <Descriptions.Item label="售价">
                <span style={{ color: '#f50', fontWeight: 'bold' }}>
                  ¥{viewingProduct.price}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="原价">
                {viewingProduct.originalPrice ? `¥${viewingProduct.originalPrice}` : '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="库存">
                {viewingProduct.stock}
              </Descriptions.Item>
              <Descriptions.Item label="最低库存">
                {viewingProduct.minStock || 10}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="商品属性" bordered column={2}>
              <Descriptions.Item label="重量">
                {viewingProduct.weight || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="保质期">
                {viewingProduct.shelf_life || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="产地">
                {viewingProduct.origin || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="口味">
                {viewingProduct.flavor || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="评分">
                <StarOutlined style={{ color: '#fadb14', marginRight: 4 }} />
                {viewingProduct.rating || 0}
              </Descriptions.Item>
              <Descriptions.Item label="销量">
                {viewingProduct.sales || 0}
              </Descriptions.Item>
            </Descriptions>

            {viewingProduct.tags && viewingProduct.tags.length > 0 && (
              <>
                <Divider />
                <div>
                  <h4>标签</h4>
                  <div>
                    {viewingProduct.tags.map((tag, index) => (
                      <Tag key={index} color="cyan" style={{ marginBottom: 8 }}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              </>
            )}

            {viewingProduct.description && (
              <>
                <Divider />
                <div>
                  <h4>商品描述</h4>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{viewingProduct.description}</p>
                </div>
              </>
            )}

            <Divider />

            <Descriptions title="时间信息" bordered column={1}>
              <Descriptions.Item label="创建时间">
                {new Date(viewingProduct.createTime).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {new Date(viewingProduct.updateTime).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ProductManagement; 