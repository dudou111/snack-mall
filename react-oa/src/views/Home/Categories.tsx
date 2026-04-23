import React from 'react';
import { Empty, Row, Col, Card, Typography, Statistic } from 'antd';
import {
  CoffeeOutlined,
  AppleOutlined,
  ShopOutlined,
  SkinOutlined,
  ExperimentOutlined,
  CarOutlined,
  RocketOutlined
} from '@ant-design/icons';
import styles from '@/assets/styles/home/home.module.scss';
import type { DashboardCategory } from '@/api/dashboard';

const { Title, Text } = Typography;

interface CategoriesProps {
  categories: DashboardCategory[];
}

const visualTokens = [
  { icon: <CoffeeOutlined />, color: '#1890ff' },
  { icon: <AppleOutlined />, color: '#52c41a' },
  { icon: <ShopOutlined />, color: '#faad14' },
  { icon: <SkinOutlined />, color: '#f5222d' },
  { icon: <RocketOutlined />, color: '#722ed1' },
  { icon: <ExperimentOutlined />, color: '#eb2f96' },
  { icon: <CarOutlined />, color: '#13c2c2' }
];

const Categories: React.FC<CategoriesProps> = ({ categories }) => {
  const totalProducts = categories.reduce((sum, cat) => sum + cat.products, 0);

  return (
    <div className={styles.categories}>
      <div className={styles.sectionHeader}>
        <Title level={4}>
          <ShopOutlined style={{ marginRight: 8 }} />
          零食分类总览
        </Title>
        <Text type="secondary">共有 {totalProducts} 种零食产品</Text>
      </div>

      {categories.length === 0 ? <Empty description="暂无分类数据" /> : null}

      <Row gutter={[16, 16]}>
        {categories.map((category, index) => {
          const token = visualTokens[index % visualTokens.length];

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={category.name}>
              <Card className={styles.categoryCard} hoverable>
                <div className={styles.categoryIcon} style={{ backgroundColor: token.color }}>
                  {token.icon}
                </div>
                <div className={styles.categoryContent}>
                  <Title level={5}>{category.name}</Title>
                  <Statistic value={category.products} suffix="种产品" valueStyle={{ fontSize: '16px' }} />
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default Categories;
