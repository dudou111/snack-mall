import Avatar from "@/components/Avatar";
import { Layout, theme } from "antd";
import NotificationCenter from "@/components/NotificationCenter";
import styles from "@/assets/styles/home/home.module.scss";

const { Header } = Layout;

export default function HeaderCom() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <Header className={styles.appHeader} style={{ background: colorBgContainer }}>
      <div className={styles.headerIntro}>
        <span>Snack Mall Control</span>
        <strong>零食商城运营中心</strong>
      </div>
      <div className={styles.headerActions}>
        <NotificationCenter />
        <Avatar />
      </div>
    </Header>
  );
}
