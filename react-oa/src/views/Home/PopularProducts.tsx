import React from 'react';
import { Card, Row, Col, Badge, Typography, Rate, Tag } from 'antd';
import { FireOutlined, RiseOutlined, CrownOutlined } from '@ant-design/icons';
import styles from '@/assets/styles/home/home.module.scss';

// 导入产品图片
import img1 from '@/assets/images/img1.png';
import img2 from '@/assets/images/img2.png';
import img3 from '@/assets/images/img3.png';
import img4 from '@/assets/images/img4.png';

const { Title, Text } = Typography;

// 热门产品数据
const popularProducts = [
  {
    id: 1,
    name: '经典抹茶红豆冰淇淋零食',
    image: img1,
    price: 9.9,
    rating: 4.8,
    sales: 15862,
    tag: '爆款',
    discount: '7.5折'
  },
  {
    id: 2,
    name: '慢焙巧克力千层零食',
    image: img2,
    price: 49.9,
    rating: 4.9,
    sales: 12056,
    tag: '推荐',
    discount: '8折'
  },
  {
    id: 3,
    name: '甄选栗子蒙布朗生乳零食',
    image: img3,
    price: 19.9,
    rating: 4.7,
    sales: 9876,
    tag: '热卖',
    discount: '满减'
  },
  {
    id: 4,
    name: '秘制荔枝玫瑰戚风零食',
    image: img4,
    price: 4.5,
    rating: 4.6,
    sales: 23451,
    tag: '经典',
    discount: '买2送1'
  }
];

const PopularProducts: React.FC = () => {
  // 标签颜色映射
  const tagColorMap: Record<string, string> = {
    '爆款': '#f50',
    '推荐': '#87d068',
    '热卖': '#108ee9',
    '经典': '#722ed1'
  };

  // 标签图标映射
  const tagIconMap: Record<string, React.ReactNode> = {
    '爆款': <FireOutlined />,
    '推荐': <CrownOutlined />,
    '热卖': <RiseOutlined />,
    '经典': <CrownOutlined />
  };

  return (
    <div className={styles.popularProducts}>
      <div className={styles.sectionHeader}>
        <Title level={4}>
          <FireOutlined style={{ color: '#FF4D4F', marginRight: 8 }} />
          热门零食推荐
        </Title>
        <Text type="secondary">根据销量和好评精选的热门零食</Text>
      </div>
      
      <Row gutter={[16, 16]}>
        {popularProducts.map(product => (
          <Col xs={24} sm={12} md={12} lg={6} key={product.id}>
            <Badge.Ribbon text={product.discount} color="red">
              <Card
                hoverable
                cover={
                  <div className={styles.productImageContainer}>
                    <img 
                      alt={product.name} 
                      src={product.image} 
                      className={styles.productImage}
                      loading="lazy"
                    />
                  </div>
                }
                className={styles.productCard}
              >
                <div className={styles.productTitle}>
                  <Tag color={tagColorMap[product.tag]} icon={tagIconMap[product.tag]}>
                    {product.tag}
                  </Tag>
                  <Text strong ellipsis={{ tooltip: product.name }}>
                    {product.name}
                  </Text>
                </div>
                <div className={styles.productInfo}>
                  <div className={styles.price}>
                    <Text type="danger" strong>¥{product.price}</Text>
                  </div>
                  <div className={styles.rating}>
                    <Rate disabled defaultValue={product.rating} allowHalf style={{ fontSize: 12 }} />
                    <Text type="secondary" style={{ marginLeft: 5 }}>{product.rating}</Text>
                  </div>
                  <div className={styles.sales}>
                    <Text type="secondary">销量: {product.sales}</Text>
                  </div>
                </div>
              </Card>
            </Badge.Ribbon>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default PopularProducts; 