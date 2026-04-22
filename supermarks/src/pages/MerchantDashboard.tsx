import { useEffect, useState } from "react";
import { productApi, type ProductPayload } from "../api/product";
import { orderApi } from "../api/order";
import type { OrderEntity, ProductItem } from "../types";

const initialProduct: ProductPayload = {
  name: "",
  category: "零食",
  brand: "自有品牌",
  price: 0,
  stock: 0,
  status: "上架",
  description: "",
  image: ""
};

export default function MerchantDashboard() {
  const [productForm, setProductForm] = useState<ProductPayload>(initialProduct);
  const [uploadRecords, setUploadRecords] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [recordData, orderData] = await Promise.all([
        productApi.getUploadRecords({ page: 1, pageSize: 20 }),
        orderApi.getOrders({ page: 1, limit: 30 })
      ]);
      setUploadRecords(recordData.list || []);
      setOrders(orderData.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "数据加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateForm<K extends keyof ProductPayload>(key: K, value: ProductPayload[K]) {
    setProductForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submitProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProduct(true);
    setError("");

    try {
      await productApi.createProduct(productForm);
      setProductForm(initialProduct);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "商品上传失败");
    } finally {
      setSavingProduct(false);
    }
  }

  async function updateDelivery(orderId: string, deliveryStatus: "配送中" | "已送达" | "配送失败") {
    setActionId(orderId + deliveryStatus);
    setError("");
    try {
      await orderApi.updateDeliveryStatus(orderId, { deliveryStatus });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "物流状态更新失败");
    } finally {
      setActionId("");
    }
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <h2>上传商品</h2>
        <form className="grid grid-3" onSubmit={submitProduct}>
          <input className="input" placeholder="商品名称" value={productForm.name} onChange={(e) => updateForm("name", e.target.value)} required />
          <input className="input" placeholder="分类" value={productForm.category} onChange={(e) => updateForm("category", e.target.value)} required />
          <input className="input" placeholder="品牌" value={productForm.brand} onChange={(e) => updateForm("brand", e.target.value)} required />
          <input className="input" type="number" min={0} step="0.01" placeholder="价格" value={productForm.price} onChange={(e) => updateForm("price", Number(e.target.value))} required />
          <input className="input" type="number" min={0} placeholder="库存" value={productForm.stock} onChange={(e) => updateForm("stock", Number(e.target.value))} required />
          <select className="input" value={productForm.status} onChange={(e) => updateForm("status", e.target.value as "上架" | "下架" | "缺货")}> 
            <option value="上架">上架</option>
            <option value="下架">下架</option>
            <option value="缺货">缺货</option>
          </select>
          <input className="input" placeholder="图片 URL（可选）" value={productForm.image} onChange={(e) => updateForm("image", e.target.value)} />
          <input className="input" placeholder="描述（可选）" value={productForm.description} onChange={(e) => updateForm("description", e.target.value)} />
          <div className="inline-actions">
            <button className="primary-btn" type="submit" disabled={savingProduct}>
              {savingProduct ? "提交中..." : "上传商品"}
            </button>
            <button className="ghost-btn" type="button" onClick={loadData}>
              刷新数据
            </button>
          </div>
        </form>
      </section>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="muted">加载中...</p> : null}

      <section className="panel">
        <div className="panel-head">
          <h2>我的上传记录</h2>
          <span className="muted">共 {uploadRecords.length} 条</span>
        </div>
        <div className="table-like">
          {uploadRecords.map((item) => (
            <div className="row-card" key={item._id}>
              <div>
                <h3>{item.name}</h3>
                <p className="muted">
                  {item.brand} / {item.category}
                </p>
                <p className="muted">
                  价格：¥{item.price.toFixed(2)} | 库存：{item.stock} | 状态：{item.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>履约订单</h2>
          <span className="muted">仅展示涉及你商品的订单</span>
        </div>
        <div className="table-like">
          {orders.map((order) => (
            <div className="row-card" key={order._id}>
              <div>
                <h3>{order.orderNumber}</h3>
                <p className="muted">支付：{order.paymentStatus} / 物流：{order.deliveryStatus}</p>
                <p className="muted">
                  商品：{order.items.map((item) => `${item.productName} x${item.quantity}`).join("，")}
                </p>
              </div>
              <div className="inline-actions wrap">
                {(order.deliveryStatus === "待发货" || order.deliveryStatus === "配送失败") && (
                  <button
                    className="primary-btn"
                    disabled={actionId === order._id + "配送中"}
                    onClick={() => updateDelivery(order._id, "配送中")}
                  >
                    标记配送中
                  </button>
                )}

                {order.deliveryStatus === "配送中" && (
                  <>
                    <button
                      className="primary-btn"
                      disabled={actionId === order._id + "已送达"}
                      onClick={() => updateDelivery(order._id, "已送达")}
                    >
                      标记已送达
                    </button>
                    <button
                      className="warn-btn"
                      disabled={actionId === order._id + "配送失败"}
                      onClick={() => updateDelivery(order._id, "配送失败")}
                    >
                      标记配送失败
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
