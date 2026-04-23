import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Empty, List, Popover, Space, Tag, Typography, notification } from "antd";
import { BellOutlined, ShoppingCartOutlined, UploadOutlined } from "@ant-design/icons";
import { dashboardApi } from "@/api/dashboard";
import type { Order } from "@/api/order";
import type { UploadRecord } from "@/api/product";
import styles from "@/assets/styles/home/home.module.scss";

const { Text } = Typography;

type NoticeType = "order" | "upload";

interface NoticeItem {
  id: string;
  type: NoticeType;
  title: string;
  description: string;
  time?: string;
}

interface WsNotificationPayload {
  id: string;
  type: "order.created" | "product.created";
  title: string;
  description: string;
  time?: string;
  createdAt?: string;
}

function formatTime(value?: string) {
  if (!value) return "刚刚";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";

  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function buildOrderNotice(order: Order): NoticeItem {
  const productNames = order.items.map((item) => item.productName).join("、");

  return {
    id: `order-${order._id}`,
    type: "order",
    title: `用户 ${order.customer.name} 下单`,
    description: `${productNames || "商品"}，实付 ¥${order.actualAmount}`,
    time: order.orderTime
  };
}

function buildUploadNotice(record: UploadRecord): NoticeItem {
  return {
    id: `upload-${record._id}`,
    type: "upload",
    title: "商家上传商品",
    description: `${record.name} / ${record.brand}`,
    time: record.uploadTime
  };
}

function buildWsUrl() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8088";
  const url = new URL(apiBase);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws/notifications";
  url.search = "";
  return url.toString();
}

function mapWsNotice(payload: WsNotificationPayload): NoticeItem {
  return {
    id: payload.id,
    type: payload.type === "order.created" ? "order" : "upload",
    title: payload.title,
    description: payload.description,
    time: payload.time || payload.createdAt
  };
}

export default function NotificationCenter() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const reconnectTimer = useRef<number | null>(null);
  const seenNoticeIds = useRef(new Set<string>());
  const [notificationApi, notificationContextHolder] = notification.useNotification();

  function mergeNotices(nextNotice: NoticeItem) {
    seenNoticeIds.current.add(nextNotice.id);
    setNotices((prev) => {
      const withoutDuplicate = prev.filter((item) => item.id !== nextNotice.id);
      return [nextNotice, ...withoutDuplicate].slice(0, 8);
    });
  }

  function showRealtimePopup(nextNotice: NoticeItem) {
    notificationApi.open({
      message: nextNotice.title,
      description: nextNotice.description,
      placement: "topRight",
      duration: 4,
      icon: nextNotice.type === "order" ? <ShoppingCartOutlined style={{ color: "#d48806" }} /> : <UploadOutlined style={{ color: "#1677ff" }} />
    });
  }

  function pushRealtimeNotice(nextNotice: NoticeItem) {
    if (seenNoticeIds.current.has(nextNotice.id)) return;

    mergeNotices(nextNotice);
    setUnreadCount((count) => count + 1);
    showRealtimePopup(nextNotice);
  }

  function handleOpenChange(open: boolean) {
    setPanelOpen(open);

    if (open) {
      setUnreadCount(0);
    }
  }

  async function loadNotices() {
    setLoading(true);

    try {
      const overview = await dashboardApi.getOverview();
      const nextNotices = [
        ...overview.recentOrders.map(buildOrderNotice),
        ...overview.recentUploads.map(buildUploadNotice)
      ]
        .sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
        .slice(0, 8);

      setNotices(nextNotices);
      seenNoticeIds.current = new Set(nextNotices.map((item) => item.id));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let socket: WebSocket | null = null;
    let closedByEffect = false;

    function connect() {
      socket = new WebSocket(buildWsUrl());

      socket.onopen = () => {
        setConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "notification") {
            pushRealtimeNotice(mapWsNotice(message.data));
          }
        } catch {
          // 忽略非 JSON 消息，保持通知通道稳定。
        }
      };

      socket.onclose = () => {
        setConnected(false);
        if (!closedByEffect) {
          reconnectTimer.current = window.setTimeout(connect, 3000);
        }
      };

      socket.onerror = () => {
        socket?.close();
      };
    }

    loadNotices();
    connect();

    return () => {
      closedByEffect = true;
      if (reconnectTimer.current) {
        window.clearTimeout(reconnectTimer.current);
      }
      socket?.close();
    };
  }, []);

  const content = useMemo(
    () => (
      <div className={styles.noticePanel}>
        <div className={styles.noticePanelHead}>
          <div>
            <strong>消息通知</strong>
            <p>{connected ? "WebSocket 已连接，正在实时接收消息" : "WebSocket 重连中"}</p>
          </div>
          <Button type="link" size="small" loading={loading} onClick={loadNotices}>
            刷新
          </Button>
        </div>

        {notices.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无新消息" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notices}
            renderItem={(item) => (
              <List.Item className={styles.noticeItem}>
                <List.Item.Meta
                  avatar={
                    <span className={`${styles.noticeIcon} ${item.type === "order" ? styles.orderNotice : styles.uploadNotice}`}>
                      {item.type === "order" ? <ShoppingCartOutlined /> : <UploadOutlined />}
                    </span>
                  }
                  title={
                    <Space size={8} wrap>
                      <Text strong>{item.title}</Text>
                      <Tag color={item.type === "order" ? "gold" : "blue"}>
                        {item.type === "order" ? "下单" : "上传"}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary">{item.description}</Text>
                      <div className={styles.noticeTime}>{formatTime(item.time)}</div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    ),
    [connected, loading, notices]
  );

  return (
    <>
      {notificationContextHolder}
      <Popover
        content={content}
        trigger="click"
        placement="bottomRight"
        arrow={false}
        open={panelOpen}
        onOpenChange={handleOpenChange}
      >
        <Badge count={unreadCount} size="small" offset={[-2, 4]}>
          <Button className={styles.noticeButton} shape="circle" icon={<BellOutlined />} />
        </Badge>
      </Popover>
    </>
  );
}
