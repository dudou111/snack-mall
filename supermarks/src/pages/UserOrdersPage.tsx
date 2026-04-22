import { useEffect, useState } from "react";
import { orderApi } from "../api/order";
import type { OrderEntity } from "../types";

function formatMoney(value: number): string {
  return `¥${value.toFixed(2)}`;
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<OrderEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const data = await orderApi.getOrders({ page: 1, limit: 30 });
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "订单加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStripePay(order: OrderEntity) {
    setActionId(order._id + "stripe");
    setError("");
    try {
      await orderApi.stripeTestPay({ orderId: order._id });
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Stripe 测试支付失败");
    } finally {
      setActionId("");
    }
  }

  async function handleRefund(order: OrderEntity) {
    setActionId(order._id + "refund");
    setError("");
    try {
      await orderApi.applyRefund({
        orderId: order._id,
        applyReason: "用户发起退款申请",
        applyAmount: order.actualAmount
      });
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "退款申请失败");
    } finally {
      setActionId("");
    }
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-head">
          <h2>我的订单</h2>
          <button className="ghost-btn" onClick={loadOrders}>
            刷新
          </button>
        </div>

        {error ? <p className="error-text">{error}</p> : null}
        {loading ? <p className="muted">订单加载中...</p> : null}

        <div className="table-like">
          {orders.map((order) => {
            const canRefund =
              order.paymentStatus === "已支付" &&
              order.deliveryStatus !== "已送达" &&
              order.refund?.reviewStatus !== "待处理" &&
              order.refund?.reviewStatus !== "已通过";

            return (
              <div className="row-card" key={order._id}>
                <div>
                  <h3>{order.orderNumber}</h3>
                  <p className="muted">
                    收货人：{order.customer?.name} | 手机：{order.customer?.phone}
                  </p>
                  <p className="muted">金额：{formatMoney(order.actualAmount)}</p>
                  <p className="muted">
                    状态：{order.status} / 支付：{order.paymentStatus} / 物流：{order.deliveryStatus}
                  </p>
                  {order.paymentProvider === "stripe_test" ? (
                    <p className="muted">
                      Stripe：{order.stripePaymentStatus || "已创建"}
                      {order.stripePaymentIntentId ? ` / 流水：${order.stripePaymentIntentId}` : ""}
                    </p>
                  ) : null}
                  {order.refund?.reviewStatus && order.refund.reviewStatus !== "无" ? (
                    <p className="muted">
                      退款：{order.refund.reviewStatus}
                      {order.refund.rejectReason ? `（驳回原因：${order.refund.rejectReason}）` : ""}
                    </p>
                  ) : null}
                </div>
                <div className="inline-actions wrap">
                  {order.paymentStatus === "未支付" ? (
                    <>
                      <button
                        className="primary-btn"
                        disabled={actionId === order._id + "stripe"}
                        onClick={() => handleStripePay(order)}
                      >
                        {actionId === order._id + "stripe" ? "支付处理中..." : "Stripe 测试支付"}
                      </button>
                      <span className="muted">测试支付由后端 Stripe 测试模式完成</span>
                    </>
                  ) : null}

                  {canRefund ? (
                    <button
                      className="warn-btn"
                      disabled={actionId === order._id + "refund"}
                      onClick={() => handleRefund(order)}
                    >
                      申请全额退款
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
