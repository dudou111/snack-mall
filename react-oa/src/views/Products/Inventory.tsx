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
  DatePicker,
  message,
} from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getUploadRecords,
  type UploadRecord,
  type UploadRecordListParams,
} from '../../api/product';

const { RangePicker } = DatePicker;
const { Option } = Select;

const initialSearchParams: UploadRecordListParams = {
  keyword: '',
  status: undefined,
  startDate: undefined,
  endDate: undefined,
};

const statusColorMap: Record<string, string> = {
  上架: 'green',
  下架: 'red',
  缺货: 'orange',
};

const roleLabelMap: Record<string, string> = {
  admin: '管理员',
  merchant: '商家',
  system: '系统',
};

const Inventory: React.FC = () => {
  const [records, setRecords] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<UploadRecordListParams>(initialSearchParams);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchUploadRecords = async (params: UploadRecordListParams = {}) => {
    const nextPage = params.page || pagination.current;
    const nextPageSize = params.pageSize || pagination.pageSize;

    const query: UploadRecordListParams = {
      ...searchParams,
      ...params,
      page: nextPage,
      pageSize: nextPageSize,
    };

    setLoading(true);
    try {
      const response = await getUploadRecords(query);
      if (response.code === 0) {
        setRecords(response.data.list || []);
        setPagination({
          current: response.data.pagination?.current || nextPage,
          pageSize: response.data.pagination?.pageSize || nextPageSize,
          total: response.data.pagination?.total || 0,
        });
      }
    } catch (error: any) {
      message.error(error?.message || '获取上传记录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploadRecords({ page: 1, pageSize: pagination.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchUploadRecords({ page: 1, pageSize: pagination.pageSize });
  };

  const handleReset = () => {
    setSearchParams(initialSearchParams);
    setTimeout(() => {
      fetchUploadRecords({
        page: 1,
        pageSize: pagination.pageSize,
        keyword: '',
        status: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    }, 0);
  };

  const handleTableChange = (pageConfig: TablePaginationConfig) => {
    fetchUploadRecords({
      page: pageConfig.current || 1,
      pageSize: pageConfig.pageSize || pagination.pageSize,
    });
  };

  const columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      ellipsis: true,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 140,
      render: (sku: string) => sku || '-',
    },
    {
      title: '商家',
      dataIndex: 'merchantId',
      key: 'merchantId',
      width: 140,
      render: (merchantId: UploadRecord['merchantId']) => {
        if (!merchantId) return '-';
        if (typeof merchantId === 'string') return merchantId;
        return merchantId.username || merchantId.tel || merchantId._id;
      },
    },
    {
      title: '分类/品牌',
      key: 'categoryBrand',
      width: 160,
      render: (record: UploadRecord) => (
        <Space direction="vertical" size={0}>
          <span>{record.category || '-'}</span>
          <span style={{ color: '#888' }}>{record.brand || '-'}</span>
        </Space>
      ),
    },
    {
      title: '售价/库存',
      key: 'priceStock',
      width: 120,
      render: (record: UploadRecord) => (
        <Space direction="vertical" size={0}>
          <span style={{ color: '#f50', fontWeight: 600 }}>
            ¥{Number(record.price || 0).toFixed(2)}
          </span>
          <span style={{ color: '#666' }}>库存 {record.stock ?? 0}</span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusColorMap[status] || 'default'}>{status || '-'}</Tag>
      ),
    },
    {
      title: '上传来源',
      dataIndex: 'createdByRole',
      key: 'createdByRole',
      width: 100,
      render: (role: string) => roleLabelMap[role] || '-',
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      width: 180,
      render: (time: string) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
  ];

  return (
    <Card title="商家上传记录">
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="搜索商品名/SKU/品牌/分类"
            prefix={<SearchOutlined />}
            value={searchParams.keyword}
            onChange={(e) => setSearchParams((prev) => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
        </Col>
        <Col span={4}>
          <Select
            placeholder="商品状态"
            style={{ width: '100%' }}
            allowClear
            value={searchParams.status}
            onChange={(value) => setSearchParams((prev) => ({ ...prev, status: value }))}
          >
            <Option value="上架">上架</Option>
            <Option value="下架">下架</Option>
            <Option value="缺货">缺货</Option>
          </Select>
        </Col>
        <Col span={8}>
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
        <Col span={4}>
          <Space>
            <Button type="primary" onClick={handleSearch}>
              查询
            </Button>
            <Button onClick={handleReset}>重置</Button>
            <Button icon={<ReloadOutlined />} onClick={() => fetchUploadRecords()}>
              刷新
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={records}
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />
    </Card>
  );
};

export default Inventory;
