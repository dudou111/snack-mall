import { request } from "./request";
import type { OrderEntity } from "../types";

export interface CreateOrderPayload {
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentMethod?: "微信支付" | "支付宝" | "现金" | "Stripe测试支付";
  remark?: string;
}

export interface StripePaymentResponse {
  order: OrderEntity;
  orderId: string;
  paymentIntentId: string;
  status: string;
}

export const orderApi = {
  createOrder: (payload: CreateOrderPayload) =>
    request<OrderEntity>({
      url: "/api/order/create",
      method: "POST",
      data: payload
    }),

  getOrders: (params?: { page?: number; limit?: number }) =>
    request<{ orders: OrderEntity[] }>({
      url: "/api/order/list",
      method: "GET",
      params
    }),

  mockPay: (payload: {
    orderId: string;
    paymentMethod?: "微信支付" | "支付宝" | "现金" | "Stripe测试支付";
    mockResult: "success" | "fail";
    failReason?: string;
  }) =>
    request<OrderEntity>({
      url: "/api/order/pay/mock",
      method: "POST",
      data: payload
    }),

  stripeTestPay: (payload: { orderId: string }) =>
    request<StripePaymentResponse>({
      url: "/api/order/pay/stripe-intent",
      method: "POST",
      data: payload
    }),

  applyRefund: (payload: { orderId: string; applyReason?: string; applyAmount?: number }) =>
    request<OrderEntity>({
      url: "/api/order/refund/apply",
      method: "POST",
      data: payload
    }),

  updateDeliveryStatus: (id: string, payload: { deliveryStatus: "配送中" | "已送达" | "配送失败" }) =>
    request<OrderEntity>({
      url: `/api/order/delivery/${id}`,
      method: "PATCH",
      data: payload
    })
};
