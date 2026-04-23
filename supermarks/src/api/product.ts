import { request } from "./request";
import type { ProductItem } from "../types";

export interface ProductListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
}

export interface ProductPayload {
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  status: "上架" | "下架" | "缺货";
  description?: string;
  image?: string;
}

export const productApi = {
  getProducts: (params: ProductListQuery) =>
    request<{ list: ProductItem[]; total: number }>({
      url: "/api/product/products",
      method: "GET",
      params
    }),

  createProduct: (payload: ProductPayload) =>
    request<ProductItem>({
      url: "/api/product/products",
      method: "POST",
      data: payload
    }),

  uploadProductImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    return request<{ imageUrl: string; filename: string }>({
      url: "/api/product/upload-image",
      method: "POST",
      data: formData
    });
  },

  getUploadRecords: (params?: { page?: number; pageSize?: number }) =>
    request<{ list: ProductItem[] }>({
      url: "/api/product/upload-records",
      method: "GET",
      params
    })
};
