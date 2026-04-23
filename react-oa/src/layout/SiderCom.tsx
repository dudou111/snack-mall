import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
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
      ],
    },
    {
      key: "/Users",
      icon: <UserOutlined />,
      label: "用户管理",
      children: [
        { key: "/Users/List", label: "用户列表" },
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
