import { request } from '../utils/request';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 商品相关接口
export interface Product {
  _id: string;
  name: string;
  image: string;
  images?: string[];
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  stock: number;
  status: string;
  tags: string[];
  description: string;
  weight?: string;
  shelf_life?: string;
  origin?: string;
  rating?: number;
  sales?: number;
  flavor?: string;
  nutrition?: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrate: number;
  };
  sku?: string;
  minStock?: number;
  isRecommended?: boolean;
  sort?: number;
  createTime: string;
  updateTime: string;
}

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  category?: string;
  brand?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductListResponse {
  list: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UploadRecordMerchant {
  _id: string;
  username: string;
  role: string;
  tel?: string;
}

export interface UploadRecord {
  _id: string;
  name: string;
  sku?: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  status: '上架' | '下架' | '缺货';
  uploadTime: string;
  merchantId?: string | UploadRecordMerchant;
  createdByRole?: 'admin' | 'merchant' | 'system';
}

export interface UploadRecordListParams {
  page?: number;
  pageSize?: number;
  merchantId?: string;
  status?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface UploadRecordListResponse {
  list: UploadRecord[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}

// 获取商品列表
export const getProducts = (params: ProductListParams) => {
  return request.get<ApiResponse<ProductListResponse>>('/product/products', { params });
};

// 获取商品详情
export const getProductById = (id: string) => {
  return request.get<ApiResponse<Product>>(`/product/products/${id}`);
};

// 创建商品
export const createProduct = (data: Partial<Product>) => {
  return request.post<ApiResponse<Product>>('/product/products', data);
};

// 更新商品
export const updateProduct = (id: string, data: Partial<Product>) => {
  return request.put<ApiResponse<Product>>(`/product/products/${id}`, data);
};

// 删除商品
export const deleteProduct = (id: string) => {
  return request.delete<ApiResponse<null>>(`/product/products/${id}`);
};

// 批量删除商品
export const batchDeleteProducts = (ids: string[]) => {
  return request.post<ApiResponse<null>>('/product/products/batch-delete', { ids });
};

// 更新商品状态
export const updateProductStatus = (id: string, status: string) => {
  return request.patch<ApiResponse<Product>>(`/product/products/${id}/status`, { status });
};

// 获取商品统计
export const getProductStats = () => {
  return request.get<ApiResponse<any>>('/product/products-stats');
};

// 获取商家上传记录
export const getUploadRecords = (params: UploadRecordListParams) => {
  return request.get<ApiResponse<UploadRecordListResponse>>('/product/upload-records', { params });
};

// 分类相关接口
export interface Category {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  image?: string;
  parentId?: string;
  level: number;
  status: string;
  sort: number;
  productCount: number;
  showOnHome: boolean;
  createTime: string;
  updateTime: string;
  children?: Category[];
}

export interface CategoryListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  parentId?: string;
  level?: number;
}

export interface CategoryListResponse {
  list: Category[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 获取分类列表
export const getCategories = (params: CategoryListParams) => {
  return request.get<ApiResponse<CategoryListResponse>>('/product/categories', { params });
};

// 获取分类树
export const getCategoryTree = () => {
  return request.get<ApiResponse<Category[]>>('/product/categories/tree');
};

// 获取分类详情
export const getCategoryById = (id: string) => {
  return request.get<ApiResponse<Category>>(`/product/categories/${id}`);
};

// 创建分类
export const createCategory = (data: Partial<Category>) => {
  return request.post<ApiResponse<Category>>('/product/categories', data);
};

// 更新分类
export const updateCategory = (id: string, data: Partial<Category>) => {
  return request.put<ApiResponse<Category>>(`/product/categories/${id}`, data);
};

// 删除分类
export const deleteCategory = (id: string) => {
  return request.delete<ApiResponse<null>>(`/product/categories/${id}`);
};

// 更新分类状态
export const updateCategoryStatus = (id: string, status: string) => {
  return request.patch<ApiResponse<Category>>(`/product/categories/${id}/status`, { status });
};

// 品牌相关接口
export interface Brand {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  image?: string;
  website?: string;
  status: string;
  sort: number;
  productCount: number;
  isRecommended: boolean;
  createTime: string;
  updateTime: string;
}

export interface BrandListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
}

export interface BrandListResponse {
  list: Brand[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 获取品牌列表
export const getBrands = (params: BrandListParams) => {
  return request.get<ApiResponse<BrandListResponse>>('/product/brands', { params });
};

// 获取所有启用的品牌
export const getAllBrands = () => {
  return request.get<ApiResponse<Brand[]>>('/product/brands/all');
};

// 获取品牌详情
export const getBrandById = (id: string) => {
  return request.get<ApiResponse<Brand>>(`/product/brands/${id}`);
};

// 创建品牌
export const createBrand = (data: Partial<Brand>) => {
  return request.post<ApiResponse<Brand>>('/product/brands', data);
};

// 更新品牌
export const updateBrand = (id: string, data: Partial<Brand>) => {
  return request.put<ApiResponse<Brand>>(`/product/brands/${id}`, data);
};

// 删除品牌
export const deleteBrand = (id: string) => {
  return request.delete<ApiResponse<null>>(`/product/brands/${id}`);
};

// 批量删除品牌
export const batchDeleteBrands = (ids: string[]) => {
  return request.post<ApiResponse<null>>('/product/brands/batch-delete', { ids });
};

// 更新品牌状态
export const updateBrandStatus = (id: string, status: string) => {
  return request.patch<ApiResponse<Brand>>(`/product/brands/${id}/status`, { status });
};

// 获取品牌统计
export const getBrandStats = () => {
  return request.get<ApiResponse<any>>('/product/brands-stats');
}; 