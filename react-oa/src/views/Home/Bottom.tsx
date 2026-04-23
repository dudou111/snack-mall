import React from "react";
import { Col, Row, Card, Typography, List, Tag, Empty } from "antd";
import { ClockCircleOutlined, ShoppingCartOutlined, UploadOutlined } from "@ant-design/icons";
import styles from "@/assets/styles/home/home.module.scss";
import type { Order } from "@/api/order";
import type { UploadRecord } from "@/api/product";

const { Title, Text, Paragraph } = Typography;

interface BottomProps {
  recentOrders: Order[];
  recentUploads: UploadRecord[];
}

function formatTime(value?: string) {
  if (!value) return "暂无时间";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "暂无时间";

  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const Bottom: React.FC<BottomProps> = ({ recentOrders, recentUploads }) => {
  return (
    <div className={styles.contentSection}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title={<Title level={5}><ShoppingCartOutlined style={{ color: "#FF8A3D" }} /> 最近订单</Title>}>
            {recentOrders.length === 0 ? (
              <Empty description="暂无订单数据" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={recentOrders}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          {item.orderNumber}
                          <Tag color={item.paymentStatus === "已支付" ? "green" : "orange"}>{item.paymentStatus}</Tag>
                          <Tag color="blue">{item.deliveryStatus}</Tag>
                        </div>
                      }
                      description={
                        <div>
                          <Paragraph ellipsis={{ rows: 1 }}>
                            {item.customer.name} 购买 {item.items.map(orderItem => `${orderItem.productName} x${orderItem.quantity}`).join("、")}
                          </Paragraph>
                          <Text type="secondary">
                            <ClockCircleOutlined /> {formatTime(item.orderTime)} / 实付 ¥{item.actualAmount}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<Title level={5}><UploadOutlined style={{ color: "#1677FF" }} /> 最近上传</Title>}>
            {recentUploads.length === 0 ? (
              <Empty description="暂无上传记录" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={recentUploads}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          {item.name}
                          <Tag color={item.status === "上架" ? "green" : "default"}>{item.status}</Tag>
                        </div>
                      }
                      description={
                        <div>
                          <Paragraph ellipsis={{ rows: 1 }}>
                            {item.brand} / {item.category} / 库存 {item.stock}
                          </Paragraph>
                          <Text type="secondary">
                            <ClockCircleOutlined /> {formatTime(item.uploadTime)} / ¥{item.price}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Bottom;
