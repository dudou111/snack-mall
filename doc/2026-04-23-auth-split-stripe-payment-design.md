# 账号隔离与 Stripe 测试支付设计
> 日期：2026-04-23
> 范围：`server`、`supermarks`、`react-oa`
> 状态：已确认方案，待实施计划

## 背景

当前 `supermarks` 和 `react-oa` 都复用 `server` 的 `/api/auth/*` 登录注册接口，并且后端主要依赖同一个 `users` 集合识别用户、商家和管理员。这会导致前台用户/商家账号和后台管理员账号混在一起，不符合系统设定。

目标业务设定是：

- `supermarks` 是商城前台，支持普通用户和商家。
- 普通用户在 `supermarks` 浏览商品、下单、支付、申请退款。
- 商家在 `supermarks` 上传商品、查看自己相关订单、更新物流状态。
- `react-oa` 是后台管理端，只允许管理员登录。
- 管理员在 `react-oa` 查看和管理前台产生的订单、支付、物流和退款状态。

因此需要拆分账号体系，但不能拆分核心业务数据。

## 目标

- `supermarks` 与 `react-oa` 不再共用登录注册账号体系。
- `supermarks` 的注册登录只服务普通用户和商家。
- `react-oa` 的登录只服务管理员，不开放前台用户或商家注册。
- 商品、订单、物流、退款等业务数据继续共用同一个商城数据库。
- 用户在 `supermarks` 产生的订单、支付、物流、退款状态，管理员在 `react-oa` 登录后可以查看和处理。
- 将当前纯后端 mock 支付升级为 Stripe 测试模式支付流程。

## 非目标

- 不拆成两个 MongoDB 数据库。
- 不让 `react-oa` 用户表承担前台用户/商家身份。
- 不把普通用户或商家账号授权进入 `react-oa`。
- 不在本轮接入真实生产支付扣款。
- 不重做订单、商品、退款页面的整体 UI。

## 推荐方案

采用“双账号体系，单业务库关联”。

认证数据分离：

- `supermarks_users`：保存前台普通用户和商家账号。
- `admin_users`：保存后台管理员账号。

业务数据共享：

- `products`：商家上传商品，管理员可查看和管理。
- `orders`：用户下单生成订单，商家和管理员按权限查看。
- `orders.paymentStatus`：记录支付状态。
- `orders.deliveryStatus`：记录物流状态。
- `orders.refund`：记录退款申请和审核状态。

核心原则：

- 分离的是“谁能登录哪里”。
- 打通的是“登录后产生和管理的商城业务数据”。

## 认证设计

### 前台认证

新增前台认证模块，例如：

- `POST /api/shop-auth/register`
- `POST /api/shop-auth/login`
- `GET /api/shop-auth/check_login`

前台账号规则：

- 允许注册 `user` 和 `merchant`。
- 不允许注册 `admin`。
- 登录成功后 token 标记账号域为 `shop`。
- token 中保留 `_id`、`username`、`role`、`authScope` 等必要字段。

前台用户集合建议命名为 `supermarks_users`。

### 后台认证

新增后台认证模块，例如：

- `POST /api/admin-auth/login`
- `GET /api/admin-auth/check_login`

后台账号规则：

- 不提供公开注册接口。
- 初始化或脚本创建默认管理员，例如 `root / 123456`。
- 只有 `admin_users` 集合中的启用管理员可以登录。
- 登录成功后 token 标记账号域为 `admin`。

后台管理员集合建议命名为 `admin_users`。

### Token 与中间件

新增统一认证中间件能力：

- 前台接口使用前台认证中间件，只查 `supermarks_users`。
- 后台管理接口使用后台认证中间件，只查 `admin_users`。
- 共用业务接口使用可识别双 token 的中间件，根据 token 的 `authScope` 查询对应集合。

请求进入业务控制器后，统一把用户信息挂到 `req.userInfo`：

- 前台普通用户：`role = user`
- 前台商家：`role = merchant`
- 后台管理员：`role = admin`

