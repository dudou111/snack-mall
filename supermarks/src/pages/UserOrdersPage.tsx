import { useEffect, useState } from "react";
import { orderApi } from "../api/order";
import type { OrderEntity } from "../types";

function formatMoney(value: number): string {
  return `¥${value.toFixed(2)}`;
}

const STRIPE_CNY_MAX_AMOUNT = 999999.99;

interface PaymentSuccessDialogState {
  orderNumber: string;
  amount: number;
  paymentIntentId?: string;
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<OrderEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentSuccessDialogState | null>(null);

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
      const result = await orderApi.stripeTestPay({ orderId: order._id });
      setPaymentSuccess({
        orderNumber: result.order?.orderNumber || order.orderNumber,
        amount: result.order?.actualAmount ?? order.actualAmount,
        paymentIntentId: result.paymentIntentId
      });
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
            const canApplyRefund =
              order.refund?.reviewStatus !== "待处理" &&
              order.refund?.reviewStatus !== "已通过";
            const stripeAmountExceeded = order.actualAmount > STRIPE_CNY_MAX_AMOUNT;

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
                  {stripeAmountExceeded ? (
                    <p className="error-text">
                      Stripe单笔支付金额上限为 {formatMoney(STRIPE_CNY_MAX_AMOUNT)}，当前订单请拆分后支付。
                    </p>
                  ) : null}
                </div>
                <div className="inline-actions wrap">
                  {order.paymentStatus === "未支付" ? (
                    <>
                      <button
                        className="primary-btn"
                        disabled={actionId === order._id + "stripe" || stripeAmountExceeded}
                        onClick={() => handleStripePay(order)}
                      >
                        {actionId === order._id + "stripe" ? "支付处理中..." : "Stripe 支付"}
                      </button>
                      <span className="muted"></span>
                    </>
                  ) : null}

                  {canApplyRefund ? (
                    <button
                      className="warn-btn"
                      disabled={actionId === order._id + "refund"}
                      onClick={() => handleRefund(order)}
                    >
                      {actionId === order._id + "refund" ? "提交中..." : "申请退款"}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {paymentSuccess ? (
        <div className="payment-success-overlay" role="dialog" aria-modal="true" aria-label="支付成功">
          <div className="payment-success-modal">
            <span className="payment-success-kicker">PAYMENT COMPLETE</span>
            <div className="payment-success-badge">支付成功</div>
            <h2>订单已完成支付</h2>
            <p className="muted">
              这笔订单已经通过 Stripe 测试支付完成，可以继续查看物流状态或返回挑选其他商品。
            </p>

            <div className="payment-success-grid">
              <div className="payment-success-card">
                <span>订单号</span>
                <strong>{paymentSuccess.orderNumber}</strong>
              </div>
              <div className="payment-success-card">
                <span>支付金额</span>
                <strong>{formatMoney(paymentSuccess.amount)}</strong>
              </div>
              <div className="payment-success-card wide">
                <span>Stripe 流水</span>
                <strong>{paymentSuccess.paymentIntentId || "已创建"}</strong>
              </div>
            </div>

            <div className="payment-success-actions">
              <button className="ghost-btn" onClick={() => setPaymentSuccess(null)}>
                继续查看订单
              </button>
              <button
                className="primary-btn"
                onClick={async () => {
                  setPaymentSuccess(null);
                  await loadOrders();
                }}
              >
                刷新订单状态
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
