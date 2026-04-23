import React, { useEffect, useState } from "react";
import { Alert, Spin, Typography, Layout } from "antd";
import Top from "./Top";
import Center from "./Center";
import Bottom from "./Bottom";
import Banner from "./Banner";
import PopularProducts from "./PopularProducts";
import Categories from "./Categories";
import styles from "@/assets/styles/home/home.module.scss";
import { dashboardApi, type DashboardOverview } from "@/api/dashboard";

const { Title, Text } = Typography;
const { Content } = Layout;

const Home: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOverview() {
    setLoading(true);
    setError("");

    try {
      const data = await dashboardApi.getOverview();
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "首页数据加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
  }, []);

  return (
    <Layout className={styles.homeLayout}>
      <Content className={styles.homeContent}>
        <div className={styles.pageHeader}>
          <div>
            <Text className={styles.eyebrow}>SNACK MALL COMMAND</Text>
            <Title level={2}>零食商城数据总览</Title>
            <Text type="secondary">
              用真实订单、商品和上传记录驱动首页，桌面、平板与手机都会自动重排。
            </Text>
          </div>
          <div className={styles.heroSignal}>
            <span>实时通知</span>
            <strong>WS</strong>
            <small>右上角实时推送</small>
          </div>
        </div>

        {error ? <Alert className={styles.dashboardAlert} type="error" message={error} showIcon /> : null}

        <Spin spinning={loading}>
          <Top summary={overview?.summary} />

          <div className={styles.heroGrid}>
            <div className={styles.heroBanner}>
              <Banner />
            </div>
            <div className={styles.opsBrief}>
              <Text className={styles.eyebrow}>TODAY FOCUS</Text>
              <Title level={3}>优先处理待发货订单与新品审核</Title>
              <Text type="secondary">
                右上角通知通过 WebSocket 接收用户新订单和商家上传记录，适合值班运营快速响应。
              </Text>
              <div className={styles.briefMetrics}>
                <span>
                  <strong>{overview?.summary.pendingShipment ?? 0}</strong>
                  待发货订单
                </span>
                <span>
                  <strong>{overview?.summary.uploadedToday ?? 0}</strong>
                  今日上传
                </span>
              </div>
            </div>
          </div>

          <div className={styles.homeTwoColumn}>
            <Categories categories={overview?.categories || []} />
            <PopularProducts products={overview?.popularProducts || []} />
          </div>

          <section className={styles.analysisSection}>
            <div className={styles.sectionHeader}>
              <Title level={4}>数据分析</Title>
              <Text type="secondary">销售额和订单趋势来自最近 7 天真实订单</Text>
            </div>
            <Center trends={overview?.dailyTrends || []} />
          </section>

          <Bottom recentOrders={overview?.recentOrders || []} recentUploads={overview?.recentUploads || []} />
        </Spin>
      </Content>
    </Layout>
  );
};

export default Home;
