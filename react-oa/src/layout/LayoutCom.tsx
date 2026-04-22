import { Layout, theme } from "antd";
import { Outlet } from "react-router-dom";

import Bread from "@/components/Breand";
import AutoRouter from "../components/AutoRouter";

import SiderCom from "./SiderCom";
import HeaderCom from "./HeaderCom";

const { Content, Footer } = Layout;

export default function LayoutCom() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <AutoRouter>
      <Layout style={{ minHeight: "100vh"}}>
        {/* 侧边栏 */}
        <SiderCom/>

        {/* 内容 */}
        <Layout>
          {/* 头部 */}
          <HeaderCom/>

          {/* 中心内容 */}
          <Content style={{ margin: "0 16px" }}>
            {/* 面包屑 */}
            <Bread />
            <div
              style={{
                padding: 24,
                minHeight: 360,
                background: colorBgContainer,
              }}
            >
              <Outlet />
            </div>
          </Content>
          {/* 底部 */}
          <Footer style={{ textAlign: "center" }}>
          零食商城管理系统
          </Footer>
        </Layout>
      </Layout>
    </AutoRouter>
  );
}
