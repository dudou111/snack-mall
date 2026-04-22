import React from 'react';
import { Row, Col, Card, Typography, Statistic } from 'antd';
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

const { Title, Text } = Typography;

// 分类数据
const categories = [
  {
    id: 1,
    name: '休闲零食',
    icon: <CoffeeOutlined />,
    color: '#1890ff',
    products: 253,
    popularItems: ['薯片', '瓜子', '糖果']
  },
  {
    id: 2,
    name: '坚果炒货',
    icon: <AppleOutlined />,
    color: '#52c41a',
    products: 189,
    popularItems: ['每日坚果', '瓜子', '核桃']
  },
  {
    id: 3,
    name: '饼干糕点',
    icon: <ShopOutlined />,
    color: '#faad14',
    products: 176,
    popularItems: ['曲奇', '蛋黄酥', '威化']
  },
  {
    id: 4,
    name: '糖果巧克力',
    icon: <SkinOutlined />,
    color: '#f5222d',
    products: 124,
    popularItems: ['巧克力', '棒棒糖', '软糖']
  },
  {
    id: 5,
    name: '方便速食',
    icon: <RocketOutlined />,
    color: '#722ed1',
    products: 168,
    popularItems: ['方便面', '火腿肠', '自热米饭']
  },
  {
    id: 6,
    name: '饮料冲调',
    icon: <ExperimentOutlined />,
    color: '#eb2f96',
    products: 142,
    popularItems: ['咖啡', '奶茶', '果汁']
  },
  {
    id: 7,
    name: '进口食品',
    icon: <CarOutlined />,
    color: '#13c2c2',
    products: 98,
    popularItems: ['日本零食', '韩国食品', '欧美食品']
  }
];

const Categories: React.FC = () => {
  return (
    <div className={styles.categories}>
      <div className={styles.sectionHeader}>
        <Title level={4}>
          <ShopOutlined style={{ marginRight: 8 }} />
          零食分类总览
        </Title>
        <Text type="secondary">共有 {categories.reduce((sum, cat) => sum + cat.products, 0)} 种零食产品</Text>
      </div>
      
      <Row gutter={[16, 16]}>
        {categories.map(category => (
          <Col xs={24} sm={12} md={8} lg={6} key={category.id}>
            <Card className={styles.categoryCard} hoverable>
              <div className={styles.categoryIcon} style={{ backgroundColor: category.color }}>
                {category.icon}
              </div>
              <div className={styles.categoryContent}>
                <Title level={5}>{category.name}</Title>
                <Statistic value={category.products} suffix="种产品" valueStyle={{ fontSize: '16px' }} />
                <div className={styles.popularItems}>
                  <Text type="secondary">热门: {category.popularItems.join('、')}</Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Categories; 