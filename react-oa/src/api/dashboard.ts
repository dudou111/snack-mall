import request from "./request";
import type { Order } from "./order";
import type { Product, UploadRecord } from "./product";

export interface DashboardSummary {
  todayOrders: number;
  todaySales: number;
  totalProducts: number;
  uploadedToday: number;
  pendingShipment: number;
  totalUsers: number;
}

export interface DashboardTrend {
  date: string;
  label: string;
  orders: number;
  amount: number;
}

export interface DashboardCategory {
  name: string;
  products: number;
}

export interface DashboardOverview {
  summary: DashboardSummary;
  dailyTrends: DashboardTrend[];
  categories: DashboardCategory[];
  popularProducts: Product[];
  recentOrders: Order[];
  recentUploads: UploadRecord[];
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  const payload = response.data;

  if (payload.code !== 0) {
    throw new Error(payload.message || "请求失败");
  }

  return payload.data;
}

export const dashboardApi = {
  getOverview: () => request.get("/api/dashboard/overview").then(unwrap<DashboardOverview>)
};
