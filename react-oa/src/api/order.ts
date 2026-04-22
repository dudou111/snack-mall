import request from './request';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 订单接口类型定义
export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  discountAmount: number;
  actualAmount: number;
  status: '待支付' | '待发货' | '配送中' | '已完成' | '已取消';
  paymentStatus: '未支付' | '已支付' | '已退款';
  deliveryStatus: '待发货' | '配送中' | '已送达' | '配送失败';
  paymentMethod: '微信支付' | '支付宝' | '现金' | 'Stripe测试支付';
  paymentProvider?: '' | 'mock' | 'stripe_test';
  stripePaymentIntentId?: string;
  stripePaymentStatus?: string;
  paymentMockNo?: string;
  paymentFailReason?: string;
  remark?: string;
  orderTime: string;
  paymentTime?: string;
  shipmentTime?: string;
  completionTime?: string;
  refund?: RefundInfo;
}

export interface RefundInfo {
  reviewStatus: '无' | '待处理' | '已通过' | '已驳回';
  applyTime?: string;
  applyReason?: string;
  applyAmount?: number;
  reviewBy?: string;
  reviewTime?: string;
  rejectReason?: string;
  refundTime?: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  deliveryStatus?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateOrderData {
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: {
    productId: string;
    quantity: number;
  }[];
  deliveryFee?: number;
  discountAmount?: number;
  paymentMethod?: string;
  remark?: string;
}

export interface RefundListParams {
  page?: number;
  limit?: number;
  pageSize?: number;
  reviewStatus?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReviewRefundData {
  action: 'approve' | 'reject';
  rejectReason?: string;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}

function unwrap<T>(response: { data: ApiResponse<T> }): ApiResponse<T> {
  return response.data;
}

// 获取订单列表
export const getOrderList = (params: OrderListParams) => {
  return request.get('/api/order/list', params).then(unwrap<OrderListResponse>);
};

// 获取订单详情
export const getOrderDetail = (id: string) => {
  return request.get(`/api/order/detail/${id}`).then(unwrap<Order>);
};

// 创建订单
export const createOrder = (data: CreateOrderData) => {
  return request.post('/api/order/create', data).then(unwrap<Order>);
};

// 更新订单状态
export const updateOrderStatus = (
  id: string, 
  data: {
    status?: string;
    paymentStatus?: string;
    deliveryStatus?: string;
  }
) => {
  return request.patch(`/api/order/status/${id}`, data).then(unwrap<Order>);
};

// 删除订单
export const deleteOrder = (id: string) => {
  return request.delete(`/api/order/${id}`).then(unwrap<null>);
};

// 批量删除订单
export const batchDeleteOrders = (ids: string[]) => {
  return request.delete('/api/order/batch/delete', { ids }).then(unwrap<null>);
};

// 获取订单统计
export const getOrderStats = () => {
  return request.get('/api/order/stats').then(unwrap<unknown>);
}; 

// 获取退款列表
export const getRefundList = (params: RefundListParams) => {
  const query = {
    ...params,
    limit: params.limit || params.pageSize || 10,
  };
  delete (query as { pageSize?: number }).pageSize;

  return request.get('/api/order/refund/list', query).then(unwrap<OrderListResponse>);
};

// 审核退款
export const reviewRefund = (id: string, data: ReviewRefundData) => {
  return request.patch(`/api/order/refund/review/${id}`, data).then(unwrap<Order>);
};
