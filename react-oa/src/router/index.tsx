// 按需引入懒加载
import { lazy } from "react";

import LayoutCom from "@/layout/LayoutCom";
import Login from "@/views/Login";

// 重定向
import type { RouteObject } from "react-router-dom";
import { Navigate, Outlet, useRoutes } from "react-router-dom";

// 公共
import lazyLoad from "./lazyLoad";

declare module "react-router" {
  interface IndexRouteObject {
    meta?: any;
  }
  interface NonIndexRouteObject {
    meta?: any;
  }
}

// 添加一个固定的延迟时间，以便你可以看到加载状态
function Time(promise: Promise<any>) {
  return new Promise((resolve) => {
    setTimeout(resolve, 1000);
  }).then(() => promise);
}

// 占位符组件
const PlaceholderComponent = ({ title }: { title: string }) => (
  <div style={{ 
    padding: '20px', 
    textAlign: 'center', 
    fontSize: '18px', 
    color: '#666' 
  }}>
    这是{title}页面
  </div>
);

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/home" />,
  },
  // 登录
  {
    path: "/login",
    element: <Login />,
    meta: {
      auth: true, //不需要校验
    },
  },
  {
    path: "/",
    element: <LayoutCom />,
    meta: {
      title: "零食商城系统",
      path: "/",
    },
    children: [
      // 首页
      {
        path: "/home",
        element: lazyLoad(lazy(() => Time(import("../views/Home/Home")))),
        meta: {
          title: "首页概览",
          path: "/home",
        },
      },

      // 商品管理
      {
        path: "/Products",
        element: <Outlet />,
        meta: {
          title: "商品管理",
          path: "/Products",
        },
        children: [
          {
            index: true,
            element: <Navigate to="/Products/ProductManagement" />,
          },
          {
            path: "ProductManagement",
            element: lazyLoad(
              lazy(() => Time(import("../views/Products/ProductManagement")))
            ),
            meta: {
              title: "商品管理",
              path: "ProductManagement",
            },
          },
          {
            path: "Category",
            element: lazyLoad(
              lazy(() => Time(import("../views/Products/Category")))
            ),
            meta: {
              title: "分类管理",
              path: "Category",
            },
          },
          {
            path: "Brand",
            element: lazyLoad(
              lazy(() => Time(import("../views/Products/Brand")))
            ),
            meta: {
              title: "品牌管理",
              path: "Brand",
            },
          },
          {
            path: "Inventory",
            element: lazyLoad(
              lazy(() => Time(import("../views/Products/Inventory")))
            ),
            meta: {
              title: "上传记录",
              path: "Inventory",
            },
          },
        ],
      },

      // 订单管理
      {
        path: "/Orders",
        element: <Outlet />,
        meta: {
          title: "订单管理",
          path: "/Orders",
        },
        children: [
          {
            index: true,
            element: <Navigate to="/Orders/List" />,
          },
          {
            path: "List",
            element: lazyLoad(
              lazy(() => Time(import("../views/Orders/List")))
            ),
            meta: {
              title: "订单列表",
              path: "List",
            },
          },
          {
            path: "Refund",
            element: lazyLoad(
              lazy(() => Time(import("../views/Orders/Refund")))
            ),
            meta: {
              title: "退款审核",
              path: "Refund",
            },
          },
          {
            path: "Delivery",
            element: <PlaceholderComponent title="配送管理" />,
            meta: {
              title: "配送管理",
              path: "Delivery",
            },
          },
        ],
      },

      // 用户管理
      {
        path: "/Users",
        element: <Outlet />,
        meta: {
          title: "用户管理",
          path: "/Users",
        },
        children: [
          {
            index: true,
            element: <Navigate to="/Users/List" />,
          },
          {
            path: "List",
            element: lazyLoad(
              lazy(() => Time(import("../views/Users/List")))
            ),
            meta: {
              title: "用户列表",
              path: "List",
            },
          },
          {
            path: "VIP",
            element: <PlaceholderComponent title="VIP管理" />,
            meta: {
              title: "VIP管理",
              path: "VIP",
            },
          },
        ],
      },

      // 营销管理
      {
        path: "/Marketing",
        element: <Outlet />,
        meta: {
          title: "营销管理",
          path: "/Marketing",
        },
        children: [
          {
            index: true,
            element: <Navigate to="/Marketing/Coupons" />,
          },
          {
            path: "Coupons",
            element: <PlaceholderComponent title="优惠券管理" />,
            meta: {
              title: "优惠券管理",
              path: "Coupons",
            },
          },
          {
            path: "Activities",
            element: <PlaceholderComponent title="活动管理" />,
            meta: {
              title: "活动管理",
              path: "Activities",
            },
          },
          {
            path: "Points",
            element: <PlaceholderComponent title="积分管理" />,
            meta: {
              title: "积分管理",
              path: "Points",
            },
          },
        ],
      },

      // 数据统计
      {
        path: "/Analytics",
        element: <Outlet />,
        meta: {
          title: "数据统计",
          path: "/Analytics",
        },
        children: [
          {
            index: true,
            element: <Navigate to="/Analytics/Sales" />,
          },
          {
            path: "Sales",
            element: <PlaceholderComponent title="销售统计" />,
            meta: {
              title: "销售统计",
              path: "Sales",
            },
          },
          {
            path: "Users",
            element: <PlaceholderComponent title="用户统计" />,
            meta: {
              title: "用户统计",
              path: "Users",
            },
          },
          {
            path: "Products",
            element: <PlaceholderComponent title="商品统计" />,
            meta: {
              title: "商品统计",
              path: "Products",
            },
          },
        ],
      },

      // 内容管理
      {
        path: "/Content",
        element: <Outlet />,
        meta: {
          title: "内容管理",
          path: "/Content",
        },
        children: [
          {
            index: true,
            element: <Navigate to="/Content/News" />,
          },
          {
            path: "News",
            element: <PlaceholderComponent title="资讯管理" />,
            meta: {
              title: "资讯管理",
              path: "News",
            },
          },
          {
            path: "Banner",
            element: <PlaceholderComponent title="轮播图管理" />,
            meta: {
              title: "轮播图管理",
              path: "Banner",
            },
          },
        ],
      },

      // 系统设置
      {
        path: "/Config",
        element: <Outlet />,
        meta: {
          title: "系统设置",
          path: "/Config",
        },
        children: [
          {
            index: true,
            element: <Navigate to="/Config/Administrators" />,
          },
          {
            path: "Administrators",
            element: lazyLoad(
              lazy(() => Time(import("../views/Config/Administrators")))
            ),
            meta: {
              title: "管理员设置",
              path: "Administrators",
            },
          },
          {
            path: "System",
            element: <PlaceholderComponent title="系统设置" />,
            meta: {
              title: "系统设置",
              path: "System",
            },
          },
          {
            path: "Logs",
            element: <PlaceholderComponent title="系统日志" />,
            meta: {
              title: "系统日志",
              path: "Logs",
            },
          },
        ],
      },

      // 医院信息
      {
        path: "/Hospitalmsg",
        element: <Outlet />,
        meta: {
          title: "医院信息",
          path: "/Hospitalmsg",
        },
        children: [
          {
            index: true,
            element: <Navigate to="/Hospitalmsg/Health" />,
          },
          {
            path: "Health",
            element: <PlaceholderComponent title="健康资讯" />,
            meta: {
              title: "健康资讯",
              path: "Health",
            },
          },
          {
            path: "Feedback",
            element: <PlaceholderComponent title="意见反馈" />,
            meta: {
              title: "意见反馈",
              path: "Feedback",
            },
          },
        ],
      },
    ],
  },
];

function GetRoutes() {
  return useRoutes(routes);
}

export default GetRoutes;

