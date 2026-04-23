import React from 'react';
import { Card, Empty, Row, Col, Badge, Typography, Rate, Tag } from 'antd';
import { FireOutlined, RiseOutlined, CrownOutlined } from '@ant-design/icons';
import styles from '@/assets/styles/home/home.module.scss';
import type { Product } from '@/api/product';

const { Title, Text } = Typography;

interface PopularProductsProps {
  products: Product[];
}

const PopularProducts: React.FC<PopularProductsProps> = ({ products }) => {
  const tagColorMap: Record<string, string> = {
    '爆款': '#f50',
    '推荐': '#87d068',
    '热卖': '#108ee9',
    '经典': '#722ed1'
  };

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
        <Text type="secondary">根据真实销量排序展示</Text>
      </div>

      {products.length === 0 ? <Empty description="暂无商品数据" /> : null}

      <Row gutter={[16, 16]}>
        {products.map((product, index) => {
          const tag = index === 0 ? '爆款' : index === 1 ? '推荐' : index === 2 ? '热卖' : '经典';

          return (
            <Col xs={24} sm={12} md={12} lg={6} key={product._id}>
              <Badge.Ribbon text={product.status} color={product.status === '上架' ? 'red' : 'gray'}>
                <Card
                  hoverable
                  cover={
                    <div className={styles.productImageContainer}>
                      {product.image ? (
                        <img
                          alt={product.name}
                          src={product.image}
                          className={styles.productImage}
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.productImageFallback}>暂无图片</div>
                      )}
                    </div>
                  }
                  className={styles.productCard}
                >
                  <div className={styles.productTitle}>
                    <Tag color={tagColorMap[tag]} icon={tagIconMap[tag]}>
                      {tag}
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
                      <Rate disabled value={product.rating || 0} allowHalf style={{ fontSize: 12 }} />
                      <Text type="secondary" style={{ marginLeft: 5 }}>{product.rating || 0}</Text>
                    </div>
                    <div className={styles.sales}>
                      <Text type="secondary">销量: {product.sales || 0}</Text>
                    </div>
                  </div>
                </Card>
              </Badge.Ribbon>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default PopularProducts;