这样订单、商品、退款控制器可以继续用角色判断业务权限。

## 业务权限设计

### 商品

- 商家可以在 `supermarks` 上传商品。
- 商品记录继续保存 `merchantId`，指向前台商家账号。
- 商家只能看到和管理自己上传的商品。
- 管理员在 `react-oa` 可以看到全部商品。

### 订单

- 普通用户在 `supermarks` 创建订单。
- 订单记录保存 `buyerId`，指向前台普通用户账号。
- 订单记录保存 `merchantIds`，指向涉及商品的前台商家账号。
- 普通用户只能看到自己的订单。
- 商家只能看到涉及自己商品的订单。
- 管理员可以看到全部订单。

### 物流

- 未支付订单不能发货。
- 商家可更新自己相关订单的物流状态。
- 管理员可在 `react-oa` 查看和管理全部物流状态。
- 普通用户只查看物流状态，不更新物流。

### 退款

- 用户可对已支付且未送达订单发起退款。
- 退款申请写入订单的 `refund` 字段，初始为 `待处理`。
- 管理员在 `react-oa` 的退款审核页处理 `通过` 或 `驳回`。
- 退款通过后更新订单支付状态为 `已退款`，订单状态变为 `已取消`。

## Stripe 测试支付设计

### 支付模式

使用 Stripe 测试模式，不接入真实生产扣款。

依据 Stripe 推荐流程：

1. 后端创建 `PaymentIntent`。
2. 后端把 `client_secret` 返回给前端。
3. 前端使用 Stripe.js 根据 `client_secret` 确认支付。
4. 支付成功后，后端确认支付结果并更新订单。

Stripe 参考文档：

- PaymentIntents：https://docs.stripe.com/payments/payment-intents
- 测试卡：https://docs.stripe.com/testing

### 后端接口

建议新增或替换支付接口：

- `POST /api/order/pay/stripe-intent`
- `POST /api/order/pay/stripe-confirm`

`stripe-intent` 输入：

```json
{
  "orderId": "订单ID"
}
```

`stripe-intent` 行为：

- 验证订单存在。
- 验证当前登录用户有权支付该订单。
- 验证订单未支付且未退款。
- 使用订单 `actualAmount` 创建 Stripe `PaymentIntent`。
- 保存 `stripePaymentIntentId` 到订单。
- 返回 `clientSecret` 给前端。

`stripe-confirm` 输入：

```json
{
  "orderId": "订单ID",
  "paymentIntentId": "Stripe PaymentIntent ID"
}
```

`stripe-confirm` 行为：

- 向 Stripe 查询 PaymentIntent。
- 确认为 `succeeded` 后更新订单：
  - `paymentStatus = 已支付`
  - `status = 待发货`
  - `paymentMethod = Stripe测试支付`
  - `paymentTime = 当前时间`
  - `paymentMockNo = paymentIntentId`
- 如果失败，保存失败原因到 `paymentFailReason`。

### 数据模型补充

订单模型建议扩展：

- `stripePaymentIntentId`
- `stripeClientSecretLast4` 或不存 `client_secret`
- `paymentProvider = stripe_test`
- `paymentFailReason`

注意：不应把完整 `client_secret` 当成长期业务数据存储。

### 前端流程

用户在 `supermarks` 的“我的订单”中：

1. 点击未支付订单的“Stripe 测试支付”。
2. 前端请求 `/api/order/pay/stripe-intent`。
3. 前端展示测试支付表单或测试支付按钮。
4. 使用测试卡号完成支付。
5. 前端请求 `/api/order/pay/stripe-confirm` 同步后端订单状态。
6. 页面刷新订单列表，显示 `已支付 / 待发货`。

测试卡提示：

- 成功卡：`4242 4242 4242 4242`
- 到期时间：任意未来日期
- CVC：任意 3 位数字

## 前端改动范围

### `supermarks`

- 认证 API 改打 `/api/shop-auth/*`。
- 保存前台 token，不再和后台 token 语义混用。
- 用户订单页将当前“模拟支付成功/失败”按钮替换为 Stripe 测试支付流程。
- 订单列表继续显示支付状态、物流状态、退款状态。
- 商家工作台继续显示自己相关订单，并保留物流更新能力。

