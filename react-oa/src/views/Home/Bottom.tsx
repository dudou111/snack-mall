import React from "react";
import { Col, Row, Card, Typography, List, Tag, Button } from "antd";
import { FireOutlined, ClockCircleOutlined, StarOutlined } from "@ant-design/icons";
import styles from "@/assets/styles/home/home.module.scss";

const { Title, Text, Paragraph } = Typography;

// 活动数据
const promotions = [
  {
    id: 1,
    title: "双11零食狂欢节",
    description: "全场零食满199减100，限时抢购",
    startTime: "2024-11-01",
    endTime: "2024-11-12",
    tag: "促销",
    status: "即将开始"
  },
  {
    id: 2,
    title: "每周五零食品鉴日",
    description: "新品尝鲜，买二送一",
    startTime: "2024-08-01",
    endTime: "2024-12-31",
    tag: "每周活动",
    status: "进行中"
  },
  {
    id: 3,
    title: "零食礼盒预售",
    description: "中秋、国庆礼盒预售8折起",
    startTime: "2024-09-01",
    endTime: "2024-09-30",
    tag: "预售",
    status: "进行中"
  },
  {
    id: 4,
    title: "VIP会员专享折扣",
    description: "会员专享85折，充值送零食",
    startTime: "2024-01-01",
    endTime: "2024-12-31",
    tag: "会员",
    status: "长期"
  }
];

// 零食新闻数据
const news = [
  {
    id: 1,
    title: "本季度零食销售同比增长35%",
    date: "2024-05-15",
    views: 1240
  },
  {
    id: 2,
    title: "三只松鼠新品品鉴会圆满结束",
    date: "2024-05-10",
    views: 986
  },
  {
    id: 3,
    title: "新款健康零食系列受到年轻人热捧",
    date: "2024-05-05",
    views: 1356
  },
  {
    id: 4,
    title: "进口零食季度销售报告出炉",
    date: "2024-04-30",
    views: 876
  }
];

const Bottom: React.FC = () => {
  const getTagColor = (tag: string) => {
    const colorMap: Record<string, string> = {
      "促销": "red",
      "每周活动": "blue",
      "预售": "orange",
      "会员": "purple"
    };
    return colorMap[tag] || "default";
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      "进行中": "green",
      "即将开始": "blue",
      "长期": "purple",
      "已结束": "default"
    };
    return colorMap[status] || "default";
  };

  return (
    <div className={styles.contentSection}>
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card title={<Title level={5}><FireOutlined style={{ color: "#FF4D4F" }} /> 零食营销活动</Title>}>
            <List
              itemLayout="horizontal"
              dataSource={promotions}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button type="link" key="details">详情</Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {item.title}
                        <Tag color={getTagColor(item.tag)}>{item.tag}</Tag>
                        <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Paragraph ellipsis={{ rows: 1 }}>
                          {item.description}
                        </Paragraph>
                        <Text type="secondary">
                          <ClockCircleOutlined /> {item.startTime} ~ {item.endTime}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title={<Title level={5}><StarOutlined style={{ color: "#FAAD14" }} /> 零食新闻资讯</Title>}>
            <List
              itemLayout="horizontal"
              dataSource={news}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Text key="views" type="secondary">{item.views} 阅读</Text>,
                    <Button type="link" key="read">阅读</Button>
                  ]}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={<Text type="secondary">{item.date}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Bottom;
