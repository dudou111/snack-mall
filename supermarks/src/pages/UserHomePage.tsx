import { useEffect, useMemo, useState } from "react";
import { productApi } from "../api/product";
import { orderApi } from "../api/order";
import type { ProductItem, UserInfo } from "../types";

interface UserHomePageProps {
  user: UserInfo;
}

interface CustomerForm {
  name: string;
  phone: string;
  address: string;
}

function formatMoney(value: number): string {
  return `¥${value.toFixed(2)}`;
}

export default function UserHomePage({ user }: UserHomePageProps) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState<CustomerForm>({
    name: user.username,
    phone: user.tel || "",
    address: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const visibleProducts = useMemo(() => {
    if (!keyword) return products;
    return products.filter((item) => item.name.includes(keyword) || item.brand.includes(keyword) || item.category.includes(keyword));
  }, [keyword, products]);

  const totalPages = Math.ceil(visibleProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return visibleProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [visibleProducts, currentPage, itemsPerPage]);

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const data = await productApi.getProducts({ page: 1, pageSize: 200, status: "上架" });
      setProducts(data.list || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "商品加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

  function getQuantity(productId: string): number {
    return qtyMap[productId] || 1;
  }

  function setQuantity(productId: string, value: number) {
    setQtyMap((prev) => ({ ...prev, [productId]: value }));
  }

  async function handleCreateOrder(product: ProductItem) {
    if (!customer.name || !customer.phone || !customer.address) {
      setError("请先填写收货人、手机号和地址");
      return;
    }

    const quantity = getQuantity(product._id);
    if (quantity <= 0 || quantity > product.stock) {
      setError("购买数量不合法");
      return;
    }

    setSubmittingId(product._id);
    setError("");
    setNotice("");

    try {
      await orderApi.createOrder({
        customer,
        items: [{ productId: product._id, quantity }],
        paymentMethod: "微信支付"
      });
      setNotice(`下单成功：${product.name} x${quantity}`);
      setQuantity(product._id, 1);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "下单失败");
    } finally {
      setSubmittingId("");
    }
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <h2>下单信息</h2>
        <div className="grid grid-3">
          <input
            className="input"
            placeholder="收货人"
            value={customer.name}
            onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            className="input"
            placeholder="手机号"
            value={customer.phone}
            onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <input
            className="input"
            placeholder="收货地址"
            value={customer.address}
            onChange={(e) => setCustomer((prev) => ({ ...prev, address: e.target.value }))}
          />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>商品列表</h2>
          <div className="inline-actions">
            <input
              className="input compact"
              placeholder="搜索名称/品牌/分类"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button className="ghost-btn" onClick={loadProducts}>
              刷新
            </button>
          </div>
        </div>

        {notice ? <p className="success-text">{notice}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {loading ? <p className="muted">商品加载中...</p> : null}

        <div className="card-grid">
          {paginatedProducts.map((product) => (
            <article className="card" key={product._id}>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="card-image"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="card-image-error" style={{ display: 'none' }}>暂无图片</div>
              <div className="card-tag">{product.category}</div>
              <h3>{product.name}</h3>
              <p className="muted">品牌：{product.brand}</p>
              <p className="price">{formatMoney(product.price)}</p>
              <p className="muted">库存：{product.stock}</p>
              {product.description ? <p className="muted">{product.description}</p> : null}

              <div className="inline-actions">
                <input
                  className="input compact qty"
                  type="number"
                  min={1}
                  max={product.stock}
                  value={getQuantity(product._id)}
                  onChange={(e) => setQuantity(product._id, Number(e.target.value))}
                />
                <button
                  className="primary-btn"
                  disabled={submittingId === product._id || product.stock <= 0}
                  onClick={() => handleCreateOrder(product)}
                >
                  {submittingId === product._id ? "下单中..." : "立即下单"}
                </button>
              </div>
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="ghost-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              上一页
            </button>
            <span className="pagination-info">
              第 {currentPage} / {totalPages} 页（共 {visibleProducts.length} 个商品）
            </span>
            <button
              className="ghost-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              下一页
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
