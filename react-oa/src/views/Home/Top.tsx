import { Col, Row } from "antd";
import top from "@/assets/styles/home/home.module.scss";
import {
  ShoppingCartOutlined,
  ArrowUpOutlined,
  UsergroupAddOutlined,
  PayCircleFilled,
  LineChartOutlined,
  GiftOutlined,
} from "@ant-design/icons";

export default function Top() {
  return (
    <Row
      className={top.top}
      align={"middle"}
      justify={"space-between"}
      wrap={false}
    >
      <Col span={4} className={top.col}>
        <div className={top.left} style={{ backgroundColor: "#3587f8" }}>
          <ShoppingCartOutlined className={top.icon} />
        </div>
        <div className={top.center}>
          <div className={top.num}>1,286</div>
          <span>今日订单数量</span>
        </div>
        <div className={top.right}>
          <ArrowUpOutlined className={top.icon} />
        </div>
      </Col>
      <Col span={4} className={top.col}>
        <div className={top.left} style={{ backgroundColor: "#ef737a" }}>
          <UsergroupAddOutlined className={top.icon} />
        </div>
        <div className={top.center}>
          <div className={top.num}>856</div>
          <span>今日活跃用户</span>
        </div>
        <div className={top.right}>
          <ArrowUpOutlined className={top.icon} />
        </div>
      </Col>
      <Col span={4} className={top.col}>
        <div className={top.left} style={{ backgroundColor: "#85e97d" }}>
          <PayCircleFilled className={top.icon} />
        </div>
        <div className={top.center}>
          <div className={top.num}>¥28,650</div>
          <span>今日销售额</span>
        </div>
        <div className={top.right}>
          <ArrowUpOutlined className={top.icon} />
        </div>
      </Col>
      <Col span={4} className={top.col}>
        <div className={top.left} style={{ backgroundColor: "#fcb269" }}>
          <LineChartOutlined className={top.icon} />
        </div>
        <div className={top.center}>
          <div className={top.num}>2,456</div>
          <span>今日商品浏览量</span>
        </div>
        <div className={top.right}>
          <ArrowUpOutlined className={top.icon} />
        </div>
      </Col>
      <Col span={4} className={top.col}>
        <div className={top.left} style={{ backgroundColor: "#a23fff" }}>
          <GiftOutlined className={top.icon} />
        </div>
        <div className={top.center}>
          <div className={top.num}>168</div>
          <span>今日新注册用户</span>
        </div>
        <div className={top.right}>
          <ArrowUpOutlined className={top.icon} />
        </div>
      </Col>
    </Row>
  );
}
