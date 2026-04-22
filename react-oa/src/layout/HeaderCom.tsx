import Avatar from "@/components/Avatar";
import { Layout, theme } from "antd";

const { Header } = Layout;

export default function HeaderCom() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <Header style={{ padding: 0, background: colorBgContainer }}>
      <Avatar />
    </Header>
  );
}
