import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  GiftOutlined,
  BarChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

export default function SiderCom() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/home",
      icon: <HomeOutlined />,
      label: "首页概览",
    },
    {
      key: "/Products",
      icon: <ShoppingOutlined />,
      label: "商品管理",
      children: [
        { key: "/Products/ProductManagement", label: "商品管理" },
        { key: "/Products/Category", label: "分类管理" },
        { key: "/Products/Brand", label: "品牌管理" },
        { key: "/Products/Inventory", label: "上传记录" },
      ],
    },
    {
      key: "/Orders",
      icon: <ShoppingCartOutlined />,
      label: "订单管理",
      children: [
        { key: "/Orders/List", label: "订单列表" },
        { key: "/Orders/Refund", label: "退款管理" },
        { key: "/Orders/Delivery", label: "配送管理" },
      ],
    },
    {
      key: "/Users",
      icon: <UserOutlined />,
      label: "用户管理",
      children: [
        { key: "/Users/List", label: "用户列表" },
        { key: "/Users/VIP", label: "VIP管理" },
        { key: "/Hospitalmsg/Feedback", label: "用户反馈" },
      ],
    },
    {
      key: "/Marketing",
      icon: <GiftOutlined />,
      label: "营销管理",
      children: [
        { key: "/Marketing/Coupons", label: "优惠券管理" },
        { key: "/Marketing/Activities", label: "活动管理" },
        { key: "/Marketing/Points", label: "积分管理" },
      ],
    },
    {
      key: "/Analytics",
      icon: <BarChartOutlined />,
      label: "数据统计",
      children: [
        { key: "/Analytics/Sales", label: "销售统计" },
        { key: "/Analytics/Users", label: "用户统计" },
        { key: "/Analytics/Products", label: "商品统计" },
      ],
    },
    {
      key: "/Content",
      icon: <ShoppingOutlined />,
      label: "内容管理",
      children: [
        { key: "/Hospitalmsg/Health", label: "健康百科" },
        { key: "/Content/News", label: "资讯管理" },
        { key: "/Content/Banner", label: "轮播图管理" },
      ],
    },
    {
      key: "/Config",
      icon: <SettingOutlined />,
      label: "系统设置",
      children: [
        { key: "/Config/Administrators", label: "管理员设置" },
        { key: "/Config/System", label: "系统配置" },
        { key: "/Config/Payment", label: "支付设置" },
        { key: "/Config/Logistics", label: "物流设置" },
      ],
    },
  ];

  const handleClick = (e: any) => {
    navigate(e.key);
  };

  return (
    <Sider width={220} theme="dark">
      <div
        style={{
          height: 64,
          margin: 16,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        🍿 零食商城系统
      </div>
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={[location.pathname]}
        style={{ 
          height: "100%", 
          borderRight: 0,
          fontSize: "14px"
        }}
        items={menuItems}
        onClick={handleClick}
      />
    </Sider>
  );
}
