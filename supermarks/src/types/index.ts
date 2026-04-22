export type UserRole = "admin" | "user" | "merchant";

export interface UserInfo {
  _id: string;
  username: string;
  role: UserRole;
  isAdmin?: boolean;
  tel?: string;
  email?: string;
  status?: string;
}

export interface AuthPayload {
  token: string;
  userInfo: UserInfo;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface ProductItem {
  _id: string;
  name: string;
  image?: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  status: "上架" | "下架" | "缺货";
  description?: string;
  uploadTime?: string;
  merchantId?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface RefundInfo {
  reviewStatus: "无" | "待处理" | "已通过" | "已驳回";
  applyTime?: string;
  applyReason?: string;
  applyAmount?: number;
  reviewTime?: string;
  rejectReason?: string;
  refundTime?: string;
}

export interface OrderEntity {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  actualAmount: number;
  totalAmount: number;
  status: "待支付" | "待发货" | "配送中" | "已完成" | "已取消";
  paymentStatus: "未支付" | "已支付" | "已退款";
  deliveryStatus: "待发货" | "配送中" | "已送达" | "配送失败";
  paymentMethod?: string;
  paymentProvider?: "" | "mock" | "stripe_test";
  paymentMockNo?: string;
  paymentFailReason?: string;
  stripePaymentIntentId?: string;
  stripePaymentStatus?: string;
  orderTime?: string;
  paymentTime?: string;
  shipmentTime?: string;
  completionTime?: string;
  refund?: RefundInfo;
}
