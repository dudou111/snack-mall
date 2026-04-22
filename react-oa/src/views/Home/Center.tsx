import { Col, Row } from "antd";
import One from "./com/center-one";
import Two from "./com/center-two";

export default function Center() {
  return (
    <div>
      <Row
        align={"middle"}
        justify={"space-around"}
        wrap={false}
        style={{ margin: "20px 0" }}
      >
        <Col span={11}>
          <One />
        </Col>
        <Col span={11}>
          <Two />
        </Col>
      </Row>
    </div>
  );
}
