import React from "react";
import { Divider, Typography, Layout } from "antd";
import Top from "./Top";
import Center from "./Center";
import Bottom from "./Bottom";
import Banner from "./Banner";
import PopularProducts from "./PopularProducts";
import Categories from "./Categories";
import styles from "@/assets/styles/home/home.module.scss";

const { Title, Text } = Typography;
const { Content } = Layout;

const Home: React.FC = () => {
  return (
    <Layout className={styles.homeLayout}>
      <Content className={styles.homeContent}>
        <div className={styles.pageHeader}>
          <Title level={2} style={{ margin: "16px 0" }}>
            🍿 零食商城数据总览
          </Title>
          <Text type="secondary">
            欢迎使用零食商城管理系统，以下是商城的实时数据与概览信息
          </Text>
        </div>

        {/* 数据统计卡片 */}
        <Top />

        {/* 轮播Banner */}
        <div className={styles.fullWidthSection}>
          <Banner />
        </div>

        {/* 分类展示 */}
        <Categories />

        {/* 热门产品 */}
        <PopularProducts />

        <Divider orientation="left">数据分析</Divider>
        
        {/* 数据图表 */}
        <div className={styles.contentSection}>
          <Center />
        </div>

        {/* 底部内容 */}
        <Bottom />
      </Content>
    </Layout>
  );
};

export default Home;
