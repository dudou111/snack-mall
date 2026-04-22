import React, { useEffect, useState } from 'react';
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
  DatePicker,
  Modal,
  Popconfirm,
} from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getRefundList,
  reviewRefund,
  type Order,
  type RefundListParams,
} from '../../api/order';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const initialSearchParams: RefundListParams = {
  keyword: '',
  reviewStatus: undefined,
  startDate: undefined,
  endDate: undefined,
};

const reviewStatusColorMap: Record<string, string> = {
  待处理: 'orange',
  已通过: 'green',
  已驳回: 'red',
};

const Refund: React.FC = () => {
  const [refundOrders, setRefundOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<RefundListParams>(initialSearchParams);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentRejectOrder, setCurrentRejectOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitRejectLoading, setSubmitRejectLoading] = useState(false);

  const fetchRefundOrders = async (params: RefundListParams = {}) => {
    const nextPage = params.page || pagination.current;
    const nextPageSize = params.limit || params.pageSize || pagination.pageSize;

    setLoading(true);
    try {
      const response = await getRefundList({
        ...searchParams,
        ...params,
        page: nextPage,
        limit: nextPageSize,
      });

      if (response.code === 0) {
        const data = response.data;
        setRefundOrders(data.orders || []);
        setPagination({
          current: data.pagination?.current || nextPage,
          pageSize: data.pagination?.pageSize || nextPageSize,
          total: data.pagination?.total || 0,
        });
      } else {
        message.error(response.message || '获取退款列表失败');
      }
    } catch (error: any) {
      message.error(error?.message || '获取退款列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefundOrders({ page: 1, limit: pagination.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchRefundOrders({ page: 1, limit: pagination.pageSize });
  };

  const handleReset = () => {
    setSearchParams(initialSearchParams);
    setTimeout(() => {
      fetchRefundOrders({
        page: 1,
        limit: pagination.pageSize,
        keyword: '',
        reviewStatus: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    }, 0);
  };

  const handleTableChange = (pageConfig: TablePaginationConfig) => {
    fetchRefundOrders({
      page: pageConfig.current || 1,
      limit: pageConfig.pageSize || pagination.pageSize,
    });
  };

  const submitReview = async (orderId: string, action: 'approve' | 'reject', reason?: string) => {
    const loadingKey = `${action}_${orderId}`;
    setActionLoading((prev) => ({ ...prev, [loadingKey]: true }));
    try {
      const response = await reviewRefund(orderId, {
        action,
        rejectReason: reason,
      });
      if (response.code === 0) {
        message.success(response.message || '审核成功');
        fetchRefundOrders();
      } else {
        message.error(response.message || '审核失败');
      }
    } catch (error: any) {
      message.error(error?.message || '审核失败，请稍后重试');
    } finally {
      setActionLoading((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  const openRejectModal = (order: Order) => {
    setCurrentRejectOrder(order);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async () => {
    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      message.warning('请输入驳回原因');
      return;
    }
    if (!currentRejectOrder) {
      return;
    }

    setSubmitRejectLoading(true);
    await submitReview(currentRejectOrder._id, 'reject', trimmedReason);
    setSubmitRejectLoading(false);
    setRejectModalVisible(false);
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 180,
    },
    {
      title: '用户信息',
      key: 'customer',
      width: 180,
      render: (record: Order) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{record.customer?.name || '-'}</span>
          <span style={{ color: '#888' }}>{record.customer?.phone || '-'}</span>
        </Space>
      ),
    },
    {
      title: '退款金额',
      key: 'applyAmount',
      width: 120,
      render: (record: Order) => {
        const amount = record.refund?.applyAmount ?? record.actualAmount;
        return <span style={{ color: '#f50', fontWeight: 600 }}>¥{Number(amount || 0).toFixed(2)}</span>;
      },
    },
    {
      title: '申请原因',
      key: 'applyReason',
      width: 240,
      render: (record: Order) => (
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {record.refund?.applyReason || '-'}
        </div>
      ),
    },
    {
      title: '申请时间',
      key: 'applyTime',
      width: 180,
      render: (record: Order) =>
        record.refund?.applyTime ? dayjs(record.refund.applyTime).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '审核状态',
      key: 'reviewStatus',
      width: 110,
      render: (record: Order) => {
        const status = record.refund?.reviewStatus || '无';
        return <Tag color={reviewStatusColorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: '审核结果',
      key: 'reviewResult',
      width: 260,
      render: (record: Order) => {
        if (record.refund?.reviewStatus === '已驳回') {
          return (
            <Space direction="vertical" size={0}>
              <span style={{ color: '#cf1322' }}>{record.refund.rejectReason || '-'}</span>
              <span style={{ color: '#888' }}>
                {record.refund.reviewTime ? dayjs(record.refund.reviewTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </span>
            </Space>
          );
        }
        if (record.refund?.reviewStatus === '已通过') {
          return (
            <span style={{ color: '#389e0d' }}>
              {record.refund.reviewTime ? dayjs(record.refund.reviewTime).format('YYYY-MM-DD HH:mm:ss') : '已通过'}
            </span>
          );
        }
        return '-';
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (record: Order) => {
        const isPending = record.refund?.reviewStatus === '待处理';
        if (!isPending) {
          return '-';
        }

        return (
          <Space>
            <Popconfirm
              title="确认通过该退款申请吗？"
              onConfirm={() => submitReview(record._id, 'approve')}
              okText="确认"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                loading={Boolean(actionLoading[`approve_${record._id}`])}
              >
                通过
              </Button>
            </Popconfirm>
            <Button
              type="link"
              size="small"
              danger
              loading={Boolean(actionLoading[`reject_${record._id}`])}
              onClick={() => openRejectModal(record)}
            >
              驳回
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <Card title="退款审核">
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={7}>
          <Input
            placeholder="搜索订单号/用户姓名/手机号"
            prefix={<SearchOutlined />}
            value={searchParams.keyword}
            onChange={(e) => setSearchParams((prev) => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
        </Col>
        <Col span={4}>
          <Select
            placeholder="审核状态"
            style={{ width: '100%' }}
            allowClear
            value={searchParams.reviewStatus}
            onChange={(value) => setSearchParams((prev) => ({ ...prev, reviewStatus: value }))}
          >
            <Option value="待处理">待处理</Option>
            <Option value="已通过">已通过</Option>
            <Option value="已驳回">已驳回</Option>
          </Select>
        </Col>
        <Col span={7}>
          <RangePicker
            style={{ width: '100%' }}
            value={
              searchParams.startDate && searchParams.endDate
                ? [dayjs(searchParams.startDate), dayjs(searchParams.endDate)]
                : null
            }
            onChange={(dates) => {
              setSearchParams((prev) => ({
                ...prev,
                startDate: dates?.[0] ? dates[0].format('YYYY-MM-DD') : undefined,
                endDate: dates?.[1] ? dates[1].format('YYYY-MM-DD') : undefined,
              }));
            }}
          />
        </Col>
        <Col span={6}>
          <Space>
            <Button type="primary" onClick={handleSearch}>
              查询
            </Button>
            <Button onClick={handleReset}>重置</Button>
            <Button icon={<ReloadOutlined />} onClick={() => fetchRefundOrders()}>
              刷新
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={refundOrders}
        loading={loading}
        scroll={{ x: 1500 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={`驳回退款：${currentRejectOrder?.orderNumber || ''}`}
        open={rejectModalVisible}
        onOk={handleRejectSubmit}
        okText="确认驳回"
        cancelText="取消"
        confirmLoading={submitRejectLoading}
        onCancel={() => setRejectModalVisible(false)}
      >
        <TextArea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="请输入驳回原因（必填）"
          rows={4}
          maxLength={200}
          showCount
        />
      </Modal>
    </Card>
  );
};

export default Refund;
