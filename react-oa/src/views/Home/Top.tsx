import styles from "@/assets/styles/home/home.module.scss";
import {
  ShoppingCartOutlined,
  UsergroupAddOutlined,
  PayCircleFilled,
  LineChartOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import type { DashboardSummary } from "@/api/dashboard";

interface TopProps {
  summary?: DashboardSummary;
}

const defaultSummary: DashboardSummary = {
  todayOrders: 0,
  todaySales: 0,
  totalProducts: 0,
  uploadedToday: 0,
  pendingShipment: 0,
  totalUsers: 0
};

function formatMoney(value: number) {
  return `¥${Number(value || 0).toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
}

function buildStats(summary: DashboardSummary) {
  return [
    {
      label: "今日订单",
      value: summary.todayOrders.toLocaleString("zh-CN"),
      icon: <ShoppingCartOutlined />,
      color: "#ff8a3d",
    },
    {
      label: "用户总数",
      value: summary.totalUsers.toLocaleString("zh-CN"),
      icon: <UsergroupAddOutlined />,
      color: "#2f80ed",
    },
    {
      label: "今日销售额",
      value: formatMoney(summary.todaySales),
      icon: <PayCircleFilled />,
      color: "#1fbf75",
    },
    {
      label: "商品总数",
      value: summary.totalProducts.toLocaleString("zh-CN"),
      icon: <LineChartOutlined />,
      color: "#f2b84b",
    },
    {
      label: "今日上传",
      value: summary.uploadedToday.toLocaleString("zh-CN"),
      icon: <GiftOutlined />,
      color: "#d45bff",
    }
  ];
}

export default function Top({ summary = defaultSummary }: TopProps) {
  const stats = buildStats(summary);

  return (
    <div className={styles.top}>
      {stats.map((item) => (
        <article className={styles.statCard} key={item.label}>
          <div className={styles.statIcon} style={{ backgroundColor: item.color }}>
            {item.icon}
          </div>
          <div className={styles.statBody}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
