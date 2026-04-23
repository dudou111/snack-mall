import React, { useState, useEffect } from "react";
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
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  getOrderList,
  updateOrderStatus,
  deleteOrder,
  batchDeleteOrders,
  getOrderDetail,
  type Order,
  type OrderListParams,
} from "../../api/order";
import dayjs from "dayjs";
import styles from "@/assets/styles/orders/orderList.module.scss";

const { Option } = Select;
const { RangePicker } = DatePicker;

function getOrderItemImage(item: Order["items"][number]): string {
  return typeof item.productId === "object" ? item.productId.image || "" : "";
}

function renderProductImage(image: string, fallbackClassName: string) {
  return image ? (
    <img src={image} alt="商品图片" />
  ) : (
    <div className={fallbackClassName}>无图</div>
  );
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
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
        ...params,
      });

      if (response.code === 0) {
        setOrders(response.data.orders);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
        }));
      } else {
        message.error(response.message || "获取订单列表失败");
      }
    } catch (error) {
      message.error("网络错误，请稍后重试");
      console.error("获取订单列表错误:", error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索处理
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchOrders({ page: 1 });
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({});
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchOrders({ page: 1 });
  };

  // 更新订单状态
  const handleStatusUpdate = async (
    id: string,
    field: string,
    value: string,
  ) => {
    const statusKey = `${field}_${id}`;
    setUpdatingStatus((prev) => ({ ...prev, [statusKey]: true }));

    try {
      const response = await updateOrderStatus(id, { [field]: value });
      if (response.code === 0) {
        message.success("状态更新成功");
        fetchOrders();
      } else {
        message.error(response.message || "状态更新失败");
      }
    } catch (error) {
      message.error("网络错误，请稍后重试");
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [statusKey]: false }));
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
        message.error("获取订单详情失败");
      }
    } catch (error) {
      message.error("网络错误，请稍后重试");
    }
  };

  // 删除订单
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteOrder(id);
      if (response.code === 0) {
        message.success("删除成功");
        fetchOrders();
      } else {
        message.error(response.message || "删除失败");
      }
    } catch (error) {
      message.error("网络错误，请稍后重试");
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要删除的订单");
      return;
    }

    try {
      const response = await batchDeleteOrders(selectedRowKeys);
      if (response.code === 0) {
        message.success("批量删除成功");
        setSelectedRowKeys([]);
        fetchOrders();
      } else {
        message.error(response.message || "批量删除失败");
      }
    } catch (error) {
      message.error("网络错误，请稍后重试");
    }
  };

  // 页面初始化
  useEffect(() => {
    fetchOrders();
  }, [pagination.current, pagination.pageSize]);

  const columns = [
    {
      title: "客户信息",
      key: "customer",
      width: 180,
      render: (record: Order) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{record.customer.name}</div>
          <div style={{ fontSize: 12, color: "#999" }}>
            {record.customer.phone}
          </div>
        </div>
      ),
    },
    {
      title: "商品",
      dataIndex: "items",
      key: "items",
      width: 280,
      render: (items: Order["items"]) => (
        <div className={styles.orderProductStack}>
          {items.slice(0, 2).map((item, index) => (
            <div className={styles.orderProductItem} key={`${item.productName}-${index}`}>
              <div className={styles.orderProductThumb}>
                {renderProductImage(getOrderItemImage(item), styles.orderProductFallback)}
              </div>
              <div>
                <div className={styles.orderProductName}>{item.productName}</div>
                <div className={styles.orderProductMeta}>
                  ¥{item.price.toFixed(2)} x {item.quantity}
                </div>
              </div>
            </div>
          ))}
          {items.length > 2 && (
            <span className={styles.orderMoreText}>另有 {items.length - 2} 件商品</span>
          )}
        </div>
      ),
    },
    {
      title: "订单金额",
      dataIndex: "actualAmount",
      key: "actualAmount",
      width: 100,
      render: (amount: number) => (
        <span style={{ color: "#f50", fontWeight: "bold" }}>
          ¥{amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: "订单状态",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string, record: Order) => {
        const isUpdating = updatingStatus[`status_${record._id}`];

        return (
          <Select
            value={status}
            style={{ width: "100%" }}
            size="small"
            loading={isUpdating}
            disabled={isUpdating}
            onChange={(value) =>
              handleStatusUpdate(record._id, "status", value)
            }
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
      title: "支付状态",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 100,
      render: (status: string, record: Order) => {
        const isUpdating = updatingStatus[`paymentStatus_${record._id}`];

        return (
          <Select
            value={status}
            style={{ width: "100%" }}
            size="small"
            loading={isUpdating}
            disabled={isUpdating}
            onChange={(value) =>
              handleStatusUpdate(record._id, "paymentStatus", value)
            }
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
      title: "配送状态",
      dataIndex: "deliveryStatus",
      key: "deliveryStatus",
      width: 100,
      render: (status: string, record: Order) => {
        const isUpdating = updatingStatus[`deliveryStatus_${record._id}`];

        return (
          <Select
            value={status}
            style={{ width: "100%" }}
            size="small"
            loading={isUpdating}
            disabled={isUpdating}
            onChange={(value) =>
              handleStatusUpdate(record._id, "deliveryStatus", value)
            }
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
      title: "退款状态",
      dataIndex: "refund",
      key: "refund",
      width: 100,
      render: (refund: Order["refund"]) => {
        if (!refund || refund.reviewStatus === "无") {
          return <Tag color="default">无退款</Tag>;
        }

        const statusConfig = {
          待处理: { color: "orange", text: "待处理" },
          已通过: { color: "green", text: "已通过" },
          已驳回: { color: "red", text: "已驳回" },
        };

        const config =
          statusConfig[refund.reviewStatus as keyof typeof statusConfig];
        return config ? <Tag color={config.color}>{config.text}</Tag> : null;
      },
    },
    {
      title: "下单时间",
      dataIndex: "orderTime",
      key: "orderTime",
      width: 150,
      render: (time: string) => dayjs(time).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "操作",
      key: "action",
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
          {record.status === "已取消" && (
            <Popconfirm
              title="确定要删除这个订单吗？"
              onConfirm={() => handleDelete(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />} size="small">
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
      disabled: record.status !== "已取消",
    }),
  };

  return (
    <Card>
      {/* 搜索栏 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="搜索客户姓名或手机号"
            prefix={<SearchOutlined />}
            value={searchParams.keyword}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, keyword: e.target.value }))
            }
            onPressEnter={handleSearch}
          />
        </Col>
        <Col span={4}>
          <Select
            placeholder="订单状态"
            style={{ width: "100%" }}
            allowClear
            value={searchParams.status}
            onChange={(value) =>
              setSearchParams((prev) => ({ ...prev, status: value }))
            }
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
            style={{ width: "100%" }}
            allowClear
            value={searchParams.paymentStatus}
            onChange={(value) =>
              setSearchParams((prev) => ({ ...prev, paymentStatus: value }))
            }
          >
            <Option value="已支付">已支付</Option>
            <Option value="未支付">未支付</Option>
            <Option value="已退款">已退款</Option>
          </Select>
        </Col>
        <Col span={6}>
          <RangePicker
            style={{ width: "100%" }}
            onChange={(dates) => {
              if (dates) {
                setSearchParams((prev) => ({
                  ...prev,
                  startDate: dates[0]?.format("YYYY-MM-DD"),
                  endDate: dates[1]?.format("YYYY-MM-DD"),
                }));
              } else {
                setSearchParams((prev) => {
                  const { startDate, endDate, ...rest } = prev;
                  return rest;
                });
              }
            }}
          />
        </Col>
        <Col span={4}>
          <Space>
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
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
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPagination((prev) => ({
              ...prev,
              current: page,
              pageSize: pageSize || 10,
            }));
          },
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
          <div className={styles.orderDetailBody}>
            <section className={styles.orderDetailHero}>
              <span className={styles.orderDetailKicker}>ORDER DETAIL</span>
              <div className={styles.orderDetailHeroMain}>
                <div>
                  <h2 className={styles.orderCustomerName}>{currentOrder.customer.name}</h2>
                  <div className={styles.orderDetailTime}>
                    下单时间 {dayjs(currentOrder.orderTime).format("YYYY-MM-DD HH:mm:ss")}
                  </div>
                  <Space wrap style={{ marginTop: 12 }}>
                    <Tag color="blue">{currentOrder.status}</Tag>
                    <Tag color={currentOrder.paymentStatus === "已支付" ? "green" : "orange"}>
                      {currentOrder.paymentStatus}
                    </Tag>
                    <Tag color="gold">{currentOrder.deliveryStatus}</Tag>
                  </Space>
                </div>
                <div className={styles.orderAmount}>
                  <span>实付金额</span>
                  <strong>¥{currentOrder.actualAmount.toFixed(2)}</strong>
                </div>
              </div>
            </section>

            <div className={styles.orderDetailGrid}>
              <section className={styles.detailCard}>
                <h3>商品信息</h3>
                <div className={styles.detailProducts}>
                  {currentOrder.items.map((item, index) => (
                    <div className={styles.detailProductItem} key={`${item.productName}-${index}`}>
                      <div className={styles.detailProductImage}>
                        {renderProductImage(getOrderItemImage(item), styles.detailProductFallback)}
                      </div>
                      <div>
                        <div className={styles.detailProductName}>{item.productName}</div>
                        <div className={styles.detailProductMeta}>
                          单价 ¥{item.price.toFixed(2)} x {item.quantity}
                        </div>
                      </div>
                      <div className={styles.detailProductTotal}>¥{item.subtotal.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.detailCard}>
                <h3>收货信息</h3>
                <div className={styles.detailLine}>
                  <span>姓名</span>
                  <strong>{currentOrder.customer.name}</strong>
                </div>
                <div className={styles.detailLine}>
                  <span>电话</span>
                  <strong>{currentOrder.customer.phone}</strong>
                </div>
                <div className={styles.detailLine}>
                  <span>地址</span>
                  <strong>{currentOrder.customer.address}</strong>
                </div>
              </section>
            </div>

            <div className={styles.orderDetailGrid}>
              <section className={styles.detailCard}>
                <h3>金额信息</h3>
                <div className={styles.detailLine}>
                  <span>商品总额</span>
                  <strong>¥{currentOrder.totalAmount.toFixed(2)}</strong>
                </div>
                <div className={styles.detailLine}>
                  <span>配送费</span>
                  <strong>¥{currentOrder.deliveryFee.toFixed(2)}</strong>
                </div>
                <div className={styles.detailLine}>
                  <span>优惠金额</span>
                  <strong>-¥{currentOrder.discountAmount.toFixed(2)}</strong>
                </div>
                <div className={styles.detailLine}>
                  <span>实付金额</span>
                  <strong>¥{currentOrder.actualAmount.toFixed(2)}</strong>
                </div>
              </section>

              <section className={styles.detailCard}>
                <h3>支付信息</h3>
                <div className={styles.detailLine}>
                  <span>支付方式</span>
                  <strong>{currentOrder.paymentMethod || "-"}</strong>
                </div>
                <div className={styles.detailLine}>
                  <span>支付状态</span>
                  <strong>{currentOrder.paymentStatus}</strong>
                </div>
                {currentOrder.paymentProvider ? (
                  <div className={styles.detailLine}>
                    <span>支付通道</span>
                    <strong>{currentOrder.paymentProvider}</strong>
                  </div>
                ) : null}
                {currentOrder.stripePaymentStatus ? (
                  <div className={styles.detailLine}>
                    <span>Stripe状态</span>
                    <strong>{currentOrder.stripePaymentStatus}</strong>
                  </div>
                ) : null}
                {currentOrder.paymentMockNo || currentOrder.stripePaymentIntentId ? (
                  <div className={styles.detailLine}>
                    <span>支付流水</span>
                    <strong>{currentOrder.paymentMockNo || currentOrder.stripePaymentIntentId}</strong>
                  </div>
                ) : null}
                {currentOrder.paymentFailReason ? (
                  <div className={styles.detailLine}>
                    <span>失败原因</span>
                    <strong>{currentOrder.paymentFailReason}</strong>
                  </div>
                ) : null}
              </section>
            </div>

            {currentOrder.refund && currentOrder.refund.reviewStatus !== "无" ? (
              <section className={`${styles.detailCard} ${styles.refundBlock}`}>
                <h3>退款信息</h3>
                <div className={styles.detailLine}>
                  <span>退款状态</span>
                  <strong>
                    {currentOrder.refund.reviewStatus === "待处理" && <Tag color="orange">待处理</Tag>}
                    {currentOrder.refund.reviewStatus === "已通过" && <Tag color="green">已通过</Tag>}
                    {currentOrder.refund.reviewStatus === "已驳回" && <Tag color="red">已驳回</Tag>}
                  </strong>
                </div>
                {currentOrder.refund.applyTime ? (
                  <div className={styles.detailLine}>
                    <span>申请时间</span>
                    <strong>{dayjs(currentOrder.refund.applyTime).format("YYYY-MM-DD HH:mm:ss")}</strong>
                  </div>
                ) : null}
                {currentOrder.refund.applyReason ? (
                  <div className={styles.detailLine}>
                    <span>申请原因</span>
                    <strong>{currentOrder.refund.applyReason}</strong>
                  </div>
                ) : null}
                {currentOrder.refund.applyAmount ? (
                  <div className={styles.detailLine}>
                    <span>申请金额</span>
                    <strong>¥{currentOrder.refund.applyAmount.toFixed(2)}</strong>
                  </div>
                ) : null}
                {currentOrder.refund.rejectReason ? (
                  <div className={styles.detailLine}>
                    <span>驳回原因</span>
                    <strong>{currentOrder.refund.rejectReason}</strong>
                  </div>
                ) : null}
              </section>
            ) : null}

            {currentOrder.remark ? (
              <section className={styles.detailCard}>
                <h3>订单备注</h3>
                <div>{currentOrder.remark}</div>
              </section>
            ) : null}
          </div>
        )}
      </Drawer>
    </Card>
  );
}
