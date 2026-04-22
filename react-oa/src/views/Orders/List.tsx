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
  Popconfirm,
  DatePicker,
  Drawer,
  Alert
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  DeleteOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import { 
  getOrderList, 
  updateOrderStatus, 
  deleteOrder, 
  batchDeleteOrders,
  getOrderDetail,
  type Order,
  type OrderListParams 
} from '../../api/order';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<{ [key: string]: boolean }>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState<OrderListParams>({});
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // 获取订单列表
  const fetchOrders = async (params: OrderListParams = {}) => {
    setLoading(true);
    try {
      const response = await getOrderList({
        page: pagination.current,
        limit: pagination.pageSize,
        ...searchParams,
        ...params
      });

      if (response.code === 0) {
        setOrders(response.data.orders);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total
        }));
      } else {
        message.error(response.message || '获取订单列表失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
      console.error('获取订单列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索处理
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchOrders({ page: 1 });
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({});
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchOrders({ page: 1 });
  };

  // 更新订单状态
  const handleStatusUpdate = async (id: string, field: string, value: string) => {
    const statusKey = `${field}_${id}`;
    setUpdatingStatus(prev => ({ ...prev, [statusKey]: true }));

    try {
      const response = await updateOrderStatus(id, { [field]: value });
      if (response.code === 0) {
        message.success('状态更新成功');
        fetchOrders();
      } else {
        message.error(response.message || '状态更新失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [statusKey]: false }));
    }
  };

  // 查看订单详情
  const handleViewDetail = async (record: Order) => {
    try {
      const response = await getOrderDetail(record._id);
      if (response.code === 0) {
        setCurrentOrder(response.data);
        setDetailVisible(true);
      } else {
        message.error('获取订单详情失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    }
  };

  // 删除订单
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteOrder(id);
      if (response.code === 0) {
        message.success('删除成功');
        fetchOrders();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的订单');
      return;
    }

    try {
      const response = await batchDeleteOrders(selectedRowKeys);
      if (response.code === 0) {
        message.success('批量删除成功');
        setSelectedRowKeys([]);
        fetchOrders();
      } else {
        message.error(response.message || '批量删除失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    }
  };

  // 页面初始化
  useEffect(() => {
    fetchOrders();
  }, [pagination.current, pagination.pageSize]);

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 150,
    },
    {
      title: '客户信息',
      key: 'customer',
      width: 150,
      render: (record: Order) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.customer.name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.customer.phone}</div>
        </div>
      ),
    },
    {
      title: '商品',
      dataIndex: 'items',
      key: 'items',
      width: 200,
      render: (items: Order['items']) => (
        <div>
          {items.slice(0, 2).map((item, index) => (
            <Tag key={index} style={{ margin: '2px' }}>
              {item.productName} x{item.quantity}
            </Tag>
          ))}
          {items.length > 2 && (
            <span style={{ color: '#999' }}>等{items.length}件</span>
          )}
        </div>
      ),
    },
    {
      title: '订单金额',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      width: 100,
      render: (amount: number) => (
        <span style={{ color: '#f50', fontWeight: 'bold' }}>¥{amount.toFixed(2)}</span>
      ),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record: Order) => {
        const isUpdating = updatingStatus[`status_${record._id}`];
        
        return (
          <Select
            value={status}
            style={{ width: '100%' }}
            size="small"
            loading={isUpdating}
            disabled={isUpdating}
            onChange={(value) => handleStatusUpdate(record._id, 'status', value)}
          >
            <Option value="待支付">
              <Tag color="orange">待支付</Tag>
            </Option>
            <Option value="待发货">
              <Tag color="blue">待发货</Tag>
            </Option>
            <Option value="配送中">
              <Tag color="purple">配送中</Tag>
            </Option>
            <Option value="已完成">
              <Tag color="green">已完成</Tag>
            </Option>
            <Option value="已取消">
              <Tag color="red">已取消</Tag>
            </Option>
          </Select>
        );
      },
    },
    {
      title: '支付状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 100,
      render: (status: string, record: Order) => {
        const isUpdating = updatingStatus[`paymentStatus_${record._id}`];
        
        return (
          <Select
            value={status}
            style={{ width: '100%' }}
            size="small"
            loading={isUpdating}
            disabled={isUpdating}
            onChange={(value) => handleStatusUpdate(record._id, 'paymentStatus', value)}
          >
            <Option value="未支付">
              <Tag color="orange">未支付</Tag>
            </Option>
            <Option value="已支付">
              <Tag color="green">已支付</Tag>
            </Option>
            <Option value="已退款">
              <Tag color="red">已退款</Tag>
            </Option>
          </Select>
        );
      },
    },
    {
      title: '配送状态',
      dataIndex: 'deliveryStatus',
      key: 'deliveryStatus',
      width: 100,
      render: (status: string, record: Order) => {
        const isUpdating = updatingStatus[`deliveryStatus_${record._id}`];

        return (
          <Select
            value={status}
            style={{ width: '100%' }}
            size="small"
            loading={isUpdating}
            disabled={isUpdating}
            onChange={(value) => handleStatusUpdate(record._id, 'deliveryStatus', value)}
          >
            <Option value="待发货">
              <Tag color="orange">待发货</Tag>
            </Option>
            <Option value="配送中">
              <Tag color="blue">配送中</Tag>
            </Option>
            <Option value="已送达">
              <Tag color="green">已送达</Tag>
            </Option>
            <Option value="配送失败">
              <Tag color="red">配送失败</Tag>
            </Option>
          </Select>
        );
      },
    },
    {
      title: '退款状态',
      dataIndex: 'refund',
      key: 'refund',
      width: 100,
      render: (refund: Order['refund']) => {
        if (!refund || refund.reviewStatus === '无') {
          return <Tag color="default">无退款</Tag>;
        }

        const statusConfig = {
          '待处理': { color: 'orange', text: '待处理' },
          '已通过': { color: 'green', text: '已通过' },
          '已驳回': { color: 'red', text: '已驳回' }
        };

        const config = statusConfig[refund.reviewStatus as keyof typeof statusConfig];
        return config ? <Tag color={config.color}>{config.text}</Tag> : null;
      },
    },
    {
      title: '下单时间',
      dataIndex: 'orderTime',
      key: 'orderTime',
      width: 150,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (record: Order) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === '已取消' && (
            <Popconfirm
              title="确定要删除这个订单吗？"
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

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys as string[]);
    },
    getCheckboxProps: (record: Order) => ({
      disabled: record.status !== '已取消',
    }),
  };

  return (
    <Card>
      <Alert
        message="📦 订单状态管理功能"
        description={
          <div>
            <p><strong>订单状态</strong>: 待支付 → 待发货 → 配送中 → 已完成（或已取消）</p>
            <p><strong>支付状态</strong>: 未支付 → 已支付（或已退款）</p>
            <p><strong>配送状态</strong>: 待发货 → 配送中 → 已送达（或配送失败）</p>
            <p><strong>智能更新</strong>: 选择新状态后自动同步到数据库，支持实时状态跟踪</p>
          </div>
        }
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
      />
      
      {/* 搜索栏 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="搜索订单号或客户姓名"
            prefix={<SearchOutlined />}
            value={searchParams.keyword}
            onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
        </Col>
        <Col span={4}>
          <Select 
            placeholder="订单状态" 
            style={{ width: '100%' }} 
            allowClear
            value={searchParams.status}
            onChange={(value) => setSearchParams(prev => ({ ...prev, status: value }))}
          >
            <Option value="待支付">待支付</Option>
            <Option value="待发货">待发货</Option>
            <Option value="配送中">配送中</Option>
            <Option value="已完成">已完成</Option>
            <Option value="已取消">已取消</Option>
          </Select>
        </Col>
        <Col span={4}>
          <Select 
            placeholder="支付状态" 
            style={{ width: '100%' }} 
            allowClear
            value={searchParams.paymentStatus}
            onChange={(value) => setSearchParams(prev => ({ ...prev, paymentStatus: value }))}
          >
            <Option value="已支付">已支付</Option>
            <Option value="未支付">未支付</Option>
            <Option value="已退款">已退款</Option>
          </Select>
        </Col>
        <Col span={6}>
          <RangePicker
            style={{ width: '100%' }}
            onChange={(dates) => {
              if (dates) {
                setSearchParams(prev => ({
                  ...prev,
                  startDate: dates[0]?.format('YYYY-MM-DD'),
                  endDate: dates[1]?.format('YYYY-MM-DD')
                }));
              } else {
                setSearchParams(prev => {
                  const { startDate, endDate, ...rest } = prev;
                  return rest;
                });
              }
            }}
          />
        </Col>
        <Col span={4}>
          <Space>
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Button onClick={handleReset}>重置</Button>
            <Button icon={<ReloadOutlined />} onClick={() => fetchOrders()} />
          </Space>
        </Col>
      </Row>

      {/* 批量操作 */}
      {selectedRowKeys.length > 0 && (
        <Row style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <span>已选择 {selectedRowKeys.length} 项</span>
              <Popconfirm
                title="确定要批量删除选中的订单吗？"
                onConfirm={handleBatchDelete}
                okText="确定"
                cancelText="取消"
              >
                <Button danger>批量删除</Button>
              </Popconfirm>
              <Button onClick={() => setSelectedRowKeys([])}>取消选择</Button>
            </Space>
          </Col>
        </Row>
      )}

      {/* 订单表格 */}
      <Table
        columns={columns}
        dataSource={orders}
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

      {/* 订单详情抽屉 */}
      <Drawer
        title="订单详情"
        placement="right"
        size="large"
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
      >
        {currentOrder && (
          <div>
            <h3>基本信息</h3>
            <p><strong>订单号：</strong>{currentOrder.orderNumber}</p>
            <p><strong>下单时间：</strong>{dayjs(currentOrder.orderTime).format('YYYY-MM-DD HH:mm:ss')}</p>
            
            <h3>客户信息</h3>
            <p><strong>姓名：</strong>{currentOrder.customer.name}</p>
            <p><strong>电话：</strong>{currentOrder.customer.phone}</p>
            <p><strong>地址：</strong>{currentOrder.customer.address}</p>
            
            <h3>商品信息</h3>
            {currentOrder.items.map((item, index) => (
              <div key={index} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <p><strong>{item.productName}</strong></p>
                <p>单价：¥{item.price.toFixed(2)} × {item.quantity} = ¥{item.subtotal.toFixed(2)}</p>
              </div>
            ))}
            
            <h3>金额信息</h3>
            <p><strong>商品总额：</strong>¥{currentOrder.totalAmount.toFixed(2)}</p>
            <p><strong>配送费：</strong>¥{currentOrder.deliveryFee.toFixed(2)}</p>
            <p><strong>优惠金额：</strong>-¥{currentOrder.discountAmount.toFixed(2)}</p>
            <p><strong>实付金额：</strong>¥{currentOrder.actualAmount.toFixed(2)}</p>

            <h3>支付信息</h3>
            <p><strong>支付方式：</strong>{currentOrder.paymentMethod || '-'}</p>
            <p><strong>支付状态：</strong>{currentOrder.paymentStatus}</p>
            {currentOrder.paymentProvider ? <p><strong>支付通道：</strong>{currentOrder.paymentProvider}</p> : null}
            {currentOrder.stripePaymentIntentId ? <p><strong>Stripe流水：</strong>{currentOrder.stripePaymentIntentId}</p> : null}
            {currentOrder.stripePaymentStatus ? <p><strong>Stripe状态：</strong>{currentOrder.stripePaymentStatus}</p> : null}
            {currentOrder.paymentMockNo ? <p><strong>支付流水：</strong>{currentOrder.paymentMockNo}</p> : null}
            {currentOrder.paymentFailReason ? <p><strong>失败原因：</strong>{currentOrder.paymentFailReason}</p> : null}

            {currentOrder.refund && currentOrder.refund.reviewStatus !== '无' && (
              <>
                <h3>退款信息</h3>
                <p><strong>退款状态：</strong>
                  {currentOrder.refund.reviewStatus === '待处理' && <Tag color="orange">待处理</Tag>}
                  {currentOrder.refund.reviewStatus === '已通过' && <Tag color="green">已通过</Tag>}
                  {currentOrder.refund.reviewStatus === '已驳回' && <Tag color="red">已驳回</Tag>}
                </p>
                {currentOrder.refund.applyTime && (
                  <p><strong>申请时间：</strong>{dayjs(currentOrder.refund.applyTime).format('YYYY-MM-DD HH:mm:ss')}</p>
                )}
                {currentOrder.refund.applyReason && (
                  <p><strong>申请原因：</strong>{currentOrder.refund.applyReason}</p>
                )}
                {currentOrder.refund.applyAmount && (
                  <p><strong>申请金额：</strong>¥{currentOrder.refund.applyAmount.toFixed(2)}</p>
                )}
                {currentOrder.refund.rejectReason && (
                  <p><strong>驳回原因：</strong>{currentOrder.refund.rejectReason}</p>
                )}
                {currentOrder.refund.reviewTime && (
                  <p><strong>审核时间：</strong>{dayjs(currentOrder.refund.reviewTime).format('YYYY-MM-DD HH:mm:ss')}</p>
                )}
              </>
            )}

            {currentOrder.remark && (
              <>
                <h3>订单备注</h3>
                <p>{currentOrder.remark}</p>
              </>
            )}
          </div>
        )}
      </Drawer>
    </Card>
  );
} 
