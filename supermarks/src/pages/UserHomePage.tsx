import { useEffect, useMemo, useRef, useState } from "react";
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

interface CartItem {
  product: ProductItem;
  quantity: number;
}

const STRIPE_CNY_MAX_AMOUNT = 999999.99;

function formatMoney(value: number): string {
  return `¥${value.toFixed(2)}`;
}

function launchCartBezierFlight(sourceElement: HTMLElement, targetElement: HTMLElement) {
  const sourceRect = sourceElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();
  const startX = sourceRect.left + sourceRect.width / 2;
  const startY = sourceRect.top + sourceRect.height / 2;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;
  const controlX = startX + (endX - startX) * 0.42;
  const controlY = Math.min(startY, endY) - Math.max(190, Math.abs(endX - startX) * 0.18);
  const duration = 880;
  const dot = document.createElement("span");

  dot.className = "cart-flight-dot";
  dot.style.transform = `translate3d(${startX}px, ${startY}px, 0) translate(-50%, -50%) scale(1)`;
  document.body.appendChild(dot);

  const startedAt = performance.now();

  function tick(now: number) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const t = 1 - Math.pow(1 - progress, 2.2);
    const oneMinusT = 1 - t;
    const x = oneMinusT * oneMinusT * startX + 2 * oneMinusT * t * controlX + t * t * endX;
    const y = oneMinusT * oneMinusT * startY + 2 * oneMinusT * t * controlY + t * t * endY;
    const squash = progress > 0.82 ? 1 - (progress - 0.82) * 0.9 : 1;

    dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${Math.max(squash, 0.74)})`;
    dot.style.opacity = String(progress > 0.9 ? 1 - (progress - 0.9) / 0.1 : 1);

    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }

    dot.remove();
    targetElement.classList.remove("cart-pop");
    void targetElement.offsetWidth;
    targetElement.classList.add("cart-pop");
  }

  requestAnimationFrame(tick);
}

export default function UserHomePage({ user }: UserHomePageProps) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);
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
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  );

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

  function handleAddToCart(product: ProductItem, event: React.MouseEvent<HTMLButtonElement>) {
    const quantity = getQuantity(product._id);
    const existingItem = cartItems.find((item) => item.product._id === product._id);
    const remainingStock = product.stock - (existingItem?.quantity || 0);

    if (quantity <= 0 || quantity > product.stock) {
      setError("加入购物车数量不合法");
      return;
    }

    if (remainingStock <= 0) {
      setError("购物车里该商品已达到库存上限");
      return;
    }

    const quantityToAdd = Math.min(quantity, remainingStock);

    setError("");
    setNotice(`${product.name} x${quantityToAdd} 已加入购物车`);
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (!existing) {
        return [...prev, { product, quantity: quantityToAdd }];
      }

      return prev.map((item) =>
        item.product._id === product._id
          ? { ...item, quantity: Math.min(item.quantity + quantityToAdd, product.stock) }
          : item
      );
    });

    if (cartButtonRef.current) {
      launchCartBezierFlight(event.currentTarget, cartButtonRef.current);
    }
  }

  function updateCartQuantity(productId: string, nextQuantity: number) {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.product._id === productId
            ? {
                ...item,
                quantity: Math.max(1, Math.min(nextQuantity, item.product.stock))
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeCartItem(productId: string) {
    setCartItems((prev) => prev.filter((item) => item.product._id !== productId));
  }

  async function handleCheckoutCart() {
    if (!cartItems.length) {
      setError("购物车还是空的");
      return;
    }

    if (!customer.name || !customer.phone || !customer.address) {
      setError("请先填写收货人、手机号和地址");
      return;
    }

    if (cartTotal > STRIPE_CNY_MAX_AMOUNT) {
      setError(`当前购物车金额超过 Stripe 单笔上限 ${formatMoney(STRIPE_CNY_MAX_AMOUNT)}，请拆分后再下单`);
      setCartOpen(true);
      return;
    }

    setCheckoutLoading(true);
    setError("");
    setNotice("");

    try {
      await orderApi.createOrder({
        customer,
        items: cartItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity
        })),
        paymentMethod: "微信支付"
      });
      setNotice(`购物车下单成功，共 ${cartCount} 件商品，请到我的订单完成支付`);
      setCartItems([]);
      setCartOpen(false);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "购物车下单失败");
    } finally {
      setCheckoutLoading(false);
    }
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

    const previewAmount = product.price * quantity;
    if (previewAmount > STRIPE_CNY_MAX_AMOUNT) {
      setError(`当前商品订单金额超过 Stripe 单笔上限 ${formatMoney(STRIPE_CNY_MAX_AMOUNT)}，请调整数量后再下单`);
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
                  className="ghost-btn cart-add-btn"
                  disabled={product.stock <= 0}
                  onClick={(event) => handleAddToCart(product, event)}
                >
                  加入购物车
                </button>
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

      <aside className={`floating-cart ${cartOpen ? "open" : ""}`}>
        {cartOpen ? (
          <div className="floating-cart-panel">
            <div className="cart-panel-head">
              <div>
                <strong>购物车</strong>
                <p className="muted">合并下单后可一起支付</p>
              </div>
              <button className="ghost-btn cart-mini-btn" onClick={() => setCartItems([])} disabled={!cartItems.length}>
                清空
              </button>
            </div>

            {cartItems.length ? (
              <div className="cart-item-list">
                {cartItems.map((item) => (
                  <div className="cart-item" key={item.product._id}>
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} />
                    ) : (
                      <div className="cart-item-fallback">无图</div>
                    )}
                    <div className="cart-item-main">
                      <strong>{item.product.name}</strong>
                      <span>{formatMoney(item.product.price)} / 库存 {item.product.stock}</span>
                      <div className="cart-qty-tools">
                        <button onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)}>-</button>
                        <input
                          value={item.quantity}
                          type="number"
                          min={1}
                          max={item.product.stock}
                          onChange={(event) => updateCartQuantity(item.product._id, Number(event.target.value))}
                        />
                        <button onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)}>+</button>
                        <button className="cart-remove" onClick={() => removeCartItem(item.product._id)}>
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted cart-empty">先把想买的零食加入购物车吧。</p>
            )}

            {cartTotal > STRIPE_CNY_MAX_AMOUNT ? (
              <p className="error-text cart-limit-note">
                当前购物车金额已超过 Stripe 单笔上限 {formatMoney(STRIPE_CNY_MAX_AMOUNT)}，请删减部分商品后再下单。
              </p>
            ) : null}

            <div className="cart-checkout-bar">
              <div>
                <span className="muted">合计 {cartCount} 件</span>
                <strong>{formatMoney(cartTotal)}</strong>
              </div>
              <button
                className="primary-btn"
                disabled={!cartItems.length || checkoutLoading || cartTotal > STRIPE_CNY_MAX_AMOUNT}
                onClick={handleCheckoutCart}
              >
                {checkoutLoading ? "结算中..." : "一起支付"}
              </button>
            </div>
          </div>
        ) : null}

        <button
          ref={cartButtonRef}
          className="floating-cart-button"
          onClick={() => setCartOpen((prev) => !prev)}
          aria-label="打开购物车"
        >
          <span className="cart-button-mark">CART</span>
          <strong>{cartCount}</strong>
          <small>{formatMoney(cartTotal)}</small>
        </button>
      </aside>
    </div>
  );
}