### `react-oa`

- 登录 API 改打 `/api/admin-auth/*`。
- 登录成功后只保存管理员 token。
- 订单列表继续打 `/api/order/list`，管理员 token 可返回全量订单。
- 退款审核继续打 `/api/order/refund/list` 和 `/api/order/refund/review/:id`。
- 后台登录/注册页面不再创建或登录前台用户。

## 后端改动范围

- 新增前台用户模型：`server/model/shopUser.js`。
- 新增管理员模型：`server/model/adminUser.js`。
- 新增前台认证控制器与路由。
- 新增后台认证控制器与路由。
- 改造认证中间件，支持前台、后台和业务双域认证。
- 修改商品、订单相关模型引用，使业务字段可以关联前台用户/商家账号。
- 增加 Stripe 支付服务或控制器逻辑。
- 更新启动初始化逻辑，确保默认管理员存在于 `admin_users`。

## 环境变量

后端需要：

```env
STRIPE_SECRET_KEY=<your_stripe_test_secret_key>
JWT_SECRET=QW
```

前端 `supermarks` 需要：

```env
VITE_STRIPE_PUBLISHABLE_KEY=<your_stripe_test_publishable_key>
```

当前项目里还没有检测到 `stripe`、`@stripe/stripe-js` 或 `@stripe/react-stripe-js` 依赖，实施时需要补充依赖。

## 验证方案

### 认证验证

- `supermarks` 注册普通用户后，可以登录 `supermarks`。
- `supermarks` 注册商家后，可以登录 `supermarks`。
- 前台用户或商家不能登录 `react-oa`。
- 管理员可以登录 `react-oa`。
- 管理员账号不能通过 `supermarks` 注册产生。

### 业务验证

- 商家上传商品后，用户能看到商品。
- 用户下单后，订单写入共享 `orders` 集合。
- 用户能看到自己的订单。
- 商家能看到涉及自己商品的订单。
- 管理员能在 `react-oa` 看到该订单。

### 支付验证

- 未支付订单可以创建 Stripe 测试支付。
- 使用 Stripe 测试卡支付成功后，订单变为 `已支付 / 待发货`。
- 支付失败时订单保持 `未支付 / 待支付`，并记录失败原因。
- 管理端订单列表可以看到支付状态变化。

### 退款验证

- 用户对已支付未送达订单申请退款。
- 管理员在 `react-oa` 退款审核页看到申请。
- 管理员通过退款后，订单变为 `已退款 / 已取消`。
- 管理员驳回退款后，用户能看到驳回原因。

## 风险与缓解

- 风险：拆认证后旧 token 不再有效。
  - 缓解：前端登录态清理后重新登录即可。
- 风险：旧 `users` 数据和新集合之间存在迁移成本。
  - 缓解：开发环境可保留旧集合，仅将新登录注册写入新集合；必要时增加迁移脚本。
- 风险：订单模型引用原 `User` 模型，拆分后 populate 不再准确。
  - 缓解：订单核心显示字段已冗余保存客户和商品信息，权限判断优先使用 ObjectId 字符串，不依赖 populate。
- 风险：Stripe 密钥未配置导致支付不可用。
  - 缓解：后端启动或支付接口返回明确配置错误，前端展示“Stripe 测试密钥未配置”。
- 风险：网络环境无法访问 Stripe。
  - 缓解：保留开发兜底提示，不再把本地 mock 伪装成真实支付成功。

## 验收标准

- `supermarks` 和 `react-oa` 的登录注册账号体系已经拆分。
- `react-oa` 只能由管理员账号登录。
- `supermarks` 用户/商家产生的商品、订单、物流、退款数据能被 `react-oa` 管理员查看。
- Stripe 测试支付能把订单从 `未支付` 推进到 `已支付`。
- 退款申请和审核流程能跨 `supermarks` 与 `react-oa` 正常闭环。
